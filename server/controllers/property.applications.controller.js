import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';


export const createPropertyApplication = asyncHandler(async (req, res) => {
    const { propertyId, tenantId, message } = req.body || {};
    if (!propertyId || !tenantId) {
        res.status(400);
        throw new Error('Please fill in all fields');
    }

    // check if the property exists
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
    });
    if (!property) {
        res.status(400);
        throw new Error('Property not found');
    }

    // check if the tenant exists
    const tenant = await prisma.user.findUnique({
        where: { id: tenantId },
    });

    if (!tenant) {
        res.status(400);
        throw new Error('Tenant not found');
    }

    // check if the tenant has already applied to the property
    const existingApplication = await prisma.propertyApplication.findFirst({
        where: { propertyId, tenantId },
    });
    if (existingApplication) {
        res.status(400);
        throw new Error('You have already applied to this property. Please wait for the landlord to review your application.');
    }

    // create the property application
    const propertyApplication = await prisma.propertyApplication.create({
        data: { propertyId, tenantId, message },
    });
    res.status(201).json(propertyApplication);
});



export const getPropertyApplications = asyncHandler(async (req, res) => {
    
    const { propertyId } = req.params;
    if (!propertyId) {
        res.status(400);
        throw new Error('Property ID is required');
    }
    const propertyApplications = await prisma.propertyApplication.findMany({
        where: { propertyId },
    });
    res.status(200).json(propertyApplications);
});


export const getPropertyApplicationById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const propertyApplication = await prisma.propertyApplication.findUnique({
        where: { id },
    });

    if (!propertyApplication) {
        res.status(400);
        throw new Error('Property application not found');
    }
    res.status(200).json(propertyApplication);
});


export const updatePropertyApplication = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!status) {
        res.status(400);
        throw new Error('Status is required');
    }
    const propertyApplication = await prisma.propertyApplication.update({
        where: { id },
        data: { status },
    });
    res.status(200).json(propertyApplication);
});

export const deletePropertyApplication = asyncHandler(async (req, res) => { 
    const { id } = req.params;
    const propertyApplication = await prisma.propertyApplication.delete({
        where: { id },
    });
    res.status(200).json(propertyApplication);
});

    export const getPropertyApplicationsByTenant = asyncHandler(async (req, res) => {
    const { tenantId } = req.params;
    if (!tenantId) {
        res.status(400);
        throw new Error('Tenant ID is required');
    }
    const propertyApplications = await prisma.propertyApplication.findMany({
        where: { tenantId },
    });
    res.status(200).json(propertyApplications);
});