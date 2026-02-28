import express from 'express';
import {
  getPropertyIncomes,
  createPropertyIncome,
  updatePropertyIncome,
  deletePropertyIncome,
} from '../controllers/landlord-income.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', AuthMiddleware, getPropertyIncomes);
router.post('/', AuthMiddleware, createPropertyIncome);
router.patch('/:id', AuthMiddleware, updatePropertyIncome);
router.delete('/:id', AuthMiddleware, deletePropertyIncome);

export default router;
