import express from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expense.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', AuthMiddleware, getExpenses);
router.post('/', AuthMiddleware, createExpense);
router.patch('/:id', AuthMiddleware, updateExpense);
router.delete('/:id', AuthMiddleware, deleteExpense);

export default router;

