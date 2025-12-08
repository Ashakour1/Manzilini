import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';

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

        const landlord = await prisma.landlord.create({
            data: {
                name,
                email,
                phone,
                company_name,
                address,
            }
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
        const { name, email, phone, company_name, address } = req.body || {};

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

        const landlord = await prisma.landlord.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                company_name,
                address,
            }
        });

        res.status(200).json(landlord);
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
