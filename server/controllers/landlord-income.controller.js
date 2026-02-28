import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';

// Get all property incomes (landlord-level), optionally filtered by property or tenant
export const getPropertyIncomes = asyncHandler(async (req, res) => {
  try {
    const { propertyId, tenantId, from, to } = req.query;

    const where = {
      propertyId: propertyId || undefined,
      tenantId: tenantId || undefined,
      incomeDate:
        from || to
          ? {
              gte: from ? new Date(from) : undefined,
              lte: to ? new Date(to) : undefined,
            }
          : undefined,
    };

    const incomes = await prisma.income.findMany({
      where,
      include: {
        property: {
          select: { id: true, title: true, address: true, landlord_id: true },
        },
        tenant: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { incomeDate: 'desc' },
    });

    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create property income
export const createPropertyIncome = asyncHandler(async (req, res) => {
  try {
    const {
      propertyId,
      tenantId,
      incomeDate,
      amount,
      source,
      paymentMethod,
      reference,
      description,
    } = req.body || {};

    if (!propertyId || !incomeDate || !amount || !source || !paymentMethod) {
      return res.status(400).json({
        message:
          'propertyId, incomeDate, amount, source, and paymentMethod are required fields',
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      return res.status(400).json({ message: 'Property not found' });
    }

    const income = await prisma.income.create({
      data: {
        propertyId,
        tenantId: tenantId || null,
        incomeDate: new Date(incomeDate),
        amount,
        source,
        paymentMethod,
        reference: reference || null,
        description: description || null,
        createdById: userId,
      },
      include: {
        property: {
          select: { id: true, title: true, address: true },
        },
        tenant: {
          select: { id: true, fullName: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update property income
export const updatePropertyIncome = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      propertyId,
      tenantId,
      incomeDate,
      amount,
      source,
      paymentMethod,
      reference,
      description,
    } = req.body || {};

    const existing = await prisma.income.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Income not found' });
    }

    const updateData = {};
    if (propertyId !== undefined) updateData.propertyId = propertyId;
    if (tenantId !== undefined) updateData.tenantId = tenantId || null;
    if (incomeDate !== undefined) updateData.incomeDate = new Date(incomeDate);
    if (amount !== undefined) updateData.amount = amount;
    if (source !== undefined) updateData.source = source;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (reference !== undefined) updateData.reference = reference || null;
    if (description !== undefined) updateData.description = description || null;

    const updated = await prisma.income.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          select: { id: true, title: true, address: true },
        },
        tenant: {
          select: { id: true, fullName: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete property income
export const deletePropertyIncome = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.income.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Income not found' });
    }

    await prisma.income.delete({
      where: { id: existing.id },
    });

    res.status(200).json({ message: 'Income deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
