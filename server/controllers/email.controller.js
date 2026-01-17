import asyncHandler from 'express-async-handler';
import { sendEmail, sendNotificationEmail } from '../services/email.service.js';
import prisma from '../db/prisma.js';

// Send email manually (admin function)
export const sendManualEmail = asyncHandler(async (req, res) => {
    try {
        const { 
            recipientEmail, 
            recipientName, 
            subject, 
            message, 
            emailType = "NOTIFICATION",
            landlordId,
            userId 
        } = req.body;

        // Validate required fields
        if (!recipientEmail || !subject || !message) {
            return res.status(400).json({ 
                message: 'Recipient email, subject, and message are required' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail)) {
            return res.status(400).json({ 
                message: 'Invalid email format' 
            });
        }

        // If landlordId is provided, verify landlord exists
        let landlord = null;
        if (landlordId) {
            landlord = await prisma.landlord.findUnique({
                where: { id: landlordId },
                select: { id: true, name: true, email: true }
            });

            if (!landlord) {
                return res.status(404).json({ 
                    message: 'Landlord not found' 
                });
            }

            // Use landlord email if recipientEmail not provided
            const finalRecipientEmail = recipientEmail || landlord.email;
            const finalRecipientName = recipientName || landlord.name;

            // Send email
            const result = await sendEmail(
                finalRecipientEmail,
                subject,
                message,
                emailType,
                finalRecipientName,
                landlordId,
                { 
                    type: 'manual',
                    sentBy: req.user?.id || 'admin',
                    userId: userId || null
                }
            );

            res.status(200).json({
                message: 'Email sent successfully',
                result: result.data,
                recipientEmail: finalRecipientEmail,
                recipientName: finalRecipientName
            });
        } else {
            // Send email without landlord association
            const result = await sendEmail(
                recipientEmail,
                subject,
                message,
                emailType,
                recipientName || null,
                null,
                { 
                    type: 'manual',
                    sentBy: req.user?.id || 'admin',
                    userId: userId || null
                }
            );

            res.status(200).json({
                message: 'Email sent successfully',
                result: result.data,
                recipientEmail,
                recipientName: recipientName || null
            });
        }
    } catch (error) {
        console.error('Error sending manual email:', error);
        res.status(500).json({ 
            message: error.message || 'Failed to send email' 
        });
    }
});

// Send email to landlord
export const sendEmailToLandlord = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, message, emailType = "NOTIFICATION" } = req.body;

        // Validate required fields
        if (!subject || !message) {
            return res.status(400).json({ 
                message: 'Subject and message are required' 
            });
        }

        // Get landlord
        const landlord = await prisma.landlord.findUnique({
            where: { id },
            select: { id: true, name: true, email: true }
        });

        if (!landlord) {
            return res.status(404).json({ 
                message: 'Landlord not found' 
            });
        }

        // Send email
        const result = await sendEmail(
            landlord.email,
            subject,
            message,
            emailType,
            landlord.name,
            landlord.id,
            { 
                type: 'manual',
                sentBy: req.user?.id || 'admin'
            }
        );

        res.status(200).json({
            message: 'Email sent successfully',
            result: result.data,
            recipientEmail: landlord.email,
            recipientName: landlord.name
        });
    } catch (error) {
        console.error('Error sending email to landlord:', error);
        res.status(500).json({ 
            message: error.message || 'Failed to send email' 
        });
    }
});

// Send email to user
export const sendEmailToUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, message, emailType = "NOTIFICATION" } = req.body;

        // Validate required fields
        if (!subject || !message) {
            return res.status(400).json({ 
                message: 'Subject and message are required' 
            });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true }
        });

        if (!user) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        // Send email
        const result = await sendEmail(
            user.email,
            subject,
            message,
            emailType,
            user.name,
            null,
            { 
                type: 'manual',
                sentBy: req.user?.id || 'admin',
                userId: user.id
            }
        );

        res.status(200).json({
            message: 'Email sent successfully',
            result: result.data,
            recipientEmail: user.email,
            recipientName: user.name
        });
    } catch (error) {
        console.error('Error sending email to user:', error);
        res.status(500).json({ 
            message: error.message || 'Failed to send email' 
        });
    }
});
