import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';
import { generateUniqueIdAndCreate } from '../utils/idGenerator.js';

// Get all expenses, optionally filtered
export const getExpenses = asyncHandler(async (req, res) => {
  try {
    const { accountId, landlordId, propertyId, category, from, to } = req.query;

    const where = {
      accountId: accountId || undefined,
      landlordId: landlordId || undefined,
      propertyId: propertyId || undefined,
      category: category || undefined,
      date:
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
        account: true,
        property: true,
        landlord: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create expense
export const createExpense = asyncHandler(async (req, res) => {
  try {
    const {
      date,
      category,
      amount,
      paymentMethod,
      accountId,
      vendorName,
      propertyId,
      landlordId,
      reference,
      description,
    } = req.body || {};

    if (!date || !category || !amount || !paymentMethod || !accountId) {
      return res.status(400).json({
        message:
          'date, category, amount, paymentMethod and accountId are required fields',
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      return res.status(400).json({ message: 'Account not found' });
    }

    // Generate unique ID and create expense in a single transaction
    const expense = await generateUniqueIdAndCreate(
      'Expense',
      async (tx, uniqueId) => {
        const created = await tx.expense.create({
          data: {
            id: uniqueId,
            date: new Date(date),
            category,
            amount,
            paymentMethod,
            accountId,
            vendorName: vendorName || null,
            propertyId: propertyId || null,
            landlordId: landlordId || null,
            reference: reference || null,
            description: description || null,
            createdById: userId,
          },
        });

        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });

        return created;
      }
    );

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete expense and adjust account balance
export const deleteExpense = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.expense.delete({
        where: { id: existing.id },
      });

      await tx.account.update({
        where: { id: existing.accountId },
        data: {
          balance: {
            increment: existing.amount,
          },
        },
      });
    });

    res.status(200).json({ message: 'Expense deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

