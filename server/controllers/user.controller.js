import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import prisma from '../db/prisma.js';
import { generateUniqueIdAndCreate } from '../utils/idGenerator.js';

// Get all users
export const getUsers = asyncHandler(async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                agentId: true,
                agent: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        image: true
                    }
                },
                _count: {
                    select: {
                        property_applications: true
                    }
                }
            }
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current user (me)
export const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                agentId: true,
                agent: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        image: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user by ID
export const getUserById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                agentId: true,
                agent: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        image: true
                    }
                },
                property_applications: {
                    include: {
                        property: {
                            select: {
                                id: true,
                                title: true,
                                status: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create user
export const createUser = asyncHandler(async (req, res) => {
    try {
        const { name, email, password, role, agentId } = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check if user with this email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // If agentId is provided, verify the agent exists
        if (agentId) {
            const agent = await prisma.fieldAgent.findUnique({
                where: { id: agentId }
            });

            if (!agent) {
                return res.status(400).json({ message: 'Field agent not found' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate unique ID and create user in a single transaction
        // This ensures counter only increments on successful creation
        const user = await generateUniqueIdAndCreate('User', async (tx, uniqueId) => {
            return await tx.user.create({
                data: {
                    id: uniqueId,
                    name,
                    email,
                    password: hashedPassword,
                    role: role || 'USER',
                    agentId: agentId || null,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    image: true,
                    createdAt: true,
                    updatedAt: true,
                    agentId: true,
                    agent: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            image: true
                        }
                    }
                }
            });
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user
export const updateUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, password, agentId } = req.body || {};

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id }
        });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If email is being updated, check if new email already exists
        if (email && email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email }
            });

            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // If agentId is provided, verify the agent exists
        if (agentId !== undefined) {
            if (agentId) {
                const agent = await prisma.fieldAgent.findUnique({
                    where: { id: agentId }
                });

                if (!agent) {
                    return res.status(400).json({ message: 'Field agent not found' });
                }
            }
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;
        if (password !== undefined) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        if (agentId !== undefined) {
            updateData.agentId = agentId || null;
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                agentId: true,
                agent: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        image: true
                    }
                }
            }
        });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                property_applications: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has property applications
        if (user.property_applications.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete user with existing property applications. Please delete or reassign applications first.' 
            });
        }

        await prisma.user.delete({
            where: { id }
        });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
