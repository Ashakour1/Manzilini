import express from 'express';
import { AuthMiddleware, AdminMiddleware } from '../middlewares/auth.middleware.js';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../controllers/employees.controller.js';

const router = express.Router();

router.get('/', AuthMiddleware, AdminMiddleware, getEmployees);
router.get('/:id', AuthMiddleware, AdminMiddleware, getEmployeeById);
router.post('/', AuthMiddleware, AdminMiddleware, createEmployee);
router.put('/:id', AuthMiddleware, AdminMiddleware, updateEmployee);
router.delete('/:id', AuthMiddleware, AdminMiddleware, deleteEmployee);

export default router;
