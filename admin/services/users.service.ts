import { API_URL, getAuthHeaders } from "../lib/api";

const USERS_API_URL = `${API_URL}/users`;

// Get all users
export const getUsers = async () => {
  const response = await fetch(USERS_API_URL, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};

// Get user by ID
export const getUserById = async (id: string) => {
  const response = await fetch(`${USERS_API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
};

// Create user
export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role?: string;
  agentId?: string | null;
}) => {
  const response = await fetch(USERS_API_URL, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create user");
  }

  return response.json();
};

// Update user
export const updateUser = async (id: string, updates: {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
  agentId?: string | null;
}) => {
  const response = await fetch(`${USERS_API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update user");
  }

  return response.json();
};

// Delete user
export const deleteUser = async (id: string) => {
  const response = await fetch(`${USERS_API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete user");
  }

  return response.json();
};
