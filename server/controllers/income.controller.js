import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';
import { generateUniqueIdAndCreate } from '../utils/idGenerator.js';

// Get all incomes, optionally filtered by account or date range
export const getIncomes = asyncHandler(async (req, res) => {
  try {
    const { accountId, landlordId, propertyId, from, to } = req.query;

    const where = {
      accountId: accountId || undefined,
      landlordId: landlordId || undefined,
      propertyId: propertyId || undefined,
      date:
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
        account: true,
        property: true,
        landlord: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create income
export const createIncome = asyncHandler(async (req, res) => {
  try {
    const {
      date,
      source,
      amount,
      paymentMethod,
      accountId,
      propertyId,
      landlordId,
      reference,
      description,
    } = req.body || {};

    if (!date || !source || !amount || !paymentMethod || !accountId) {
      return res.status(400).json({
        message:
          'date, source, amount, paymentMethod and accountId are required fields',
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    // Validate account exists
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      return res.status(400).json({ message: 'Account not found' });
    }

    // Generate unique ID and create income in a single transaction
    const income = await generateUniqueIdAndCreate(
      'Income',
      async (tx, uniqueId) => {
        const created = await tx.income.create({
          data: {
            id: uniqueId,
            date: new Date(date),
            source,
            amount,
            paymentMethod,
            accountId,
            propertyId: propertyId || null,
            landlordId: landlordId || null,
            reference: reference || null,
            description: description || null,
            createdById: userId,
          },
        });

        // Update account balance
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: amount,
            },
          },
        });

        return created;
      }
    );

    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete income and adjust account balance
export const deleteIncome = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.income.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Income not found' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.income.delete({
        where: { id: existing.id },
      });

      await tx.account.update({
        where: { id: existing.accountId },
        data: {
          balance: {
            decrement: existing.amount,
          },
        },
      });
    });

    res.status(200).json({ message: 'Income deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

