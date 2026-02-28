import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';

// Get all property expenses (landlord-level), optionally filtered
export const getPropertyExpenses = asyncHandler(async (req, res) => {
  try {
    const { propertyId, category, from, to } = req.query;

    const where = {
      propertyId: propertyId || undefined,
      category: category || undefined,
      expenseDate:
        from || to
          ? {
              gte: from ? new Date(from) : undefined,
              lte: to ? new Date(to) : undefined,
            }
          : undefined,
    };

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        property: {
          select: { id: true, title: true, address: true, landlord_id: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { expenseDate: 'desc' },
    });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create property expense
export const createPropertyExpense = asyncHandler(async (req, res) => {
  try {
    const {
      propertyId,
      expenseDate,
      amount,
      category,
      paymentMethod,
      vendorName,
      reference,
      description,
    } = req.body || {};

    if (!propertyId || !expenseDate || !amount || !category || !paymentMethod) {
      return res.status(400).json({
        message:
          'propertyId, expenseDate, amount, category, and paymentMethod are required fields',
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

    const expense = await prisma.expense.create({
      data: {
        propertyId,
        expenseDate: new Date(expenseDate),
        amount,
        category,
        paymentMethod,
        vendorName: vendorName || null,
        reference: reference || null,
        description: description || null,
        createdById: userId,
      },
      include: {
        property: {
          select: { id: true, title: true, address: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update property expense
export const updatePropertyExpense = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      propertyId,
      expenseDate,
      amount,
      category,
      paymentMethod,
      vendorName,
      reference,
      description,
    } = req.body || {};

    const existing = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const updateData = {};
    if (propertyId !== undefined) updateData.propertyId = propertyId;
    if (expenseDate !== undefined) updateData.expenseDate = new Date(expenseDate);
    if (amount !== undefined) updateData.amount = amount;
    if (category !== undefined) updateData.category = category;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (vendorName !== undefined) updateData.vendorName = vendorName || null;
    if (reference !== undefined) updateData.reference = reference || null;
    if (description !== undefined) updateData.description = description || null;

    const updated = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          select: { id: true, title: true, address: true },
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

// Delete property expense
export const deletePropertyExpense = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await prisma.expense.delete({
      where: { id: existing.id },
    });

    res.status(200).json({ message: 'Expense deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
