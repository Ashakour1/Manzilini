import asyncHandler from 'express-async-handler';
import prisma from '../db/prisma.js';
import { sendNotificationEmail } from '../services/email.service.js';
import { buildTaskAssignmentEmailTemplate, buildTaskReminderEmailTemplate } from '../services/email-template.js';

const TASK_ASSIGNMENT_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);
const TASK_REMINDER_ALLOWED_STATUSES = new Set(['PENDING', 'IN_PROGRESS']);

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
  reminder_at: task.reminderAt,
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

const getActiveAssignableUserById = async (userId) => {
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true
    }
  });

  if (!user || user.status !== 'ACTIVE') {
    return null;
  }

  return user;
};

const parseOptionalDateTime = (rawValue, fieldName) => {
  if (rawValue === undefined) {
    return { hasValue: false, value: null, error: null };
  }

  if (rawValue === null || String(rawValue).trim() === '') {
    return { hasValue: true, value: null, error: null };
  }

  const parsedDate = new Date(rawValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return { hasValue: true, value: null, error: `${fieldName} must be a valid datetime value` };
  }

  return { hasValue: true, value: parsedDate, error: null };
};

const normalizeTimeZone = (rawValue) => {
  if (typeof rawValue !== 'string' || !rawValue.trim()) {
    return null;
  }

  const candidate = rawValue.trim();

  try {
    Intl.DateTimeFormat('en-US', { timeZone: candidate }).format(new Date());
    return candidate;
  } catch (_error) {
    return null;
  }
};

const normalizeTaskCreatePayload = (payload = {}) => {
  const {
    title,
    description,
    assigned_to,
    assignedTo,
    priority,
    due_date,
    dueDate,
    reminder_at,
    reminderAt
  } = payload || {};

  const normalizedTitle = typeof title === 'string' ? title.trim() : '';
  const assignedToValue = assigned_to ?? assignedTo;
  const assignedToId = typeof assignedToValue === 'string' ? String(assignedToValue).trim() : '';
  const normalizedPriority = typeof priority === 'string' ? priority.toLowerCase().trim() : '';
  const priorityEnum = PRIORITY_INPUT_MAP[normalizedPriority];
  const descriptionValue = typeof description === 'string' ? description.trim() : null;

  if (!normalizedTitle) {
    return { error: 'Title is required' };
  }

  if (!assignedToId) {
    return { error: 'assigned_to is required' };
  }

  if (!priorityEnum) {
    return { error: 'Priority is required and must be one of: low, medium, high, urgent' };
  }

  const parsedDueDateResult = parseOptionalDateTime(due_date ?? dueDate, 'due_date');

  if (parsedDueDateResult.error) {
    return { error: parsedDueDateResult.error };
  }

  const parsedReminderAtResult = parseOptionalDateTime(reminder_at ?? reminderAt, 'reminder_at');

  if (parsedReminderAtResult.error) {
    return { error: parsedReminderAtResult.error };
  }

  return {
    error: null,
    value: {
      title: normalizedTitle,
      description: descriptionValue || null,
      assignedToId,
      priority: priorityEnum,
      dueDate: parsedDueDateResult.value,
      reminderAt: parsedReminderAtResult.value
    }
  };
};

