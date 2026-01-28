import express from 'express';
import { getIncomes, createIncome, deleteIncome } from '../controllers/income.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', AuthMiddleware, getIncomes);
router.post('/', AuthMiddleware, createIncome);
router.delete('/:id', AuthMiddleware, deleteIncome);

export default router;

