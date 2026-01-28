import { API_URL, getAuthHeaders } from "../lib/api";

const LANDLORD_API_URL = `${API_URL}/landlords`;

// Register a new landlord (supports optional document file)
export const registerLandlord = async (landlordData: any = {}) => {
  const headers = getAuthHeaders();

  const hasFile = landlordData.documentFile instanceof File;

  const options: RequestInit = {
    method: "POST",
    headers,
  };

  if (hasFile) {
    const formData = new FormData();
    Object.entries(landlordData).forEach(([key, value]) => {
      if (key === "documentFile") return;
      if (value === undefined || value === null) return;
      formData.append(key, String(value));
    });
    formData.append("document", landlordData.documentFile as File);
    options.body = formData;
  } else {
    options.headers = {
      ...headers,
      "Content-Type": "application/json",
    };
    options.body = JSON.stringify(landlordData);
  }

  const response = await fetch(LANDLORD_API_URL, options);

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
export const updateLandlord = async (id: string, updates: any = {}) => {
  const headers = getAuthHeaders();
  const hasFile = updates.documentFile instanceof File;

  const options: RequestInit = {
    method: "PUT",
    headers,
  };

  if (hasFile) {
    const formData = new FormData();
    Object.entries(updates).forEach(([key, value]) => {
      if (key === "documentFile") return;
      if (value === undefined || value === null) return;
      formData.append(key, String(value));
    });
    formData.append("document", updates.documentFile as File);
    options.body = formData;
  } else {
    options.headers = {
      ...headers,
      "Content-Type": "application/json",
    };
    options.body = JSON.stringify(updates);
  }

  const response = await fetch(`${LANDLORD_API_URL}/${id}`, options);

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
export const verifyLandlord = async (
  id: string, 
  isVerified: boolean, 
  rejectionReason?: string,
  password?: string
) => {
  const response = await fetch(`${LANDLORD_API_URL}/${id}/verify`, {
    method: "PATCH",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ 
      isVerified,
      ...(rejectionReason !== undefined && { rejectionReason }),
      ...(password && { password }),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update landlord verification status");
  }

  return response.json();
};

// Update landlord status (Active/Inactive)
export const updateLandlordStatus = async (
  id: string, 
  status: "ACTIVE" | "INACTIVE",
  inactiveReason?: string
) => {
  const response = await fetch(`${LANDLORD_API_URL}/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ 
      status,
      ...(inactiveReason !== undefined && { inactiveReason }),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update landlord status");
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
  updateLandlordStatus,
};
