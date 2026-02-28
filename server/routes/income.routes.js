import express from 'express';
import { getIncomes, createIncome, updateIncome, deleteIncome } from '../controllers/income.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', AuthMiddleware, getIncomes);
router.post('/', AuthMiddleware, createIncome);
router.patch('/:id', AuthMiddleware, updateIncome);
router.delete('/:id', AuthMiddleware, deleteIncome);

export default router;

