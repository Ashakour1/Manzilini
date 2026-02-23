import express from 'express';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/mine', AuthMiddleware, getMyNotifications);
router.get('/unread-count', AuthMiddleware, getUnreadNotificationCount);
router.patch('/read-all', AuthMiddleware, markAllNotificationsAsRead);
router.patch('/:id/read', AuthMiddleware, markNotificationAsRead);

export default router;
