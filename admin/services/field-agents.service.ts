import { API_URL } from "../lib/api";

const FIELD_AGENTS_API_URL = `${API_URL}/field-agents`;

// Get all field agents
export const getFieldAgents = async () => {
  const response = await fetch(FIELD_AGENTS_API_URL, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch field agents");
  }

  return response.json();
};

// Get field agent by ID
export const getFieldAgentById = async (id: string) => {
  const response = await fetch(`${FIELD_AGENTS_API_URL}/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch field agent");
  }

  return response.json();
};

// Create field agent
export const createFieldAgent = async (agentData: {
  name: string;
  email: string;
  phone?: string;
  image?: File;
  document_image?: File;
}) => {
  const formData = new FormData();
  formData.append("name", agentData.name);
  formData.append("email", agentData.email);
  if (agentData.phone) {
    formData.append("phone", agentData.phone);
  }
  if (agentData.image) {
    formData.append("image", agentData.image);
  }
  if (agentData.document_image) {
    formData.append("document_image", agentData.document_image);
  }

  const response = await fetch(FIELD_AGENTS_API_URL, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create field agent");
  }

  return response.json();
};

// Update field agent
export const updateFieldAgent = async (
  id: string,
  updates: {
    name: string;
    email: string;
    phone?: string;
    image?: File;
    document_image?: File;
  }
) => {
  const formData = new FormData();
  formData.append("name", updates.name);
  formData.append("email", updates.email);
  if (updates.phone !== undefined) {
    formData.append("phone", updates.phone || "");
  }
  if (updates.image) {
    formData.append("image", updates.image);
  }
  if (updates.document_image) {
    formData.append("document_image", updates.document_image);
  }

  const response = await fetch(`${FIELD_AGENTS_API_URL}/${id}`, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update field agent");
  }

  return response.json();
};

// Delete field agent
export const deleteFieldAgent = async (id: string) => {
  const response = await fetch(`${FIELD_AGENTS_API_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete field agent");
  }

  return response.json();
};

