import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';
import { generateUniqueIdAndCreate } from '../utils/idGenerator.js';

// Get all tenants
export const getTenants = asyncHandler(async (req, res) => {
    try {
        const { status, search, landlordId } = req.query;
        const userId = req.user?.id;
        
        const whereClause = {};
        let landlordIdForProps = null;
        if (status) whereClause.status = status;
        
        // If landlordId is provided, use it. Otherwise, if user is a landlord, auto-filter by their landlord profile
        if (landlordId) {
            whereClause.landlordId = landlordId;
        } else if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, role: true }
            });
            if (user?.role === 'LANDLORD' && user.email) {
                const landlord = await prisma.landlord.findUnique({
                    where: { email: user.email },
                    select: { id: true }
                });
                if (landlord) {
                    whereClause.landlordId = landlord.id;
                    landlordIdForProps = landlord.id;
                }
            }
        }
        
        if (search) {
            whereClause.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } }
            ];
        }

        const tenants = await prisma.tenant.findMany({
            where: whereClause,
            include: {
                property: { select: { id: true, title: true, city: true } },
                applications: {
                    include: {
                        property: {
                            select: {
                                id: true,
                                title: true,
                                city: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 5 // Get latest 5 applications
                },
                _count: {
                    select: {
                        applications: true,
                        activities: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // When LANDLORD, include properties in response (avoids separate /properties/landlord call)
        let properties = [];
        if (landlordIdForProps) {
            properties = await prisma.property.findMany({
                where: { landlord_id: landlordIdForProps },
                select: { id: true, title: true }
            });
        }

        res.status(200).json({ tenants, properties });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get tenant by ID
export const getTenantById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        
        const tenant = await prisma.tenant.findUnique({
            where: { id },
            include: {
                applications: {
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
                },
                activities: {
                    include: {
                        application: {
                            select: {
                                id: true,
                                property: {
                                    select: {
                                        id: true,
                                        title: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        applications: true,
                        activities: true
                    }
                }
            }
        });

        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        
        res.status(200).json(tenant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create tenant
export const createTenant = asyncHandler(async (req, res) => {
    try {
        const { fullName, email, phone, status, landlordId } = req.body || {};
        const userId = req.user?.id;
        
        if (!fullName || !phone) {
            return res.status(400).json({ 
                message: 'Please provide fullName and phone' 
            });
        }

        // Get the logged-in user to find their landlord profile
        let finalLandlordId = landlordId;
        if (!finalLandlordId && userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                }
            });

            // If user has LANDLORD role, find landlord by email
            if (user && user.role === 'LANDLORD' && user.email) {
                const landlord = await prisma.landlord.findUnique({
                    where: { email: user.email },
                    select: { id: true }
                });
                if (landlord) {
                    finalLandlordId = landlord.id;
                }
            }
        }

        // Check if tenant with phone already exists
        const existingTenant = await prisma.tenant.findUnique({
            where: { phone }
        });

        if (existingTenant) {
            return res.status(400).json({ 
                message: 'Tenant with this phone number already exists' 
            });
        }

        // Check if email is already taken (if provided)
        if (email) {
            const existingTenantWithEmail = await prisma.tenant.findUnique({
                where: { email }
            });

            if (existingTenantWithEmail) {
                return res.status(400).json({ 
                    message: 'Tenant with this email already exists' 
                });
            }
        }

        const tenant = await generateUniqueIdAndCreate(
            'Tenant',
            async (tx, uniqueId) => {
                const tenantData = {
                    id: uniqueId,
                    fullName,
                    email: email || null,
                    phone,
                    status: status || 'NEW',
                    lastActivityAt: new Date(),
                    applicationsCount: 0,
                };

                // Add user relation (who created this tenant)
                if (userId) {
                    tenantData.createdByUser = {
                        connect: { id: userId }
                    };
                }

                // Add landlord relation if we found a landlordId
                if (finalLandlordId) {
                    tenantData.landlord = {
                        connect: { id: finalLandlordId }
                    };
                }

                const createdTenant = await tx.tenant.create({
                    data: tenantData
                });

                // Create activity within the same transaction
                await tx.tenantActivity.create({
                    data: {
                        tenantId: createdTenant.id,
                        type: 'STATUS_CHANGED',
                        description: 'Tenant created'
                    }
                });

                return createdTenant;
            }
        );

        // Fetch tenant with counts after creation
        const tenantWithCounts = await prisma.tenant.findUnique({
            where: { id: tenant.id },
            include: {
                _count: {
                    select: {
                        applications: true,
                        activities: true
                    }
                }
            }
        });

        res.status(201).json(tenantWithCounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update tenant
export const updateTenant = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, phone, status } = req.body || {};
        
        // Check if tenant exists
        const existingTenant = await prisma.tenant.findUnique({
            where: { id }
        });

        if (!existingTenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // Check if phone is already taken by another tenant
        if (phone && phone !== existingTenant.phone) {
            const tenantWithPhone = await prisma.tenant.findUnique({
                where: { phone }
            });

            if (tenantWithPhone) {
                return res.status(400).json({ 
                    message: 'Phone number is already taken by another tenant' 
                });
            }
        }

        // Check if email is already taken by another tenant
        if (email && email !== existingTenant.email) {
            const tenantWithEmail = await prisma.tenant.findUnique({
                where: { email }
            });

            if (tenantWithEmail) {
                return res.status(400).json({ 
                    message: 'Email is already taken by another tenant' 
                });
            }
        }

        const updateData = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (email !== undefined) updateData.email = email || null;
        if (phone !== undefined) updateData.phone = phone;
        if (status !== undefined) {
            updateData.status = status;
            updateData.lastActivityAt = new Date();
            
            // Create activity for status change
            await prisma.tenantActivity.create({
                data: {
                    tenantId: id,
                    type: 'STATUS_CHANGED',
                    description: `Status changed to ${status}`
                }
            });
        }

        const tenant = await prisma.tenant.update({
            where: { id },
            data: updateData,
            include: {
                _count: {
                    select: {
                        applications: true,
                        activities: true
                    }
                }
            }
        });
        
        res.status(200).json(tenant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete tenant
export const deleteTenant = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if tenant exists
        const existingTenant = await prisma.tenant.findUnique({
            where: { id }
        });

        if (!existingTenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // Delete related activities first
        await prisma.tenantActivity.deleteMany({
            where: { tenantId: id }
        });

        // Delete the tenant
        await prisma.tenant.delete({
            where: { id }
        });
        
        res.status(200).json({ message: 'Tenant deleted successfully', id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get tenant activities
export const getTenantActivities = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50 } = req.query;
        
        const activities = await prisma.tenantActivity.findMany({
            where: { tenantId: id },
            include: {
                application: {
                    select: {
                        id: true,
                        property: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: parseInt(limit)
        });
        
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
