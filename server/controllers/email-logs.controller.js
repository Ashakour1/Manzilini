import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';

// Get all email logs
export const getEmailLogs = asyncHandler(async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50, 
            emailType, 
            status, 
            recipientEmail,
            landlordId 
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        // Build where clause
        const where = {};
        if (emailType) {
            where.emailType = emailType;
        }
        if (status) {
            where.status = status;
        }
        if (recipientEmail) {
            where.recipientEmail = {
                contains: recipientEmail,
                mode: 'insensitive'
            };
        }
        if (landlordId) {
            where.landlordId = landlordId;
        }

        // Get total count for pagination
        const total = await prisma.emailLog.count({ where });

        // Get email logs with pagination
        const emailLogs = await prisma.emailLog.findMany({
            where,
            skip,
            take,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                landlord: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.status(200).json({
            emailLogs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get email log by ID
export const getEmailLogById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        
        const emailLog = await prisma.emailLog.findUnique({
            where: { id },
            include: {
                landlord: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        if (!emailLog) {
            return res.status(404).json({ message: 'Email log not found' });
        }

        res.status(200).json(emailLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get email logs by landlord ID
export const getEmailLogsByLandlord = asyncHandler(async (req, res) => {
    try {
        const { landlordId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        // Check if landlord exists
        const landlord = await prisma.landlord.findUnique({
            where: { id: landlordId }
        });

        if (!landlord) {
            return res.status(404).json({ message: 'Landlord not found' });
        }

        // Get total count
        const total = await prisma.emailLog.count({
            where: { landlordId }
        });

        // Get email logs
        const emailLogs = await prisma.emailLog.findMany({
            where: { landlordId },
            skip,
            take,
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            emailLogs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get email statistics
export const getEmailStats = asyncHandler(async (req, res) => {
    try {
        const total = await prisma.emailLog.count();
        const sent = await prisma.emailLog.count({ where: { status: 'SENT' } });
        const failed = await prisma.emailLog.count({ where: { status: 'FAILED' } });
        
        // Count by type
        const byType = await prisma.emailLog.groupBy({
            by: ['emailType'],
            _count: {
                id: true
            }
        });

        // Count by status
        const byStatus = await prisma.emailLog.groupBy({
            by: ['status'],
            _count: {
                id: true
            }
        });

        res.status(200).json({
            total,
            sent,
            failed,
            byType: byType.reduce((acc, item) => {
                acc[item.emailType] = item._count.id;
                return acc;
            }, {}),
            byStatus: byStatus.reduce((acc, item) => {
                acc[item.status] = item._count.id;
                return acc;
            }, {})
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
