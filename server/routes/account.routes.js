import express from 'express';
import {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../controllers/account.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', AuthMiddleware, getAccounts);
router.get('/:id', AuthMiddleware, getAccountById);
router.post('/', AuthMiddleware, createAccount);
router.put('/:id', AuthMiddleware, updateAccount);
router.delete('/:id', AuthMiddleware, deleteAccount);

export default router;

