import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';

// Get comprehensive reports with user statistics
export const getReports = asyncHandler(async (req, res) => {
    try {
        // Get month filter from query params (format: YYYY-MM)
        const monthFilter = req.query.month; // e.g., "2024-01"
        let dateFilter = {};
        
        if (monthFilter) {
            const [year, month] = monthFilter.split('-').map(Number);
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);
            
            dateFilter = {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            };
        }

        // Get overall statistics
        const [
            totalUsers,
            totalLandlords,
            totalProperties,
            totalPayments,
            totalFieldAgents,
            propertiesByStatus,
            propertiesByType,
            paymentsByStatus
        ] = await Promise.all([
            prisma.user.count(),
            prisma.landlord.count(),
            prisma.property.count(monthFilter ? { where: dateFilter } : {}),
            prisma.payment.count(monthFilter ? { where: dateFilter } : {}),
            prisma.fieldAgent.count(),
            prisma.property.groupBy({
                by: ['status'],
                _count: true,
                ...(monthFilter && { where: dateFilter })
            }),
            prisma.property.groupBy({
                by: ['property_type'],
                _count: true,
                ...(monthFilter && { where: dateFilter })
            }),
            prisma.payment.groupBy({
                by: ['status'],
                _count: true,
                ...(monthFilter && { where: dateFilter })
            })
        ]);

        // Get all users with their property counts
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
                _count: {
                    select: {
                        properties: monthFilter ? {
                            where: dateFilter
                        } : true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate revenue statistics
        const completedPayments = await prisma.payment.findMany({
            where: {
                status: 'COMPLETED',
                ...(monthFilter && dateFilter)
            },
            select: {
                amount: true
            }
        });

        const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);

        // Get recent activity (last 30 days) - only if no month filter
        let recentProperties = 0;
        let recentLandlords = 0;
        
        if (!monthFilter) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            recentProperties = await prisma.property.count({
                where: {
                    createdAt: {
                        gte: thirtyDaysAgo
                    }
                }
            });

            recentLandlords = await prisma.landlord.count({
                where: {
                    createdAt: {
                        gte: thirtyDaysAgo
                    }
                }
            });
        }

        // Response structure
        const reports = {
            overall: {
                totalUsers,
                totalLandlords,
                totalProperties,
                totalPayments,
                totalFieldAgents,
                totalRevenue,
                recentActivity: {
                    propertiesCreated: recentProperties,
                    landlordsCreated: recentLandlords
                }
            },
            properties: {
                byStatus: (propertiesByStatus || []).map(item => ({
                    status: item.status,
                    count: item._count
                })),
                byType: (propertiesByType || []).map(item => ({
                    type: item.property_type,
                    count: item._count
                }))
            },
            payments: {
                byStatus: (paymentsByStatus || []).map(item => ({
                    status: item.status,
                    count: item._count
                }))
            },
            users: users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image,
                createdAt: user.createdAt,
                propertiesCount: user._count?.properties || 0
            }))
        };

        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

