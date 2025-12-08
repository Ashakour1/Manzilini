import { DEVELOPMENT_API_URL } from "../lib/api";

const LANDLORD_API_URL = `${DEVELOPMENT_API_URL}/landlords`;

// Register a new landlord
export const registerLandlord = async (landlordData = {}) => {
  const response = await fetch(LANDLORD_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(landlordData),
    credentials: "include",
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
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch landlords");
  }

  return response.json();
};

// Get landlord by ID
export const getLandlordById = async (id) => {
  const response = await fetch(`${LANDLORD_API_URL}/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch landlord");
  }

  return response.json();
};

// Update landlord
export const updateLandlord = async (id, updates = {}) => {
  const response = await fetch(`${LANDLORD_API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update landlord");
  }

  return response.json();
};

// Delete landlord
export const deleteLandlord = async (id) => {
  const response = await fetch(`${LANDLORD_API_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete landlord");
  }

  return response.json();
};

export default {
  registerLandlord,
  getLandlords,
  getLandlordById,
  updateLandlord,
  deleteLandlord,
};
