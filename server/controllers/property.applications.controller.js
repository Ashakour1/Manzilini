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

        // Create the property application with unique ID
        const propertyApplication = await generateUniqueIdAndCreate(
            'PropertyApplication',
            async (tx, uniqueId) => {
                return await tx.propertyApplication.create({
                    data: { 
                        id: uniqueId,
                        propertyId, 
                        landlordId,
                        fullName,
                        email: email || null,
                        phone,
                        message: message || null
                    },
                    include: {
                        property: {
                            include: {
                                images: true,
                                landlord: true
                            }
                        },
                        landlord: true
                    }
                });
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
        if (landlordId) whereClause.landlordId = landlordId;
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
        const { status, remarks } = req.body || {};
        
        // Check if application exists
        const existingApplication = await prisma.propertyApplication.findUnique({
            where: { id }
        });

        if (!existingApplication) {
            return res.status(404).json({ message: 'Property application not found' });
        }

        // Validate status if provided
        const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
            });
        }

        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (remarks !== undefined) updateData.remarks = remarks;

        const propertyApplication = await prisma.propertyApplication.update({
            where: { id },
            data: updateData,
            include: {
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
export const getPropertyApplicationsByLandlord = asyncHandler(async (req, res) => {
    try {
        const { landlordId } = req.params;
        const { status } = req.query;
        
        if (!landlordId) {
            return res.status(400).json({ message: 'Landlord ID is required' });
        }

        const whereClause = { landlordId };
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