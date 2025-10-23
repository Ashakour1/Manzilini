import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please fill in all fields');
    }

    // const userExists = await User.findOne({ email });
    // if (userExists) {
    //     res.status(400);
    //     throw new Error('User already exists');
    // }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: 'USER',   
        }
    });

    res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    });

});


export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        res.status(400);
        throw new Error('Please fill in all fields');
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        res.status(400);
        throw new Error('User not found');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        res.status(400);
        throw new Error('Invalid password');
    }

    res.status(200).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
    });
});


export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};