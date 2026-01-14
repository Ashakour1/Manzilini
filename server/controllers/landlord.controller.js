import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';
import { generateUniqueIdAndCreate } from '../utils/idGenerator.js';

// Register a new landlord
export const registerLandlord = asyncHandler(async (req, res) => {
    try {
        const { name, email, phone, company_name, address } = req.body || {};

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Check if landlord with this email already exists
        const existingLandlord = await prisma.landlord.findUnique({
            where: { email }
        });

        if (existingLandlord) {
            return res.status(400).json({ message: 'Landlord with this email already exists' });
        }

        // Generate unique ID and create landlord in a single transaction
        // This ensures counter only increments on successful creation
        const landlord = await generateUniqueIdAndCreate('Landlord', async (tx, uniqueId) => {
            return await tx.landlord.create({
                data: {
                    id: uniqueId,
                    name,
                    email,
                    phone,
                    company_name,
                    address,
                }
            });
        });

        res.status(201).json(landlord);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all landlords
export const getLandlords = asyncHandler(async (req, res) => {
    try {
        const landlords = await prisma.landlord.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                properties: {
                    select: {
                        id: true,
                        title: true,
                        status: true
                    }
                }
            }
        });
        res.status(200).json(landlords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get landlords for agents (only landlords with properties assigned to agent's users)
export const getLandlordsForAgent = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
                agentId: true
            }
        });

        if (!user || user.role !== 'AGENT') {
            return res.status(403).json({ message: 'Access denied. Agent role required.' });
        }

        if (!user.agentId) {
            // Agent user doesn't have an agentId, return empty array
            return res.status(200).json([]);
        }

        // Find all users assigned to this agent
        const assignedUsers = await prisma.user.findMany({
            where: { agentId: user.agentId },
            select: { id: true }
        });

        const assignedUserIds = assignedUsers.map(u => u.id);

        // Get properties created by users assigned to this agent
        const agentProperties = await prisma.property.findMany({
            where: { 
                userId: { in: assignedUserIds }
            },
            select: {
                landlord_id: true
            }
        });

        // Get unique landlord IDs from properties
        const landlordIds = [...new Set(agentProperties.map(p => p.landlord_id).filter(Boolean))];

        if (landlordIds.length === 0) {
            return res.status(200).json([]);
        }

        // Get landlords who have properties assigned to this agent
        const landlords = await prisma.landlord.findMany({
            where: {
                id: { in: landlordIds }
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                properties: {
                    where: {
                        userId: { in: assignedUserIds }
                    },
                    select: {
                        id: true,
                        title: true,
                        status: true
                    }
                }
            }
        });

        res.status(200).json(landlords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get landlord by ID
export const getLandlordById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const landlord = await prisma.landlord.findUnique({
            where: { id },
            include: {
                properties: {
                    include: {
                        images: true
                    }
                }
            }
        });

        if (!landlord) {
            return res.status(404).json({ message: 'Landlord not found' });
        }

        res.status(200).json(landlord);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update landlord
export const updateLandlord = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, company_name, address, isVerified } = req.body || {};

        // Check if landlord exists
        const existingLandlord = await prisma.landlord.findUnique({
            where: { id }
        });

        if (!existingLandlord) {
            return res.status(404).json({ message: 'Landlord not found' });
        }

        // If email is being updated, check if new email already exists
        if (email && email !== existingLandlord.email) {
            const emailExists = await prisma.landlord.findUnique({
                where: { email }
            });

            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Build update data object, only including fields that are provided
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (company_name !== undefined) updateData.company_name = company_name;
        if (address !== undefined) updateData.address = address;
        if (isVerified !== undefined) updateData.isVerified = isVerified;

        const landlord = await prisma.landlord.update({
            where: { id },
            data: updateData
        });

        res.status(200).json(landlord);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify/Unverify landlord
export const verifyLandlord = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body || {};

        // Check if landlord exists
        const existingLandlord = await prisma.landlord.findUnique({
            where: { id }
        });

        if (!existingLandlord) {
            return res.status(404).json({ message: 'Landlord not found' });
        }

        if (typeof isVerified !== 'boolean') {
            return res.status(400).json({ message: 'isVerified must be a boolean value' });
        }

        const landlord = await prisma.landlord.update({
            where: { id },
            data: { isVerified }
        });

        res.status(200).json({
            ...landlord,
            message: landlord.isVerified ? 'Landlord verified successfully' : 'Landlord unverified successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete landlord
export const deleteLandlord = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Check if landlord has properties
        const landlord = await prisma.landlord.findUnique({
            where: { id },
            include: {
                properties: true
            }
        });

        if (!landlord) {
            return res.status(404).json({ message: 'Landlord not found' });
        }

        if (landlord.properties.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete landlord with existing properties. Please delete or reassign properties first.' 
            });
        }

        await prisma.landlord.delete({
            where: { id }
        });

        res.status(200).json({ message: 'Landlord deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
