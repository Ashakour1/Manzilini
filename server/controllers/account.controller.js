import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';
import { generateUniqueIdAndCreate } from '../utils/idGenerator.js';

// Get all accounts with basic aggregates
export const getAccounts = asyncHandler(async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        incomes: true,
        expenses: true,
      },
      orderBy: { name: 'asc' },
    });

    const result = accounts.map((account) => {
      const totalIncome = account.incomes.reduce(
        (sum, inc) => sum + Number(inc.amount || 0),
        0
      );
      const totalExpense = account.expenses.reduce(
        (sum, exp) => sum + Number(exp.amount || 0),
        0
      );

      return {
        id: account.id,
        name: account.name,
        balance: Number(account.balance || 0),
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single account with incomes and expenses
export const getAccountById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        incomes: {
          orderBy: { date: 'desc' },
        },
        expenses: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create account with generated ID
export const createAccount = asyncHandler(async (req, res) => {
  try {
    const { name, balance } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: 'Account name is required' });
    }

    const initialBalance = balance != null ? Number(balance) : 0;

    const account = await generateUniqueIdAndCreate(
      'Account',
      async (tx, uniqueId) => {
        return await tx.account.create({
          data: {
            id: uniqueId,
            name,
            balance: initialBalance,
          },
        });
      }
    );

    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update account (name / balance)
export const updateAccount = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, balance } = req.body || {};

    const existing = await prisma.account.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (balance !== undefined) data.balance = Number(balance);

    const account = await prisma.account.update({
      where: { id },
      data,
    });

    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete account (only if no incomes/expenses linked)
export const deleteAccount = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const account = await prisma.account.findUnique({
      where: { id },
      include: { incomes: true, expenses: true },
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (account.incomes.length || account.expenses.length) {
      return res.status(400).json({
        message:
          'Cannot delete account with existing incomes or expenses. Please move or delete related records first.',
      });
    }

    await prisma.account.delete({ where: { id } });

    res.status(200).json({ message: 'Account deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

