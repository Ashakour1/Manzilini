import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';

const parseBoolean = (value) => {
  if (value === undefined || value === null) return false;
  const normalized = String(value).toLowerCase().trim();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
};

const serializeNotification = (notification) => ({
  id: notification.id,
  user_id: notification.userId,
  title: notification.title,
  message: notification.message,
  type: notification.type ? notification.type.toLowerCase() : null,
  is_read: notification.isRead,
  created_at: notification.createdAt
});

const getCurrentUser = async (userId) => {
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true
    }
  });
};

// GET /api/v1/notifications/mine
export const getMyNotifications = asyncHandler(async (req, res) => {
  const currentUser = await getCurrentUser(req.user?.id);

  if (!currentUser) {
    return res.status(401).json({ message: 'User authentication required' });
  }

  const onlyUnread = parseBoolean(req.query.onlyUnread ?? req.query.only_unread);
  const rawLimit = Number(req.query.limit);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20;

  const where = {
    userId: currentUser.id,
    ...(onlyUnread ? { isRead: false } : {})
  };

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    }),
    prisma.notification.count({
      where: {
        userId: currentUser.id,
        isRead: false
      }
    })
  ]);

  return res.status(200).json({
    notifications: notifications.map(serializeNotification),
    unread_count: unreadCount
  });
});

// GET /api/v1/notifications/unread-count
export const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  const currentUser = await getCurrentUser(req.user?.id);

  if (!currentUser) {
    return res.status(401).json({ message: 'User authentication required' });
  }

  const unreadCount = await prisma.notification.count({
    where: {
      userId: currentUser.id,
      isRead: false
    }
  });

  return res.status(200).json({ unread_count: unreadCount });
});

// PATCH /api/v1/notifications/:id/read
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const currentUser = await getCurrentUser(req.user?.id);

  if (!currentUser) {
    return res.status(401).json({ message: 'User authentication required' });
  }

  const { id } = req.params;

  const existingNotification = await prisma.notification.findUnique({
    where: { id }
  });

  if (!existingNotification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  if (existingNotification.userId !== currentUser.id) {
    return res.status(403).json({ message: 'Access denied. You can only update your own notifications.' });
  }

  const notification = await prisma.notification.update({
    where: { id },
    data: {
      isRead: true
    }
  });

  return res.status(200).json({
    message: 'Notification marked as read',
    notification: serializeNotification(notification)
  });
});

// PATCH /api/v1/notifications/read-all
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const currentUser = await getCurrentUser(req.user?.id);

  if (!currentUser) {
    return res.status(401).json({ message: 'User authentication required' });
  }

  const result = await prisma.notification.updateMany({
    where: {
      userId: currentUser.id,
      isRead: false
    },
    data: {
      isRead: true
    }
  });

  return res.status(200).json({
    message: 'All notifications marked as read',
    updated_count: result.count
  });
});
