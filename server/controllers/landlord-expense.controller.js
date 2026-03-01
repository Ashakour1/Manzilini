import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';

// Get all property expenses (landlord-level), scoped by authenticated user
export const getPropertyExpenses = asyncHandler(async (req, res) => {
  try {
    const { propertyId, category, from, to } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let landlordId = null;
    if (user.role === 'LANDLORD') {
      const landlord = await prisma.landlord.findUnique({
        where: { email: user.email },
        select: { id: true },
      });
      if (!landlord) {
        return res.status(200).json([]);
      }
      landlordId = landlord.id;
    } else if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

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
      ...(landlordId && { property: { landlord_id: landlordId } }),
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

    // LANDLORD: ensure property belongs to their landlord profile
    const userForRole = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true },
    });
    if (userForRole?.role === 'LANDLORD') {
      const landlord = await prisma.landlord.findUnique({
        where: { email: userForRole.email },
        select: { id: true },
      });
      if (!landlord || property.landlord_id !== landlord.id) {
        return res.status(403).json({ message: 'Access denied - property not owned by you' });
      }
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
      include: { property: { select: { landlord_id: true } } },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // LANDLORD: ensure expense belongs to their property
    let landlordIdForCheck = null;
    const userForRole = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { email: true, role: true },
    });
    if (userForRole?.role === 'LANDLORD') {
      const landlord = await prisma.landlord.findUnique({
        where: { email: userForRole.email },
        select: { id: true },
      });
      if (!landlord || existing.property.landlord_id !== landlord.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      landlordIdForCheck = landlord.id;
    }

    const updateData = {};
    if (propertyId !== undefined) {
      if (landlordIdForCheck) {
        const newProp = await prisma.property.findUnique({
          where: { id: propertyId },
          select: { landlord_id: true },
        });
        if (!newProp || newProp.landlord_id !== landlordIdForCheck) {
          return res.status(403).json({ message: 'Access denied - property not owned by you' });
        }
      }
      updateData.propertyId = propertyId;
    }
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
      include: { property: { select: { landlord_id: true } } },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // LANDLORD: ensure expense belongs to their property
    const userForRole = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { email: true, role: true },
    });
    if (userForRole?.role === 'LANDLORD') {
      const landlord = await prisma.landlord.findUnique({
        where: { email: userForRole.email },
        select: { id: true },
      });
      if (!landlord || existing.property.landlord_id !== landlord.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await prisma.expense.delete({
      where: { id: existing.id },
    });

    res.status(200).json({ message: 'Expense deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
