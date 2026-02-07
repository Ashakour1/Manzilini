import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';

// Get all tenants
export const getTenants = asyncHandler(async (req, res) => {
    try {
        const { status, search } = req.query;
        
        const whereClause = {};
        if (status) whereClause.status = status;
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
        
        res.status(200).json(tenants);
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
        const { fullName, email, phone, status } = req.body || {};
        
        if (!fullName || !phone) {
            return res.status(400).json({ 
                message: 'Please provide fullName and phone' 
            });
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

        const tenant = await prisma.tenant.create({
            data: {
                fullName,
                email: email || null,
                phone,
                status: status || 'NEW',
                lastActivityAt: new Date(),
                applicationsCount: 0
            },
            include: {
                _count: {
                    select: {
                        applications: true,
                        activities: true
                    }
                }
            }
        });

        // Create activity
        await prisma.tenantActivity.create({
            data: {
                tenantId: tenant.id,
                type: 'STATUS_CHANGED',
                description: 'Tenant created'
            }
        });

        res.status(201).json(tenant);
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
