import express from 'express';
import {
  getPropertyExpenses,
  createPropertyExpense,
  updatePropertyExpense,
  deletePropertyExpense,
} from '../controllers/landlord-expense.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', AuthMiddleware, getPropertyExpenses);
router.post('/', AuthMiddleware, createPropertyExpense);
router.patch('/:id', AuthMiddleware, updatePropertyExpense);
router.delete('/:id', AuthMiddleware, deletePropertyExpense);

export default router;
