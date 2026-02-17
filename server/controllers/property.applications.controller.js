import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';
import { generateUniqueIdAndCreate } from '../utils/idGenerator.js';


export const createPropertyApplication = asyncHandler(async (req, res) => {
    try {
        const { propertyId, landlordId, fullName, email, phone, message } = req.body || {};
        
        if (!propertyId || !landlordId || !fullName || !phone) {
            return res.status(400).json({ 
                message: 'Please provide propertyId, landlordId, fullName, and phone' 
            });
        }

        // Check if the property exists
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: { landlord: true }
        });
        
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Check if the landlord exists
        const landlord = await prisma.landlord.findUnique({
            where: { id: landlordId }
        });

        if (!landlord) {
            return res.status(404).json({ message: 'Landlord not found' });
        }

        // Check if the applicant has already applied to this property (by email or phone)
        const existingApplication = await prisma.propertyApplication.findFirst({
            where: { 
                propertyId,
                OR: [
                    { email: email || undefined },
                    { phone }
                ]
            },
        });
        
        if (existingApplication) {
            return res.status(400).json({ 
                message: 'You have already applied to this property. Please wait for the landlord to review your application.' 
            });
        }

        // Find or create tenant by phone (phone is unique)
        let tenant = await prisma.tenant.findUnique({
            where: { phone }
        });

        if (!tenant) {
            // Create new tenant with unique ID
            tenant = await generateUniqueIdAndCreate(
                'Tenant',
                async (tx, uniqueId) => {
                    return await tx.tenant.create({
                        data: {
                            id: uniqueId,
                            fullName,
                            email: email || null,
                            phone,
                            status: 'NEW',
                            lastActivityAt: new Date(),
                            applicationsCount: 0
                        }
                    });
                }
            );
        } else {
            // Update tenant info if email is provided and different
            if (email && email !== tenant.email) {
                // Check if email is already taken by another tenant
                const existingTenantWithEmail = await prisma.tenant.findUnique({
                    where: { email }
                });
                
                if (!existingTenantWithEmail) {
                    tenant = await prisma.tenant.update({
                        where: { id: tenant.id },
                        data: { email, fullName, lastActivityAt: new Date() }
                    });
                } else {
                    tenant = await prisma.tenant.update({
                        where: { id: tenant.id },
                        data: { fullName, lastActivityAt: new Date() }
                    });
                }
            } else {
                // Just update name and activity
                tenant = await prisma.tenant.update({
                    where: { id: tenant.id },
                    data: { fullName, lastActivityAt: new Date() }
                });
            }
        }

        // Create the property application with unique ID
        const propertyApplication = await generateUniqueIdAndCreate(
            'PropertyApplication',
            async (tx, uniqueId) => {
                // Create application
                const application = await tx.propertyApplication.create({
                    data: { 
                        id: uniqueId,
                        tenantId: tenant.id,
                        propertyId, 
                        landlordId,
                        fullName,
                        email: email || null,
                        phone,
                        message: message || null
                    },
                    include: {
                        tenant: true,
                        property: {
                            include: {
                                images: true,
                                landlord: true
                            }
                        },
                        landlord: true
                    }
                });

                // Increment tenant applications count
                await tx.tenant.update({
                    where: { id: tenant.id },
                    data: { 
                        applicationsCount: { increment: 1 },
                        lastActivityAt: new Date()
                    }
                });

                // Create tenant activity
                await tx.tenantActivity.create({
                    data: {
                        tenantId: tenant.id,
                        applicationId: application.id,
                        type: 'APPLICATION_SENT',
                        description: `Applied for property: ${property.title}`
                    }
                });

                return application;
            }
        );

        res.status(201).json(propertyApplication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



export const getPropertyApplications = asyncHandler(async (req, res) => {
    try {
        const { propertyId, landlordId, status } = req.query;
        
        const whereClause = {};
        if (propertyId) whereClause.propertyId = propertyId;
        if (landlordId) {
            whereClause.landlordId = landlordId;
            // Only fetch approved applications when filtering by landlordId
            whereClause.isApproved = true;
        }
        if (status) whereClause.status = status;

        const propertyApplications = await prisma.propertyApplication.findMany({
            where: whereClause,
            include: {
                property: {
                    include: {
                        images: true,
                        landlord: true
                    }
                },
                landlord: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        res.status(200).json(propertyApplications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export const getPropertyApplicationById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        
        const propertyApplication = await prisma.propertyApplication.findUnique({
            where: { id },
            include: {
                tenant: true,
                property: {
                    include: {
                        images: true,
                        landlord: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true
                            }
                        }
                    }
                },
                landlord: true
            }
        });

        if (!propertyApplication) {
            return res.status(404).json({ message: 'Property application not found' });
        }
        
        res.status(200).json(propertyApplication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export const updatePropertyApplication = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            status, 
            isApproved,
            adminApprovalStatus,
            remarks,
            emailSent,
            emailSentAt,
            isCommunicated,
            communicatedAt,
            viewingRequested,
            viewingDate
        } = req.body || {};
        
        // Check if application exists
        const existingApplication = await prisma.propertyApplication.findUnique({
            where: { id }
        });

        if (!existingApplication) {
            return res.status(404).json({ message: 'Property application not found' });
        }

        // Validate status if provided
        const validStatuses = ['PENDING', 'CONTACTED', 'APPROVED', 'REJECTED', 'CLOSED'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
            });
        }

        const updateData = {};
        
        // Handle status change tracking
        // Status and isApproved are independent - status is for workflow, isApproved is for landlord visibility
        if (status !== undefined && status !== existingApplication.status) {
            updateData.status = status;
            updateData.statusChangedAt = new Date();
            // Get user ID from request (if authenticated)
            updateData.statusChangedBy = req.user?.id || null;

            // Create tenant activity for status change
            if (existingApplication.tenantId) {
                await prisma.tenantActivity.create({
                    data: {
                        tenantId: existingApplication.tenantId,
                        applicationId: existingApplication.id,
                        type: status === 'CONTACTED' ? 'CONTACTED' : 
                              status === 'APPROVED' ? 'APPROVED' : 
                              status === 'REJECTED' ? 'REJECTED' : 'STATUS_CHANGED',
                        description: `Application status changed to ${status}`
                    }
                });

                // Update tenant last activity
                await prisma.tenant.update({
                    where: { id: existingApplication.tenantId },
                    data: { lastActivityAt: new Date() }
                });
            }
        }
        
        // Handle admin approval tracking
        // Support both isApproved (legacy) and adminApprovalStatus (new)
        if (adminApprovalStatus !== undefined) {
            const validAdminStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
            if (!validAdminStatuses.includes(adminApprovalStatus)) {
                return res.status(400).json({ 
                    message: `Invalid adminApprovalStatus. Must be one of: ${validAdminStatuses.join(', ')}` 
                });
            }
            updateData.adminApprovalStatus = adminApprovalStatus;
            
            // Track approval/rejection with timestamp and user
            if (adminApprovalStatus === 'APPROVED') {
                updateData.adminApprovedAt = new Date();
                updateData.adminApprovedBy = req.user?.id || null;
                updateData.isApproved = true; // For backward compatibility
            } else if (adminApprovalStatus === 'REJECTED') {
                // Keep the timestamp and user for audit trail even when rejected
                // This shows who rejected it and when
                updateData.adminApprovedAt = new Date();
                updateData.adminApprovedBy = req.user?.id || null;
                updateData.isApproved = false;
            } else {
                // PENDING - reset approval tracking
                updateData.adminApprovedAt = null;
                updateData.adminApprovedBy = null;
                updateData.isApproved = false;
            }
        } else if (isApproved !== undefined) {
            // Legacy support: if isApproved is provided, update adminApprovalStatus accordingly
            updateData.isApproved = isApproved;
            updateData.adminApprovalStatus = isApproved ? 'APPROVED' : 'PENDING';
            if (isApproved) {
                updateData.adminApprovedAt = new Date();
                updateData.adminApprovedBy = req.user?.id || null;
            } else {
                updateData.adminApprovedAt = null;
                updateData.adminApprovedBy = null;
            }
        }
        
        if (remarks !== undefined) updateData.remarks = remarks;
        
        // Communication tracking fields
        if (emailSent !== undefined) updateData.emailSent = emailSent;
        if (emailSentAt !== undefined) {
            updateData.emailSentAt = emailSentAt ? new Date(emailSentAt) : null;
        }
        
        if (isCommunicated !== undefined) updateData.isCommunicated = isCommunicated;
        if (communicatedAt !== undefined) {
            updateData.communicatedAt = communicatedAt ? new Date(communicatedAt) : null;
        }
        
        if (viewingRequested !== undefined) updateData.viewingRequested = viewingRequested;
        if (viewingDate !== undefined) {
            updateData.viewingDate = viewingDate ? new Date(viewingDate) : null;
        }

        const propertyApplication = await prisma.propertyApplication.update({
            where: { id },
            data: updateData,
            include: {
                tenant: true,
                property: {
                    include: {
                        images: true,
                        landlord: true
                    }
                },
                landlord: true
            }
        });
        
        res.status(200).json(propertyApplication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export const deletePropertyApplication = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if application exists
        const existingApplication = await prisma.propertyApplication.findUnique({
            where: { id }
        });

        if (!existingApplication) {
            return res.status(404).json({ message: 'Property application not found' });
        }

        // Delete related payments first (if any)
        await prisma.payment.deleteMany({
            where: { applicationId: id }
        });

        // Delete the application
        await prisma.propertyApplication.delete({
            where: { id }
        });
        
        res.status(200).json({ message: 'Property application deleted successfully', id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get property applications by email or phone (for tenant lookup)
export const getPropertyApplicationsByTenant = asyncHandler(async (req, res) => {
    try {
        const { email, phone } = req.query;
        
        if (!email && !phone) {
            return res.status(400).json({ 
                message: 'Either email or phone is required' 
            });
        }

        const whereClause = {};
        if (email) whereClause.email = email;
        if (phone) whereClause.phone = phone;

        const propertyApplications = await prisma.propertyApplication.findMany({
            where: whereClause,
            include: {
                tenant: true,
                property: {
                    include: {
                        images: true,
                        landlord: true
                    }
                },
                landlord: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        res.status(200).json(propertyApplications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get property applications by landlord
// Only returns applications that have been approved by admin (isApproved: true)
export const getPropertyApplicationsByLandlord = asyncHandler(async (req, res) => {
    try {
        const { landlordId } = req.params;
        const { status } = req.query;
        
        if (!landlordId) {
            return res.status(400).json({ message: 'Landlord ID is required' });
        }

        // Only show applications that have been approved by admin
        const whereClause = { 
            landlordId,
            isApproved: true  // Only fetch applications where isApproved is true
        };
        if (status) whereClause.status = status;

        const propertyApplications = await prisma.propertyApplication.findMany({
            where: whereClause,
            include: {
                tenant: true,
                property: {
                    include: {
                        images: true,
                        landlord: true
                    }
                },
                landlord: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        res.status(200).json(propertyApplications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});