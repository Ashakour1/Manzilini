import { API_URL, getAuthHeaders } from "../lib/api";

export interface SendEmailRequest {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  message: string;
  emailType?: "WELCOME" | "PASSWORD_RESET" | "VERIFICATION" | "LANDLORD_APPROVAL" | "LANDLORD_REJECTION" | "LANDLORD_INACTIVE" | "TENANT_REQUEST" | "NOTIFICATION";
  landlordId?: string;
  userId?: string;
}

export interface SendEmailResponse {
  message: string;
  result: any;
  recipientEmail: string;
  recipientName?: string | null;
}

const EMAIL_API_URL = `${API_URL}/email`;

// Send email manually
export const sendManualEmail = async (data: SendEmailRequest): Promise<SendEmailResponse> => {
  const response = await fetch(`${EMAIL_API_URL}/send`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send email");
  }

  return response.json();
};

// Send email to landlord
export const sendEmailToLandlord = async (
  landlordId: string,
  data: {
    subject: string;
    message: string;
    emailType?: string;
  }
): Promise<SendEmailResponse> => {
  const response = await fetch(`${EMAIL_API_URL}/landlord/${landlordId}`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send email");
  }

  return response.json();
};

// Send email to user
export const sendEmailToUser = async (
  userId: string,
  data: {
    subject: string;
    message: string;
    emailType?: string;
  }
): Promise<SendEmailResponse> => {
  const response = await fetch(`${EMAIL_API_URL}/user/${userId}`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send email");
  }

  return response.json();
};
