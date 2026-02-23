import { API_URL, getAuthHeaders } from "../lib/api";

const NOTIFICATIONS_API_URL = `${API_URL}/notifications`;

export type NotificationType = "task" | "system" | "alert";

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unread_count: number;
}

const parseApiError = async (response: Response, fallbackMessage: string) => {
  try {
    const payload = await response.json();
    return payload?.message || fallbackMessage;
  } catch (_error) {
    return fallbackMessage;
  }
};

export const getMyNotifications = async (params?: {
  onlyUnread?: boolean;
  limit?: number;
}): Promise<NotificationsResponse> => {
  const query = new URLSearchParams();

  if (params?.onlyUnread) {
    query.set("onlyUnread", "true");
  }
  if (params?.limit && params.limit > 0) {
    query.set("limit", String(params.limit));
  }

  const url = query.toString()
    ? `${NOTIFICATIONS_API_URL}/mine?${query.toString()}`
    : `${NOTIFICATIONS_API_URL}/mine`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to fetch notifications"));
  }

  return response.json();
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await fetch(`${NOTIFICATIONS_API_URL}/unread-count`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to fetch unread notification count"));
  }

  const payload = await response.json();
  return Number(payload?.unread_count || 0);
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<{ message: string; notification: NotificationItem }> => {
  const response = await fetch(`${NOTIFICATIONS_API_URL}/${notificationId}/read`, {
    method: "PATCH",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to mark notification as read"));
  }

  return response.json();
};

export const markAllNotificationsAsRead = async (): Promise<{
  message: string;
  updated_count: number;
}> => {
  const response = await fetch(`${NOTIFICATIONS_API_URL}/read-all`, {
    method: "PATCH",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to mark all notifications as read"));
  }

  return response.json();
};
