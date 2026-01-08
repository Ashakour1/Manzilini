import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';

// Get comprehensive reports with user statistics
export const getReports = asyncHandler(async (req, res) => {
    try {
        // Get overall statistics
        const [
            totalUsers,
            totalLandlords,
            totalProperties,
            totalApplications,
            totalPayments,
            totalFieldAgents,
            propertiesByStatus,
            propertiesByType,
            applicationsByStatus,
            paymentsByStatus
        ] = await Promise.all([
            prisma.user.count(),
            prisma.landlord.count(),
            prisma.property.count(),
            prisma.propertyApplication.count(),
            prisma.payment.count(),
            prisma.fieldAgent.count(),
            prisma.property.groupBy({
                by: ['status'],
                _count: true
            }),
            prisma.property.groupBy({
                by: ['property_type'],
                _count: true
            }),
            // prisma.propertyApplication.groupBy({
            //     by: ['status'],
            //     _count: true
            // }),
            prisma.payment.groupBy({
                by: ['status'],
                _count: true
            })
        ]);

        // Get all users with their statistics
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
                // _count: {
                //     select: {
                //         property_applications: true
                //     }
                // }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get user statistics with property applications details
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                // Get property applications for this user
                const applications = await prisma.propertyApplication.findMany({
                    where: {
                        tenantId: user.id
                    },
                    include: {
                        property: {
                            select: {
                                id: true,
                                title: true,
                                status: true,
                                price: true
                            }
                        }
                    }
                });

                // Calculate total application value
                const totalApplicationValue = applications.reduce((sum, app) => {
                    return sum + (app.property?.price || 0);
                }, 0);

                return {
                    ...user,
                    totalApplicationValue,
                    applicationsByStatus: {
                        pending: applications.filter(a => a.status === 'PENDING').length,
                        approved: applications.filter(a => a.status === 'APPROVED').length,
                        rejected: applications.filter(a => a.status === 'REJECTED').length
                    }
                };
            })
        );

        // Calculate revenue statistics
        const completedPayments = await prisma.payment.findMany({
            where: {
                status: 'COMPLETED'
            },
            select: {
                amount: true
            }
        });

        const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);

        // Get recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentProperties = await prisma.property.count({
            where: {
                createdAt: {
                    gte: thirtyDaysAgo
                }
            }
        });

        const recentLandlords = await prisma.landlord.count({
            where: {
                createdAt: {
                    gte: thirtyDaysAgo
                }
            }
        });

        const recentApplications = await prisma.propertyApplication.count({
            where: {
                createdAt: {
                    gte: thirtyDaysAgo
                }
            }
        });

        // Response structure
        const reports = {
            overall: {
                totalUsers,
                totalLandlords,
                totalProperties,
                totalApplications,
                totalPayments,
                totalFieldAgents,
                totalRevenue,
                recentActivity: {
                    propertiesCreated: recentProperties,
                    landlordsCreated: recentLandlords,
                    applicationsSubmitted: recentApplications
                }
            },
            properties: {
                byStatus: propertiesByStatus.map(item => ({
                    status: item.status,
                    count: item._count
                })),
                byType: propertiesByType.map(item => ({
                    type: item.property_type,
                    count: item._count
                }))
            },
            applications: {
                byStatus: applicationsByStatus.map(item => ({
                    status: item.status,
                    count: item._count
                }))
            },
            payments: {
                byStatus: paymentsByStatus.map(item => ({
                    status: item.status,
                    count: item._count
                }))
            },
            users: usersWithStats.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image,
                createdAt: user.createdAt,
                statistics: {
                    // propertyApplicationsCount: user.propertyApplicationsCount,
                    totalApplicationValue: user.totalApplicationValue,
                    applicationsByStatus: user.applicationsByStatus,
                    // Note: Landlords and properties created count would require schema changes
                    // to track createdBy field on Property and Landlord models
                }
            }))
        };

        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

