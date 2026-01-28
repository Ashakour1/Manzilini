import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';
import { generateUniqueIdAndCreate } from '../utils/idGenerator.js';
import { sendWelcomeEmail, sendLandlordApprovalEmail, sendLandlordInactiveEmail, sendLandlordRejectionEmail, sendLandlordActivationEmail } from '../services/email.service.js';


export const registerLandlordWithUser = asyncHandler(async (req, res) => {
    try {
        const { name, email, phone, company_name, address, password } = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email, and password are required'
            });
        }

        // Check landlord existence
        const existingLandlord = await prisma.landlord.findUnique({
            where: { email }
        });

        if (existingLandlord) {
            return res.status(400).json({
                message: 'Landlord with this email already exists'
            });
        }

        // Check user existence
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User with this email already exists'
            });
        }

        const createdBy = req.user?.id || null;

        // 🔐 Hash password once
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Create landlord
        const landlord = await generateUniqueIdAndCreate(
            'Landlord',
            async (tx, uniqueId) => {
                return tx.landlord.create({
                    data: {
                        id: uniqueId,
                        name,
                        email,
                        phone,
                        company_name,
                        address,
                        status: 'INACTIVE',
                        createdBy
                    }
                });
            }
        );

        // ✅ Create user for landlord
        let user = null;

        try {
            user = await generateUniqueIdAndCreate(
                'User',
                async (tx, uniqueId) => {
                    return tx.user.create({
                        data: {
                            id: uniqueId,
                            name,
                            email,
                            password: hashedPassword,
                            role: 'LANDLORD',
                            status: 'INACTIVE'
                        },
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            status: true,
                            createdAt: true
                        }
                    });
                }
            );

            // Update landlord's createdBy to link to the user (if not already set by admin)
            if (!createdBy) {
                await prisma.landlord.update({
                    where: { id: landlord.id },
                    data: { createdBy: user.id }
                });
            }

            // 📧 Send credentials email (non-blocking)
            try {
                await sendUserCredentialsEmail(
                    email,
                    name,
                    password,
                    'LANDLORD',
                    user.id
                );

                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        is_sent_email: true,
                        is_sent_at: new Date()
                    }
                });
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // User is still created, just email failed
            }

        } catch (userError) {
            console.error('User creation failed:', userError);
            // If user creation fails, we should still return the landlord but log the error
            // Consider rolling back landlord creation if user creation is critical
            return res.status(500).json({ 
                message: 'Failed to create user account',
                error: userError.message,
                landlord 
            });
        }

        res.status(201).json({
            landlord,
            user
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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

        // Get creator user ID if authenticated
        const createdBy = req.user?.id || null;

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
                    status: 'INACTIVE', // Default status
                    createdBy: createdBy,
                }
            });
        });

        // Send welcome email to the landlord
        try {
            await sendWelcomeEmail(landlord.email, landlord.name, landlord.id);
            // Update email tracking fields on success
            await prisma.landlord.update({
                where: { id: landlord.id },
                data: {
                    is_sent_email: true,
                    is_sent_at: new Date()
                }
            });
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the registration if email fails
        }

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
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        image: true
                    }
                }
            }
        });
        res.status(200).json(landlords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get landlords for agents (only landlords registered by users assigned to the agent)
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

        if (assignedUserIds.length === 0) {
            return res.status(200).json([]);
        }

        // Get landlords registered by users assigned to this agent
        const landlords = await prisma.landlord.findMany({
            where: {
                createdBy: { in: assignedUserIds }
            },
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
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        image: true
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
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        image: true
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
        const { name, email, phone, company_name, address, isVerified, status, rejectionReason, inactiveReason } = req.body || {};

        console.log(req.body);
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

        // Validate status if provided
        if (status !== undefined && !['ACTIVE', 'INACTIVE'].includes(status)) {
            return res.status(400).json({ message: 'Status must be ACTIVE or INACTIVE' });
        }

        // Build update data object, only including fields that are provided
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (company_name !== undefined) updateData.company_name = company_name;
        if (address !== undefined) updateData.address = address;
        if (isVerified !== undefined) updateData.isVerified = isVerified;
        if (status !== undefined) updateData.status = status;
        if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;
        if (inactiveReason !== undefined) updateData.inactiveReason = inactiveReason;

        // Check if landlord is being approved for the first time
        const isBeingApproved = isVerified !== undefined && 
                               isVerified === true && 
                               existingLandlord.isVerified === false;

        // Check if landlord is being rejected (unverified)
        const isBeingRejected = isVerified !== undefined && 
                               isVerified === false && 
                               existingLandlord.isVerified === true;

        // Check if landlord is being set to inactive
        const isBeingInactivated = status !== undefined && 
                                  status === 'INACTIVE' && 
                                  existingLandlord.status === 'ACTIVE';

        // Check if landlord is being activated (status changes from INACTIVE to ACTIVE)
        const isBeingActivated = status !== undefined && 
                                status === 'ACTIVE' && 
                                existingLandlord.status === 'INACTIVE';

        // If being approved, also set status to ACTIVE
        if (isBeingApproved && status === undefined) {
            updateData.status = 'ACTIVE';
        }

        const landlord = await prisma.landlord.update({
            where: { id },
            data: updateData
        });

        // Send approval email when landlord is verified (approved) for the first time
        if (isBeingApproved) {
            const { password } = req.body || {};
            try {
                await sendLandlordApprovalEmail(
                    landlord.email,
                    landlord.name,
                    password || null,
                    landlord.id
                );
                // Update email tracking fields on success
                await prisma.landlord.update({
                    where: { id: landlord.id },
                    data: {
                        is_sent_email: true,
                        is_sent_at: new Date()
                    }
                });
            } catch (emailError) {
                console.error('Failed to send approval email:', emailError);
                // Don't fail the update if email fails
            }
        }

        // Send activation email when landlord status changes from INACTIVE to ACTIVE
        if (isBeingActivated) {
            try {
                await sendLandlordActivationEmail(
                    landlord.email,
                    landlord.name,
                    landlord.id
                );
                // Update email tracking fields on success
                await prisma.landlord.update({
                    where: { id: landlord.id },
                    data: {
                        is_sent_email: true,
                        is_sent_at: new Date()
                    }
                });
            } catch (emailError) {
                console.error('Failed to send activation email:', emailError);
                // Don't fail the update if email fails
            }
        }

        // Send rejection email when landlord is unverified (rejected)
        if (isBeingRejected) {
            try {
                await sendLandlordRejectionEmail(
                    landlord.email,
                    landlord.name,
                    rejectionReason || landlord.rejectionReason || null,
                    landlord.id
                );
                // Update email tracking fields on success
                await prisma.landlord.update({
                    where: { id: landlord.id },
                    data: {
                        is_sent_email: true,
                        is_sent_at: new Date()
                    }
                });
            } catch (emailError) {
                console.error('Failed to send rejection email:', emailError);
                // Don't fail the update if email fails
            }
        }

        // Send inactive email when landlord status changes to INACTIVE
        if (isBeingInactivated) {
            try {
                await sendLandlordInactiveEmail(
                    landlord.email,
                    landlord.name,
                    inactiveReason || landlord.inactiveReason || null,
                    landlord.id
                );
                // Update email tracking fields on success
                await prisma.landlord.update({
                    where: { id: landlord.id },
                    data: {
                        is_sent_email: true,
                        is_sent_at: new Date()
                    }
                });
            } catch (emailError) {
                console.error('Failed to send inactive email:', emailError);
                // Don't fail the update if email fails
            }
        }

        res.status(200).json(landlord);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify/Unverify landlord
export const verifyLandlord = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified, password, rejectionReason } = req.body || {};

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

        // Build update data
        const updateData = { isVerified };
        if (rejectionReason !== undefined) {
            updateData.rejectionReason = rejectionReason;
        }

        // If being approved, also set status to ACTIVE
        if (isVerified === true && !existingLandlord.isVerified) {
            updateData.status = 'ACTIVE';
        }

        // Check if landlord is being rejected (unverified)
        const isBeingRejected = isVerified === false && existingLandlord.isVerified === true;

        const landlord = await prisma.landlord.update({
            where: { id },
            data: updateData
        });

        // Send approval email when landlord is verified (approved) for the first time
        if (isVerified && !existingLandlord.isVerified) {
            try {
                await sendLandlordApprovalEmail(
                    landlord.email,
                    landlord.name,
                    password || null,
                    landlord.id
                );
                // Update email tracking fields on success
                await prisma.landlord.update({
                    where: { id: landlord.id },
                    data: {
                        is_sent_email: true,
                        is_sent_at: new Date()
                    }
                });
            } catch (emailError) {
                console.error('Failed to send approval email:', emailError);
                // Don't fail the verification if email fails
            }
        }

        // Send rejection email when landlord is unverified (rejected)
        if (isBeingRejected) {
            try {
                await sendLandlordRejectionEmail(
                    landlord.email,
                    landlord.name,
                    rejectionReason || landlord.rejectionReason || null,
                    landlord.id
                );
                // Update email tracking fields on success
                await prisma.landlord.update({
                    where: { id: landlord.id },
                    data: {
                        is_sent_email: true,
                        is_sent_at: new Date()
                    }
                });
            } catch (emailError) {
                console.error('Failed to send rejection email:', emailError);
                // Don't fail the verification if email fails
            }
        }

        res.status(200).json({
            ...landlord,
            message: landlord.isVerified ? 'Landlord verified successfully' : 'Landlord unverified successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update landlord status (Active/Inactive)
export const updateLandlordStatus = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { status, inactiveReason } = req.body || {};

        // Check if landlord exists
        const existingLandlord = await prisma.landlord.findUnique({
            where: { id }
        });

        if (!existingLandlord) {
            return res.status(404).json({ message: 'Landlord not found' });
        }

        if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
            return res.status(400).json({ message: 'Status must be ACTIVE or INACTIVE' });
        }

        // Build update data
        const updateData = { status };
        if (inactiveReason !== undefined) {
            updateData.inactiveReason = inactiveReason;
        }

        // Check if landlord is being set to inactive
        const isBeingInactivated = status === 'INACTIVE' && existingLandlord.status === 'ACTIVE';

        // Check if landlord is being activated (status changes from INACTIVE to ACTIVE)
        const isBeingActivated = status === 'ACTIVE' && existingLandlord.status === 'INACTIVE';

        const landlord = await prisma.landlord.update({
            where: { id },
            data: updateData
        });

        // Send inactive email when landlord status changes to INACTIVE
        if (isBeingInactivated) {
            try {
                await sendLandlordInactiveEmail(
                    landlord.email,
                    landlord.name,
                    inactiveReason || landlord.inactiveReason || null,
                    landlord.id
                );
                // Update email tracking fields on success
                await prisma.landlord.update({
                    where: { id: landlord.id },
                    data: {
                        is_sent_email: true,
                        is_sent_at: new Date()
                    }
                });
            } catch (emailError) {
                console.error('Failed to send inactive email:', emailError);
                // Don't fail the status update if email fails
            }
        }

        // Send activation email when landlord status changes from INACTIVE to ACTIVE
        if (isBeingActivated) {
            try {
                await sendLandlordActivationEmail(
                    landlord.email,
                    landlord.name,
                    landlord.id
                );
                // Update email tracking fields on success
                await prisma.landlord.update({
                    where: { id: landlord.id },
                    data: {
                        is_sent_email: true,
                        is_sent_at: new Date()
                    }
                });
            } catch (emailError) {
                console.error('Failed to send activation email:', emailError);
                // Don't fail the status update if email fails
            }
        }

        res.status(200).json({
            ...landlord,
            message: `Landlord status updated to ${status} successfully`
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
