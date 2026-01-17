import { API_URL, getAuthHeaders } from "../lib/api";

export interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientName?: string | null;
  subject: string;
  message: string;
  emailType: "WELCOME" | "PASSWORD_RESET" | "VERIFICATION" | "LANDLORD_APPROVAL" | "LANDLORD_REJECTION" | "LANDLORD_INACTIVE" | "TENANT_REQUEST" | "NOTIFICATION";
  status: "SENT" | "FAILED" | "PENDING";
  errorMessage?: string | null;
  landlordId?: string | null;
  landlord?: {
    id: string;
    name: string;
    email: string;
  } | null;
  metadata?: string | null;
  resendId?: string | null;
  createdAt: string;
}

export interface EmailLogsResponse {
  emailLogs: EmailLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

const EMAIL_LOGS_API_URL = `${API_URL}/email-logs`;

// Get all email logs
export const getEmailLogs = async (params?: {
  page?: number;
  limit?: number;
  emailType?: string;
  status?: string;
  recipientEmail?: string;
  landlordId?: string;
}): Promise<EmailLogsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.emailType) queryParams.append("emailType", params.emailType);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.recipientEmail) queryParams.append("recipientEmail", params.recipientEmail);
  if (params?.landlordId) queryParams.append("landlordId", params.landlordId);

  const url = `${EMAIL_LOGS_API_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch email logs");
  }

  return response.json();
};

// Get email log by ID
export const getEmailLogById = async (id: string): Promise<EmailLog> => {
  const response = await fetch(`${EMAIL_LOGS_API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch email log");
  }

  return response.json();
};

// Get email logs by landlord ID
export const getEmailLogsByLandlord = async (
  landlordId: string,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<EmailLogsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const url = `${EMAIL_LOGS_API_URL}/landlord/${landlordId}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch email logs");
  }

  return response.json();
};

// Get email statistics
export const getEmailStats = async (): Promise<EmailStats> => {
  const response = await fetch(`${EMAIL_LOGS_API_URL}/stats`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch email statistics");
  }

  return response.json();
};
