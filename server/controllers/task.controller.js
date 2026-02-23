import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';
import { sendNotificationEmail } from '../services/email.service.js';

const TASK_ASSIGNMENT_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);

const PRIORITY_INPUT_MAP = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  urgent: 'URGENT'
};

const PRIORITY_OUTPUT_MAP = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

const STATUS_INPUT_MAP = {
  pending: 'PENDING',
  in_progress: 'IN_PROGRESS',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED'
};

const STATUS_OUTPUT_MAP = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const TASK_WITH_USERS_INCLUDE = {
  assignedTo: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  },
  assignedBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  }
};

const isTaskAssignmentRole = (role) => TASK_ASSIGNMENT_ROLES.has(role);

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDateForEmail = (date) =>
  date
    ? new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Not specified';

const formatPriorityForEmail = (priority) => {
  const normalized = PRIORITY_OUTPUT_MAP[priority] || '';
  if (!normalized) return '';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getDashboardLoginUrl = () =>
  process.env.ADMIN_LOGIN_URL ||
  process.env.AGENT_PORTAL_URL ||
  'https://panel.manzilini.com/agent-login';

const serializeUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

const serializeTask = (task) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  assigned_to: task.assignedToId,
  assigned_by: task.assignedById,
  priority: PRIORITY_OUTPUT_MAP[task.priority] || task.priority?.toLowerCase(),
  status: STATUS_OUTPUT_MAP[task.status] || task.status?.toLowerCase(),
  due_date: task.dueDate,
  created_at: task.createdAt,
  updated_at: task.updatedAt,
  assigned_user: serializeUser(task.assignedTo),
  assigned_by_user: serializeUser(task.assignedBy)
});

const getCurrentUser = async (userId) => {
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true
    }
  });
};

