import { API_URL, getAuthHeaders } from "../lib/api";

const PROPERTY_API_URL = `${API_URL}/properties`;


// Create a new property with optional images (FormData)
export const registerProperty = async (propertyData = {}) => {
  const formData = new FormData();

  Object.entries(propertyData).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "images" && Array.isArray(value)) {
      value.forEach((file) => formData.append("images", file));
      return;
    }
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }
    formData.append(key, value as string | Blob);
  });

  const response = await fetch(PROPERTY_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create property");
  }

  return response.json();
};


export const getPropertiesForUser = async () => {
  const response = await fetch(`${PROPERTY_API_URL}/specific`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch properties");
  }
  return response.json();
};

export const getProperties = async () => {
  const response = await fetch(PROPERTY_API_URL, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch properties");
  }

  return response.json();
};

export const getPropertyById = async (id: string) => {
  const response = await fetch(`${PROPERTY_API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch property");
  }

  return response.json();
};

export const updateProperty = async (id: string, updates = {}) => {
  const response = await fetch(`${PROPERTY_API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Failed to update property");
  }

  return response.json();
};

export const deleteProperty = async (id: string) => {
  const response = await fetch(`${PROPERTY_API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete property");
  }

  return response.json();
};

export default {
  registerProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
