import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';

// Get all property incomes (landlord-level), scoped by authenticated user
export const getPropertyIncomes = asyncHandler(async (req, res) => {
  try {
    const { propertyId, tenantId, from, to } = req.query;

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
      tenantId: tenantId || undefined,
      incomeDate:
        from || to
          ? {
              gte: from ? new Date(from) : undefined,
              lte: to ? new Date(to) : undefined,
            }
          : undefined,
      ...(landlordId && { property: { landlord_id: landlordId } }),
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
      include: { property: { select: { landlord_id: true } } },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Income not found' });
    }

    // LANDLORD: ensure income belongs to their property
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
      include: { property: { select: { landlord_id: true } } },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Income not found' });
    }

    // LANDLORD: ensure income belongs to their property
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

    await prisma.income.delete({
      where: { id: existing.id },
    });

    res.status(200).json({ message: 'Income deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