const createTaskNotification = async ({ tx, userId, taskTitle }) =>
  tx.notification.create({
    data: {
      userId,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${taskTitle}`,
      type: 'TASK'
    }
  });

const sendTaskAssignmentEmail = async ({
  assignedUser,
  assigner,
  taskTitle,
  description,
  priority,
  dueDate,
  taskId
}) => {
  if (!assignedUser?.email) return;

  const dashboardLoginUrl = getDashboardLoginUrl();
  const normalizedPriority = PRIORITY_OUTPUT_MAP[priority] || String(priority || '').toLowerCase();

  try {
    const taskAssignmentHtml = buildTaskAssignmentEmailTemplate({
      assigneeName: assignedUser.name,
      assignerName: assigner.name,
      taskTitle,
      description,
      priority: normalizedPriority,
      dueDate,
      dashboardLoginUrl
    });

    await sendNotificationEmail(
      assignedUser.email,
      `New Task Assigned: ${taskTitle}`,
      taskAssignmentHtml,
      assignedUser.name,
      null,
      {
        type: 'task_assignment',
        taskId,
        assignedBy: assigner.id,
        priority: PRIORITY_OUTPUT_MAP[priority] || String(priority || '').toLowerCase(),
        dueDate: dueDate ? dueDate.toISOString() : null
      }
    );
  } catch (emailError) {
    // Keep task mutations successful even when email delivery fails.
    console.error('Failed to send task assignment email:', emailError);
  }
};

const sendTaskReminderEmail = async ({ assignedUser, task, timeZone = null }) => {
  if (!assignedUser?.email) {
    throw new Error('Selected task assignee does not have an email');
  }

  const dashboardLoginUrl = getDashboardLoginUrl();
  const normalizedPriority = PRIORITY_OUTPUT_MAP[task.priority] || String(task.priority || '').toLowerCase();
  const reminderTimestamp = task.reminderAt || new Date();

  const taskReminderHtml = buildTaskReminderEmailTemplate({
    assigneeName: assignedUser.name,
    taskTitle: task.title,
    description: task.description,
    priority: normalizedPriority,
    dueDate: task.dueDate,
    reminderAt: reminderTimestamp,
    timeZone,
    dashboardLoginUrl
  });

  await sendNotificationEmail(
    assignedUser.email,
    `Task Reminder: ${task.title}`,
    taskReminderHtml,
    assignedUser.name,
    null,
    {
      type: 'task_reminder',
      taskId: task.id,
      assignedBy: task.assignedById,
      priority: normalizedPriority,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      reminderAt: reminderTimestamp.toISOString(),
      timeZone
    }
  );
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

  const normalized = normalizeTaskCreatePayload(req.body || {});
  if (normalized.error) {
    return res.status(400).json({ message: normalized.error });
  }

  const {
    title: normalizedTitle,
    description: descriptionValue,
    assignedToId,
    priority: priorityEnum,
    dueDate: parsedDueDate,
    reminderAt: parsedReminderAt
  } = normalized.value;

  const assignedUser = await getActiveAssignableUserById(assignedToId);

  if (!assignedUser) {
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
        dueDate: parsedDueDate,
        reminderAt: parsedReminderAt
      },
      include: TASK_WITH_USERS_INCLUDE
    });

    await createTaskNotification({
      tx,
      userId: assignedToId,
      taskTitle: normalizedTitle
    });

    return task;
  });

  await sendTaskAssignmentEmail({
    assignedUser,
    assigner: currentUser,
    taskTitle: normalizedTitle,
    description: descriptionValue,
    priority: createdTask.priority,
    dueDate: parsedDueDate,
    taskId: createdTask.id
  });

  return res.status(201).json({
    message: 'Task created and assigned successfully',
    task: serializeTask(createdTask)
  });
});

// POST /api/v1/tasks/bulk
export const createBulkTasks = asyncHandler(async (req, res) => {
  const currentUser = await getCurrentUser(req.user?.id);

  if (!currentUser) {
    return res.status(401).json({ message: 'User authentication required' });
  }

  if (!isTaskAssignmentRole(currentUser.role)) {
    return res.status(403).json({ message: 'Access denied. Only authorized users can assign tasks.' });
  }

  const rawTasks = Array.isArray(req.body?.tasks) ? req.body.tasks : Array.isArray(req.body) ? req.body : null;

  if (!rawTasks || !rawTasks.length) {
    return res.status(400).json({ message: 'tasks is required and must contain at least one task' });
  }

  if (rawTasks.length > 100) {
    return res.status(400).json({ message: 'A maximum of 100 tasks can be assigned per request' });
  }

  const normalizedTasks = [];
  const assigneeIds = new Set();

  for (let index = 0; index < rawTasks.length; index += 1) {
    const normalized = normalizeTaskCreatePayload(rawTasks[index]);
    if (normalized.error) {
      return res.status(400).json({ message: `Task ${index + 1}: ${normalized.error}` });
    }

    normalizedTasks.push(normalized.value);
    assigneeIds.add(normalized.value.assignedToId);
  }

  const assignedUsers = await prisma.user.findMany({
    where: {
      id: { in: Array.from(assigneeIds) },
      status: 'ACTIVE'
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true
    }
  });

  const assignedUsersMap = new Map(assignedUsers.map((user) => [user.id, user]));

  for (let index = 0; index < normalizedTasks.length; index += 1) {
    if (!assignedUsersMap.has(normalizedTasks[index].assignedToId)) {
      return res
        .status(400)
        .json({ message: `Task ${index + 1}: Task can only be assigned to active users` });
    }
  }

  const createdTasks = await prisma.$transaction(async (tx) => {
    const results = [];

    for (const taskInput of normalizedTasks) {
      const task = await tx.task.create({
        data: {
          title: taskInput.title,
          description: taskInput.description,
          assignedToId: taskInput.assignedToId,
          assignedById: currentUser.id,
          priority: taskInput.priority,
          status: 'PENDING',
          dueDate: taskInput.dueDate,
          reminderAt: taskInput.reminderAt
        },
        include: TASK_WITH_USERS_INCLUDE
      });

      await createTaskNotification({
        tx,
        userId: taskInput.assignedToId,
        taskTitle: taskInput.title
      });

      results.push(task);
    }

    return results;
  });

  await Promise.all(
    createdTasks.map((task) =>
      sendTaskAssignmentEmail({
        assignedUser: assignedUsersMap.get(task.assignedToId),
        assigner: currentUser,
        taskTitle: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        taskId: task.id
      })
    )
  );

  return res.status(201).json({
    message: `${createdTasks.length} tasks created and assigned successfully`,
    count: createdTasks.length,
    tasks: createdTasks.map(serializeTask)
  });
});

// PATCH /api/v1/tasks/:id
export const updateTask = asyncHandler(async (req, res) => {
  const currentUser = await getCurrentUser(req.user?.id);

  if (!currentUser) {
    return res.status(401).json({ message: 'User authentication required' });
  }

  if (!isTaskAssignmentRole(currentUser.role)) {
    return res.status(403).json({ message: 'Access denied. Only authorized users can edit tasks.' });
  }

  const { id } = req.params;
  const payload = req.body || {};
  const existingTask = await prisma.task.findUnique({
    where: { id },
    include: TASK_WITH_USERS_INCLUDE
  });

  if (!existingTask) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const hasTitle = Object.prototype.hasOwnProperty.call(payload, 'title');
  const hasDescription = Object.prototype.hasOwnProperty.call(payload, 'description');
  const hasPriority = Object.prototype.hasOwnProperty.call(payload, 'priority');
  const hasStatus = Object.prototype.hasOwnProperty.call(payload, 'status');
  const hasAssignedTo =
    Object.prototype.hasOwnProperty.call(payload, 'assigned_to') ||
    Object.prototype.hasOwnProperty.call(payload, 'assignedTo');
  const hasDueDate =
    Object.prototype.hasOwnProperty.call(payload, 'due_date') ||
    Object.prototype.hasOwnProperty.call(payload, 'dueDate');
  const hasReminderAt =
    Object.prototype.hasOwnProperty.call(payload, 'reminder_at') ||
    Object.prototype.hasOwnProperty.call(payload, 'reminderAt');

  const updateData = {};
  let updatedAssignedUser = null;

  if (hasTitle) {
    const normalizedTitle = typeof payload.title === 'string' ? payload.title.trim() : '';
    if (!normalizedTitle) {
      return res.status(400).json({ message: 'Title is required' });
    }
    updateData.title = normalizedTitle;
  }

  if (hasDescription) {
    if (payload.description === null || payload.description === undefined) {
      updateData.description = null;
    } else if (typeof payload.description === 'string') {
      const normalizedDescription = payload.description.trim();
      updateData.description = normalizedDescription || null;
    } else {
      return res.status(400).json({ message: 'description must be a string or null' });
    }
  }

  if (hasPriority) {
    const normalizedPriority = typeof payload.priority === 'string' ? payload.priority.toLowerCase().trim() : '';
    const priorityEnum = PRIORITY_INPUT_MAP[normalizedPriority];
    if (!priorityEnum) {
      return res.status(400).json({ message: 'priority must be one of: low, medium, high, urgent' });
    }
    updateData.priority = priorityEnum;
  }

  if (hasStatus) {
    const normalizedStatus = typeof payload.status === 'string' ? payload.status.toLowerCase().trim() : '';
    const statusEnum = STATUS_INPUT_MAP[normalizedStatus];
    if (!statusEnum) {
      return res.status(400).json({
        message: 'status must be one of: pending, in_progress, completed, cancelled'
      });
    }
    updateData.status = statusEnum;
  }

  if (hasAssignedTo) {
    const assignedToIdRaw = payload.assigned_to ?? payload.assignedTo;
    const assignedToId = typeof assignedToIdRaw === 'string' ? assignedToIdRaw.trim() : '';

    if (!assignedToId) {
      return res.status(400).json({ message: 'assigned_to is required when updating task assignee' });
    }

    updatedAssignedUser = await getActiveAssignableUserById(assignedToId);
    if (!updatedAssignedUser) {
      return res.status(400).json({ message: 'Task can only be assigned to active users' });
    }

    updateData.assignedToId = assignedToId;
  }

  if (hasDueDate) {
    const parsedDueDateResult = parseOptionalDateTime(payload.due_date ?? payload.dueDate, 'due_date');
    if (parsedDueDateResult.error) {
      return res.status(400).json({ message: parsedDueDateResult.error });
    }
    updateData.dueDate = parsedDueDateResult.value;
  }

  if (hasReminderAt) {
    const parsedReminderAtResult = parseOptionalDateTime(
      payload.reminder_at ?? payload.reminderAt,
      'reminder_at'
    );
    if (parsedReminderAtResult.error) {
      return res.status(400).json({ message: parsedReminderAtResult.error });
    }
    updateData.reminderAt = parsedReminderAtResult.value;
  }

  if (!Object.keys(updateData).length) {
    return res.status(400).json({ message: 'At least one valid field is required to update a task' });
  }

  const reassignedUserId =
    updateData.assignedToId && updateData.assignedToId !== existingTask.assignedToId
      ? updateData.assignedToId
      : null;

  const updatedTask = await prisma.$transaction(async (tx) => {
    const task = await tx.task.update({
      where: { id },
      data: updateData,
      include: TASK_WITH_USERS_INCLUDE
    });

    if (reassignedUserId) {
      await createTaskNotification({
        tx,
        userId: reassignedUserId,
        taskTitle: task.title
      });
    }

    return task;
  });

  if (reassignedUserId && updatedAssignedUser) {
    await sendTaskAssignmentEmail({
      assignedUser: updatedAssignedUser,
      assigner: currentUser,
      taskTitle: updatedTask.title,
      description: updatedTask.description,
      priority: updatedTask.priority,
      dueDate: updatedTask.dueDate,
      taskId: updatedTask.id
    });
  }

  return res.status(200).json({
    message: 'Task updated successfully',
    task: serializeTask(updatedTask)
  });
});

// POST /api/v1/tasks/:id/reminder
export const sendTaskReminder = asyncHandler(async (req, res) => {
  const currentUser = await getCurrentUser(req.user?.id);

  if (!currentUser) {
    return res.status(401).json({ message: 'User authentication required' });
  }

  if (!isTaskAssignmentRole(currentUser.role)) {
    return res.status(403).json({ message: 'Access denied. Only authorized users can send reminders.' });
  }

  const { id } = req.params;
  const preferredTimeZone = normalizeTimeZone(req.body?.timezone);
  const existingTask = await prisma.task.findUnique({
    where: { id },
    include: TASK_WITH_USERS_INCLUDE
  });

  if (!existingTask) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (!TASK_REMINDER_ALLOWED_STATUSES.has(existingTask.status)) {
    return res.status(400).json({
      message: 'Reminder can only be sent for pending or in-progress tasks'
    });
  }

  if (!existingTask.assignedTo?.email) {
    return res.status(400).json({
      message: 'Task assignee does not have an email address configured'
    });
  }

  let taskForReminder = existingTask;

  if (!existingTask.reminderAt) {
    taskForReminder = await prisma.task.update({
      where: { id: existingTask.id },
      data: {
        reminderAt: new Date()
      },
      include: TASK_WITH_USERS_INCLUDE
    });
  }

  await sendTaskReminderEmail({
    assignedUser: taskForReminder.assignedTo,
    task: taskForReminder,
    timeZone: preferredTimeZone
  });

  await prisma.notification.create({
    data: {
      userId: taskForReminder.assignedToId,
      title: 'Task Reminder',
      message: `Reminder sent for task: ${taskForReminder.title}`,
      type: 'TASK'
    }
  });

  return res.status(200).json({
    message: 'Task reminder sent successfully',
    task: serializeTask(taskForReminder)
  });
});

// DELETE /api/v1/tasks/:id
export const deleteTask = asyncHandler(async (req, res) => {
  const currentUser = await getCurrentUser(req.user?.id);

  if (!currentUser) {
    return res.status(401).json({ message: 'User authentication required' });
  }

  if (!isTaskAssignmentRole(currentUser.role)) {
    return res.status(403).json({ message: 'Access denied. Only authorized users can delete tasks.' });
  }

  const { id } = req.params;
  const existingTask = await prisma.task.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!existingTask) {
    return res.status(404).json({ message: 'Task not found' });
  }

  await prisma.task.delete({
    where: { id }
  });

  return res.status(200).json({ message: 'Task deleted successfully' });
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
