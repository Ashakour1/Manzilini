import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';
import { generateUniqueIdAndCreate } from '../utils/idGenerator.js';
import cloudinary from '../config/cloudinary.js';

// Create a new field agent
export const createFieldAgent = asyncHandler(async (req, res) => {
    try {
        const { 
            name, 
            email, 
            phone,
            // agent document fields
            documentType,
            documentImage,
            documentNotes,
        } = req.body || {};

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

        // Handle profile image upload to Cloudinary
        let imageUrl = null;
        if (req.files && req.files.image && req.files.image[0]) {
            const file = req.files.image[0];
            const mimeType = file.mimetype || 'image/jpeg';
            const encodedImage = `data:${mimeType};base64,${file.buffer.toString("base64")}`;
            const result = await cloudinary.uploader.upload(encodedImage, {
                resource_type: "image",
                quality: "auto:best",
                fetch_format: "auto",
                folder: "agents/profile",
            });
            if (result && result.secure_url) {
                imageUrl = result.secure_url;
            }
        }

        // Generate unique ID and create field agent in a single transaction
        const fieldAgent = await generateUniqueIdAndCreate('FieldAgent', async (tx, uniqueId) => {
            return await tx.fieldAgent.create({
                data: {
                    id: uniqueId,
                    name,
                    email,
                    phone,
                    image: imageUrl,
                }
            });
        });

        // Handle document upload
        const docImage = documentImage || req.body.document_image || null;
        const docType = documentType || req.body.document_type || null;
        const docNotes = documentNotes || req.body.notes || null;

        let finalDocImage = docImage;
        if (req.files && req.files.document && req.files.document[0]) {
            const file = req.files.document[0];
            const mimeType = file.mimetype || 'image/jpeg';
            const encodedImage = `data:${mimeType};base64,${file.buffer.toString("base64")}`;
            const result = await cloudinary.uploader.upload(encodedImage, {
                resource_type: "image",
                quality: "auto:best",
                fetch_format: "auto",
                folder: "agents/documents",
            });
            if (result && result.secure_url) {
                finalDocImage = result.secure_url;
            }
        }

        if (finalDocImage || docType || docNotes) {
            await prisma.agentDocument.create({
                data: {
                    agentId: fieldAgent.id,
                    documentType: docType,
                    documentImage: finalDocImage,
                    notes: docNotes,
                },
            });
        }

        // Fetch agent with documents
        const agentWithDocs = await prisma.fieldAgent.findUnique({
            where: { id: fieldAgent.id },
            include: { documents: true }
        });

        res.status(201).json(agentWithDocs);
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
            },
            include: {
                documents: true
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
            where: { id },
            include: {
                documents: true
            }
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
        const { 
            name, 
            email, 
            phone,
            // agent document fields
            documentType,
            documentImage,
            documentNotes,
        } = req.body || {};

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

        // Handle profile image upload to Cloudinary
        if (req.files && req.files.image && req.files.image[0]) {
            const file = req.files.image[0];
            const mimeType = file.mimetype || 'image/jpeg';
            const encodedImage = `data:${mimeType};base64,${file.buffer.toString("base64")}`;
            const result = await cloudinary.uploader.upload(encodedImage, {
                resource_type: "image",
                quality: "auto:best",
                fetch_format: "auto",
                folder: "agents/profile",
            });
            if (result && result.secure_url) {
                updateData.image = result.secure_url;
            }
        }

        const fieldAgent = await prisma.fieldAgent.update({
            where: { id },
            data: updateData
        });

        // Handle document upload
        const docImage = documentImage || req.body.document_image || null;
        const docType = documentType || req.body.document_type || null;
        const docNotes = documentNotes || req.body.notes || null;

        let finalDocImage = docImage;
        if (req.files && req.files.document && req.files.document[0]) {
            const file = req.files.document[0];
            const mimeType = file.mimetype || 'image/jpeg';
            const encodedImage = `data:${mimeType};base64,${file.buffer.toString("base64")}`;
            const result = await cloudinary.uploader.upload(encodedImage, {
                resource_type: "image",
                quality: "auto:best",
                fetch_format: "auto",
                folder: "agents/documents",
            });
            if (result && result.secure_url) {
                finalDocImage = result.secure_url;
            }
        }

        if (finalDocImage || docType || docNotes) {
            await prisma.agentDocument.create({
                data: {
                    agentId: fieldAgent.id,
                    documentType: docType,
                    documentImage: finalDocImage,
                    notes: docNotes,
                },
            });
        }

        // Fetch agent with documents
        const agentWithDocs = await prisma.fieldAgent.findUnique({
            where: { id: fieldAgent.id },
            include: { documents: true }
        });

        res.status(200).json(agentWithDocs);
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



