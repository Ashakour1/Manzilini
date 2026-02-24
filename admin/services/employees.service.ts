import { API_URL, getAuthHeaders } from "../lib/api";

const EMPLOYEES_API_URL = `${API_URL}/employees`;

export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export interface EmployeeItem {
  id: string;
  companyId: string | null;
  name: string;
  email: string;
  phone: string | null;
  position: string | null;
  department: string | null;
  status: EmployeeStatus;
  hiredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeePayload {
  companyId?: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  status?: EmployeeStatus;
  hiredAt?: string | null;
}

const parseApiError = async (response: Response, fallbackMessage: string) => {
  try {
    const payload = await response.json();
    return payload?.message || fallbackMessage;
  } catch (_error) {
    return fallbackMessage;
  }
};

export const getEmployees = async (): Promise<EmployeeItem[]> => {
  const response = await fetch(EMPLOYEES_API_URL, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to fetch employees"));
  }

  return response.json();
};

export const getEmployeeById = async (id: string): Promise<EmployeeItem> => {
  const response = await fetch(`${EMPLOYEES_API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to fetch employee"));
  }

  return response.json();
};

export const createEmployee = async (payload: EmployeePayload): Promise<EmployeeItem> => {
  const response = await fetch(EMPLOYEES_API_URL, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to create employee"));
  }

  return response.json();
};

export const updateEmployee = async (id: string, payload: EmployeePayload): Promise<EmployeeItem> => {
  const response = await fetch(`${EMPLOYEES_API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to update employee"));
  }

  return response.json();
};

export const deleteEmployee = async (id: string): Promise<{ message: string; id: string }> => {
  const response = await fetch(`${EMPLOYEES_API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to delete employee"));
  }

  return response.json();
};
