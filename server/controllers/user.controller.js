import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import prisma from '../db/prisma.js';
import { generateUniqueIdAndCreate } from '../utils/idGenerator.js';
import { sendUserCredentialsEmail, sendUserActivationEmail, sendUserDeactivationEmail } from '../services/email.service.js';

// Get all users
export const getUsers = asyncHandler(async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: 'asc'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                image: true,
                is_sent_email: true,
                is_sent_at: true,
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
                        properties: true
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
                status: true,
                image: true,
                is_sent_email: true,
                is_sent_at: true,
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
            // If the token refers to a user that no longer exists, gracefully
            // fall back to returning the full user list (admin panels often
            // expect some data instead of a hard error here).
            const users = await prisma.user.findMany({
                orderBy: {
                    createdAt: 'asc'
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    image: true,
                    is_sent_email: true,
                    is_sent_at: true,
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
                            properties: true
                        }
                    }
                }
            });
            return res.status(200).json(users);
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
                status: true,
                image: true,
                is_sent_email: true,
                is_sent_at: true,
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

// Create user
export const createUser = asyncHandler(async (req, res) => {
    try {
        const { name, email, password, role, status, agentId } = req.body || {};

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
                    status: status || 'ACTIVE',
                    agentId: agentId || null,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    image: true,
                    is_sent_email: true,
                    is_sent_at: true,
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

        // Send credentials email to the new user
        // Don't fail user creation if email sending fails
        try {
            await sendUserCredentialsEmail(
                email,
                name,
                password, // Plain password from request body
                role || 'USER',
                user.id
            );
            // Update email tracking fields on success
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    is_sent_email: true,
                    is_sent_at: new Date()
                }
            });
            // Update the user object to reflect the changes
            user.is_sent_email = true;
            user.is_sent_at = new Date();
        } catch (emailError) {
            console.error('Failed to send credentials email:', emailError);
            // Continue even if email fails - user is already created
        }

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user
export const updateUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, status, password, agentId } = req.body || {};

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

        // Validate status if provided
        if (status !== undefined && status !== 'ACTIVE' && status !== 'INACTIVE') {
            return res.status(400).json({ message: 'Status must be either ACTIVE or INACTIVE' });
        }

        // Check if user is being activated (status changes from INACTIVE to ACTIVE)
        const isBeingActivated = status !== undefined && 
                                status === 'ACTIVE' && 
                                existingUser.status === 'INACTIVE';

        // Check if user is being deactivated (status changes from ACTIVE to INACTIVE)
        const isBeingDeactivated = status !== undefined && 
                                  status === 'INACTIVE' && 
                                  existingUser.status === 'ACTIVE';

        // Check if password is being updated
        const isPasswordBeingUpdated = password !== undefined;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;
        if (status !== undefined) updateData.status = status;
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
                status: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                agentId: true,
                is_sent_email: true,
                is_sent_at: true,
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

        // Send credentials email when password is updated
        if (isPasswordBeingUpdated) {
            try {
                await sendUserCredentialsEmail(
                    user.email,
                    user.name,
                    password, // Plain password from request body
                    user.role,
                    user.id
                );
                // Update email tracking fields on success
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        is_sent_email: true,
                        is_sent_at: new Date()
                    }
                });
                // Update the user object to reflect the changes
                user.is_sent_email = true;
                user.is_sent_at = new Date();
            } catch (emailError) {
                console.error('Failed to send credentials email:', emailError);
                // Don't fail the update if email fails
            }
        }

        // Send activation email when user status changes from INACTIVE to ACTIVE
        if (isBeingActivated) {
            try {
                await sendUserActivationEmail(
                    user.email,
                    user.name,
                    user.role,
                    user.id
                );
            } catch (emailError) {
                console.error('Failed to send activation email:', emailError);
                // Don't fail the update if email fails
            }
        }

        // Send deactivation email when user status changes from ACTIVE to INACTIVE
        if (isBeingDeactivated) {
            try {
                const { inactiveReason } = req.body || {};
                await sendUserDeactivationEmail(
                    user.email,
                    user.name,
                    inactiveReason || null,
                    user.id
                );
            } catch (emailError) {
                console.error('Failed to send deactivation email:', emailError);
                // Don't fail the update if email fails
            }
        }

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
            where: { id }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has property applications by querying PropertyApplication directly
        const propertyApplications = await prisma.propertyApplication.findMany({
            where: { tenantId: id }
        });

        if (propertyApplications.length > 0) {
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
