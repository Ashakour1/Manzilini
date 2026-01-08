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
            totalPayments,
            totalFieldAgents,
            propertiesByStatus,
            propertiesByType,
            paymentsByStatus
        ] = await Promise.all([
            prisma.user.count(),
            prisma.landlord.count(),
            prisma.property.count(),
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
            prisma.payment.groupBy({
                by: ['status'],
                _count: true
            })
        ]);

        // Get all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

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
                createdAt: user.createdAt
            }))
        };

        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

