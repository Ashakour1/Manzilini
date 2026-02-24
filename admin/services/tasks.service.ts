import { API_URL, getAuthHeaders } from "../lib/api";

const TASKS_API_URL = `${API_URL}/tasks`;

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface TaskUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string;
  assigned_by: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  assigned_user?: TaskUser | null;
  assigned_by_user?: TaskUser | null;
}

export interface TaskDashboardSummary {
  total_pending_tasks: number;
  latest_tasks: TaskItem[];
  unread_notification_count: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  assigned_to: string;
  priority: TaskPriority;
  due_date?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  assigned_to?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_date?: string | null;
}

const parseApiError = async (response: Response, fallbackMessage: string) => {
  try {
    const payload = await response.json();
    return payload?.message || fallbackMessage;
  } catch (_error) {
    return fallbackMessage;
  }
};

// Active users available for assignment
export const getAssignableActiveUsers = async (): Promise<TaskUser[]> => {
  const response = await fetch(`${TASKS_API_URL}/assignable-users`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to fetch assignable users"));
  }

  return response.json();
};

// Create and assign a task
export const createTask = async (payload: CreateTaskPayload): Promise<{ message: string; task: TaskItem }> => {
  const response = await fetch(TASKS_API_URL, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to create task"));
  }

  return response.json();
};

// Edit task details (authorization enforced by backend)
export const updateTask = async (
  taskId: string,
  payload: UpdateTaskPayload
): Promise<{ message: string; task: TaskItem }> => {
  const response = await fetch(`${TASKS_API_URL}/${taskId}`, {
    method: "PATCH",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to update task"));
  }

  return response.json();
};

// Delete task (authorization enforced by backend)
export const deleteTask = async (taskId: string): Promise<{ message: string }> => {
  const response = await fetch(`${TASKS_API_URL}/${taskId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to delete task"));
  }

  return response.json();
};

// Current user's tasks
export const getMyTasks = async (): Promise<TaskItem[]> => {
  const response = await fetch(`${TASKS_API_URL}/mine`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to fetch your tasks"));
  }

  return response.json();
};

// Tasks assigned to any specific user
export const getTasksAssignedToUser = async (userId: string): Promise<TaskItem[]> => {
  const response = await fetch(`${TASKS_API_URL}/assigned/${userId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to fetch user tasks"));
  }

  return response.json();
};

// Only assigned users can update their own task status (enforced by backend)
export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<{ message: string; task: TaskItem }> => {
  const response = await fetch(`${TASKS_API_URL}/${taskId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to update task status"));
  }

  return response.json();
};

// Dashboard summary for pending tasks + unread notifications
export const getTaskDashboardSummary = async (): Promise<TaskDashboardSummary> => {
  const response = await fetch(`${TASKS_API_URL}/dashboard/summary`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to fetch task summary"));
  }

  return response.json();
};