const buildTaskAssignmentEmail = ({
  assigneeName,
  assignerName,
  taskTitle,
  description,
  priority,
  dueDate,
  dashboardLoginUrl
}) => {
  const safeTaskTitle = escapeHtml(taskTitle);
  const safeDescription = description ? escapeHtml(description) : 'No description provided';
  const safeAssigneeName = escapeHtml(assigneeName || 'there');
  const safeAssignerName = escapeHtml(assignerName || 'A team member');
  const safePriority = escapeHtml(formatPriorityForEmail(priority));
  const safeDueDate = escapeHtml(formatDateForEmail(dueDate));
  const safeLoginUrl = escapeHtml(dashboardLoginUrl);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 40px 20px; background-color: #ffffff; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .content { padding: 40px 30px; }
          .logo { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 24px; }
          h1 { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px 0; }
          p { font-size: 16px; color: #4a4a4a; margin: 0 0 14px 0; }
          .details { margin: 22px 0; padding: 18px; border: 1px solid #e5e5e5; border-radius: 6px; background: #fafafa; }
          .details p { margin: 8px 0; font-size: 15px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #1a1a1a; color: #ffffff !important; text-decoration: none; border-radius: 4px; margin: 12px 0 18px 0; font-weight: 500; }
          .footer { margin-top: 36px; padding-top: 22px; border-top: 1px solid #e5e5e5; text-align: center; color: #8a8a8a; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="logo">Manzilini</div>
            <h1>New Task Assigned</h1>
            <p>Hello ${safeAssigneeName},</p>
            <p>${safeAssignerName} assigned a new task to you.</p>

            <div class="details">
              <p><strong>Task:</strong> ${safeTaskTitle}</p>
              <p><strong>Description:</strong> ${safeDescription}</p>
              <p><strong>Priority:</strong> ${safePriority}</p>
              <p><strong>Due Date:</strong> ${safeDueDate}</p>
              <p><strong>Assigned By:</strong> ${safeAssignerName}</p>
            </div>

            <a href="${safeLoginUrl}" class="button">Log in to Dashboard</a>

            <p>Best regards,<br>The Manzilini Team</p>

            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Manzilini. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

// GET /api/v1/tasks/assignable-users
export const getAssignableActiveUsers = asyncHandler(async (req, res) => {
  const currentUser = await getCurrentUser(req.user?.id);

  if (!currentUser) {
    return res.status(401).json({ message: 'User authentication required' });
  }

  if (!isTaskAssignmentRole(currentUser.role)) {
    return res.status(403).json({ message: 'Access denied. Only authorized users can assign tasks.' });
  }

  const activeUsers = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  return res.status(200).json(activeUsers);
});

// POST /api/v1/tasks
export const createTask = asyncHandler(async (req, res) => {
  const currentUser = await getCurrentUser(req.user?.id);

  if (!currentUser) {
    return res.status(401).json({ message: 'User authentication required' });
  }

  if (!isTaskAssignmentRole(currentUser.role)) {
    return res.status(403).json({ message: 'Access denied. Only authorized users can assign tasks.' });
  }

  const { title, description, assigned_to, assignedTo, priority, due_date, dueDate } = req.body || {};

  const normalizedTitle = typeof title === 'string' ? title.trim() : '';
  const assignedToId = assigned_to || assignedTo;
  const normalizedPriority = typeof priority === 'string' ? priority.toLowerCase().trim() : '';
  const priorityEnum = PRIORITY_INPUT_MAP[normalizedPriority];
  const descriptionValue = typeof description === 'string' ? description.trim() : null;

  if (!normalizedTitle) {
    return res.status(400).json({ message: 'Title is required' });
  }

  if (!assignedToId) {
    return res.status(400).json({ message: 'assigned_to is required' });
  }

  if (!priorityEnum) {
    return res.status(400).json({ message: 'Priority is required and must be one of: low, medium, high, urgent' });
  }

  const dueDateInput = due_date ?? dueDate;
  let parsedDueDate = null;

  if (dueDateInput !== undefined && dueDateInput !== null && String(dueDateInput).trim() !== '') {
    const date = new Date(dueDateInput);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({ message: 'due_date must be a valid datetime value' });
    }

    parsedDueDate = date;
  }

  const assignedUser = await prisma.user.findUnique({
    where: { id: assignedToId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true
    }
  });

  if (!assignedUser) {
    return res.status(404).json({ message: 'Assigned user not found' });
  }

  if (assignedUser.status !== 'ACTIVE') {
    return res.status(400).json({ message: 'Task can only be assigned to active users' });
  }

  const createdTask = await prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        title: normalizedTitle,
        description: descriptionValue || null,
        assignedToId,
        assignedById: currentUser.id,
        priority: priorityEnum,
        status: 'PENDING',
        dueDate: parsedDueDate
      },
      include: TASK_WITH_USERS_INCLUDE
    });

    await tx.notification.create({
      data: {
        userId: assignedToId,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${normalizedTitle}`,
        type: 'TASK'
      }
    });

    return task;
  });

  const dashboardLoginUrl = getDashboardLoginUrl();

  try {
    const taskAssignmentHtml = buildTaskAssignmentEmail({
      assigneeName: assignedUser.name,
      assignerName: currentUser.name,
      taskTitle: normalizedTitle,
      description: descriptionValue,
      priority: createdTask.priority,
      dueDate: parsedDueDate,
      dashboardLoginUrl
    });

    await sendNotificationEmail(
      assignedUser.email,
      `New Task Assigned: ${normalizedTitle}`,
      taskAssignmentHtml,
      assignedUser.name,
      null,
      {
        type: 'task_assignment',
        taskId: createdTask.id,
        assignedBy: currentUser.id,
        priority: PRIORITY_OUTPUT_MAP[createdTask.priority] || normalizedPriority,
        dueDate: parsedDueDate ? parsedDueDate.toISOString() : null
      }
    );
  } catch (emailError) {
    // Keep task creation successful even when email delivery fails.
    console.error('Failed to send task assignment email:', emailError);
  }

  return res.status(201).json({
    message: 'Task created and assigned successfully',
    task: serializeTask(createdTask)
  });
});

// GET /api/v1/tasks/assigned/:userId
export const getTasksAssignedToUser = asyncHandler(async (req, res) => {
  const currentUser = await getCurrentUser(req.user?.id);

  if (!currentUser) {
    return res.status(401).json({ message: 'User authentication required' });
  }

  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const canAccessRequestedUserTasks =
    currentUser.id === userId || isTaskAssignmentRole(currentUser.role);

  if (!canAccessRequestedUserTasks) {
    return res.status(403).json({ message: 'Access denied. You can only view your own assigned tasks.' });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true
    }
  });

  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  const tasks = await prisma.task.findMany({
    where: {
      assignedToId: userId
    },
    include: TASK_WITH_USERS_INCLUDE,
    orderBy: {
      createdAt: 'desc'
    }
  });

  return res.status(200).json(tasks.map(serializeTask));
});

// GET /api/v1/tasks/mine
export const getMyAssignedTasks = asyncHandler(async (req, res) => {
  const currentUser = await getCurrentUser(req.user?.id);

  if (!currentUser) {
    return res.status(401).json({ message: 'User authentication required' });
  }

  const tasks = await prisma.task.findMany({
    where: {
      assignedToId: currentUser.id
    },
    include: TASK_WITH_USERS_INCLUDE,
    orderBy: {
      createdAt: 'desc'
    }
  });

  return res.status(200).json(tasks.map(serializeTask));
});

// PATCH /api/v1/tasks/:id/status
export const updateOwnTaskStatus = asyncHandler(async (req, res) => {
  const currentUser = await getCurrentUser(req.user?.id);

  if (!currentUser) {
    return res.status(401).json({ message: 'User authentication required' });
  }

  const { id } = req.params;
  const { status } = req.body || {};
  const normalizedStatus = typeof status === 'string' ? status.toLowerCase().trim() : '';
  const statusEnum = STATUS_INPUT_MAP[normalizedStatus];

  if (!statusEnum) {
    return res.status(400).json({
      message: 'Status is required and must be one of: pending, in_progress, completed, cancelled'
    });
  }

  const existingTask = await prisma.task.findUnique({
    where: { id },
    include: TASK_WITH_USERS_INCLUDE
  });

  if (!existingTask) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (existingTask.assignedToId !== currentUser.id) {
    return res.status(403).json({ message: 'Access denied. You can only update your own task status.' });
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      status: statusEnum
    },
    include: TASK_WITH_USERS_INCLUDE
  });

  return res.status(200).json({
    message: 'Task status updated successfully',
    task: serializeTask(updatedTask)
  });
});

// GET /api/v1/tasks/dashboard/summary
export const getTaskDashboardSummary = asyncHandler(async (req, res) => {
  const currentUser = await getCurrentUser(req.user?.id);

  if (!currentUser) {
    return res.status(401).json({ message: 'User authentication required' });
  }

  const [pendingTasksCount, latestTasks, unreadNotificationCount] = await Promise.all([
    prisma.task.count({
      where: {
        assignedToId: currentUser.id,
        status: 'PENDING'
      }
    }),
    prisma.task.findMany({
      where: {
        assignedToId: currentUser.id
      },
      include: TASK_WITH_USERS_INCLUDE,
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    }),
    prisma.notification.count({
      where: {
        userId: currentUser.id,
        isRead: false
      }
    })
  ]);

  return res.status(200).json({
    total_pending_tasks: pendingTasksCount,
    latest_tasks: latestTasks.map(serializeTask),
    unread_notification_count: unreadNotificationCount
  });
});
