import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';

// Create a new field agent
export const createFieldAgent = asyncHandler(async (req, res) => {
    try {
        const { name, email, phone } = req.body || {};

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Check if field agent with this email already exists
        const existingAgent = await prisma.fieldAgent.findUnique({
            where: { email }
        });

        if (existingAgent) {
            return res.status(400).json({ message: 'Field agent with this email already exists' });
        }

        // Handle image uploads
        const imageBaseUrl = `${req.protocol}://${req.get("host")}/uploads`;
        let imageUrl = null;
        let documentImageUrl = null;

        if (req.files) {
            if (req.files.image && req.files.image[0]) {
                const filename = req.files.image[0].filename || req.files.image[0].originalname;
                imageUrl = `${imageBaseUrl}/${filename}`;
            }
            if (req.files.document_image && req.files.document_image[0]) {
                const filename = req.files.document_image[0].filename || req.files.document_image[0].originalname;
                documentImageUrl = `${imageBaseUrl}/${filename}`;
            }
        }

        const fieldAgent = await prisma.fieldAgent.create({
            data: {
                name,
                email,
                phone,
                image: imageUrl,
                document_image: documentImageUrl,
            }
        });

        res.status(201).json(fieldAgent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all field agents
export const getFieldAgents = asyncHandler(async (req, res) => {
    try {
        const fieldAgents = await prisma.fieldAgent.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json(fieldAgents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get field agent by ID
export const getFieldAgentById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const fieldAgent = await prisma.fieldAgent.findUnique({
            where: { id }
        });

        if (!fieldAgent) {
            return res.status(404).json({ message: 'Field agent not found' });
        }

        res.status(200).json(fieldAgent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update field agent
export const updateFieldAgent = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone } = req.body || {};

        // Check if field agent exists
        const existingAgent = await prisma.fieldAgent.findUnique({
            where: { id }
        });

        if (!existingAgent) {
            return res.status(404).json({ message: 'Field agent not found' });
        }

        // If email is being updated, check if new email already exists
        if (email && email !== existingAgent.email) {
            const emailExists = await prisma.fieldAgent.findUnique({
                where: { email }
            });

            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Build update data object
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;

        // Handle image uploads
        const imageBaseUrl = `${req.protocol}://${req.get("host")}/uploads`;
        
        if (req.files) {
            if (req.files.image && req.files.image[0]) {
                const filename = req.files.image[0].filename || req.files.image[0].originalname;
                updateData.image = `${imageBaseUrl}/${filename}`;
            }
            if (req.files.document_image && req.files.document_image[0]) {
                const filename = req.files.document_image[0].filename || req.files.document_image[0].originalname;
                updateData.document_image = `${imageBaseUrl}/${filename}`;
            }
        }

        const fieldAgent = await prisma.fieldAgent.update({
            where: { id },
            data: updateData
        });

        res.status(200).json(fieldAgent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete field agent
export const deleteFieldAgent = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Check if field agent exists
        const fieldAgent = await prisma.fieldAgent.findUnique({
            where: { id }
        });

        if (!fieldAgent) {
            return res.status(404).json({ message: 'Field agent not found' });
        }

        await prisma.fieldAgent.delete({
            where: { id }
        });

        res.status(200).json({ message: 'Field agent deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



