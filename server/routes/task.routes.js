import express from 'express';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import {
  getAssignableActiveUsers,
  createTask,
  getTasksAssignedToUser,
  getMyAssignedTasks,
  updateOwnTaskStatus,
  getTaskDashboardSummary
} from '../controllers/task.controller.js';

const router = express.Router();

router.get('/assignable-users', AuthMiddleware, getAssignableActiveUsers);
router.post('/', AuthMiddleware, createTask);
router.get('/dashboard/summary', AuthMiddleware, getTaskDashboardSummary);
router.get('/mine', AuthMiddleware, getMyAssignedTasks);
router.get('/assigned/:userId', AuthMiddleware, getTasksAssignedToUser);
router.patch('/:id/status', AuthMiddleware, updateOwnTaskStatus);

export default router;
