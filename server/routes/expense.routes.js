import express from 'express';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expense.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', AuthMiddleware, getExpenses);
router.post('/', AuthMiddleware, createExpense);
router.delete('/:id', AuthMiddleware, deleteExpense);

export default router;

