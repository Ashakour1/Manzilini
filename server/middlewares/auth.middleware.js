import jwt from 'jsonwebtoken'
import prisma from '../db/prisma.js'

export const AuthMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        console.log("authHeader", authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {

            console.log("No token provided");
            return res.status(401).json({
                message: "Unauthorized - No token provided"
            });
        }
        
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized - Invalid token format"
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch user from database to check status
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                role: true,
                status: true
            }
        });
        
        if (!user) {
            return res.status(401).json({
                message: 'User not found'
            });
        }
        
        // Check if user is inactive
        if (user.status === 'INACTIVE') {
            // Block access for admin users if inactive
            if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
                return res.status(403).json({
                    message: 'Access denied - Your account is inactive. Please contact support.'
                });
            }
            // For non-admin users, also block access
            return res.status(403).json({
                message: 'Access denied - Your account is inactive. Please contact support.'
            });
        }
        
        // Token was generated with { id }, so use decoded.id
        req.user = {
            id: user.id,
            role: user.role
        };
        
        next();
    } catch (error) {
        res.status(401).json({
            message: 'Not authorized, token failed'
        });
    }
}

export const AdminMiddleware = (req, res, next) => {
    const role = req.user?.role;

    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        return next();
    }

    return res.status(403).json({
        message: 'Access denied - Admin privileges required'
    });
};
