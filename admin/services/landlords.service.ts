import { API_URL, getAuthHeaders } from "../lib/api";

const LANDLORD_API_URL = `${API_URL}/landlords`;

// Register a new landlord
export const registerLandlord = async (landlordData = {}) => {
  const response = await fetch(LANDLORD_API_URL, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(landlordData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create landlord");
  }

  return response.json();
};

// Get all landlords
export const getLandlords = async () => {
  const response = await fetch(LANDLORD_API_URL, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch landlords");
  }

  return response.json();
};

// Agent-specific function to get landlords for agents
export const getLandlordsForAgent = async () => {
  const response = await fetch(`${LANDLORD_API_URL}/agent`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch agent landlords");
  }
  return response.json();
};

// Get landlord by ID
export const getLandlordById = async (id: string) => {
  const response = await fetch(`${LANDLORD_API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch landlord");
  }

  return response.json();
};

// Update landlord
export const updateLandlord = async (id: string, updates = {}) => {
  const response = await fetch(`${LANDLORD_API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update landlord");
  }

  return response.json();
};

// Delete landlord
export const deleteLandlord = async (id: string) => {
  const response = await fetch(`${LANDLORD_API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete landlord");
  }

  return response.json();
};

// Verify/Unverify landlord
export const verifyLandlord = async (id: string, isVerified: boolean) => {
  const response = await fetch(`${LANDLORD_API_URL}/${id}/verify`, {
    method: "PATCH",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ isVerified }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update landlord verification status");
  }

  return response.json();
};

export default {
  registerLandlord,
  getLandlords,
  getLandlordById,
  updateLandlord,
  deleteLandlord,
  verifyLandlord,
};
