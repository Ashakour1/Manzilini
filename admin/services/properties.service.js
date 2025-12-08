import { DEVELOPMENT_API_URL } from "../lib/api";

const PROPERTY_API_URL = `${DEVELOPMENT_API_URL}/properties`;


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
    formData.append(key, value);
  });

  const response = await fetch(PROPERTY_API_URL, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to create property");
  }

  return response.json();
};

export const getProperties = async () => {
  const response = await fetch(PROPERTY_API_URL, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch properties");
  }

  return response.json();
};

export const getPropertyById = async (id) => {
  const response = await fetch(`${PROPERTY_API_URL}/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch property");
  }

  return response.json();
};

export const updateProperty = async (id, updates = {}) => {
  const response = await fetch(`${PROPERTY_API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to update property");
  }

  return response.json();
};

export const deleteProperty = async (id) => {
  const response = await fetch(`${PROPERTY_API_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
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
