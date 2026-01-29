import { API_URL, getAuthHeaders } from "../lib/api";

const FIELD_AGENTS_API_URL = `${API_URL}/field-agents`;

// Get all field agents
export const getFieldAgents = async () => {
  const response = await fetch(FIELD_AGENTS_API_URL, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch field agents");
  }

  return response.json();
};

// Get field agent by ID
export const getFieldAgentById = async (id: string) => {
  const response = await fetch(`${FIELD_AGENTS_API_URL}/${id}`, {
    headers: getAuthHeaders(),
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
  documentFile?: File;
  documentType?: string;
  documentNotes?: string;
}) => {
  const headers = getAuthHeaders();
  const hasFile = agentData.image instanceof File || agentData.documentFile instanceof File;

  const options: RequestInit = {
    method: "POST",
    headers,
  };

  if (hasFile) {
    const formData = new FormData();
    formData.append("name", agentData.name);
    formData.append("email", agentData.email);
    if (agentData.phone) {
      formData.append("phone", agentData.phone);
    }
    if (agentData.image) {
      formData.append("image", agentData.image);
    }
    if (agentData.documentFile) {
      formData.append("document", agentData.documentFile);
    }
    if (agentData.documentType) {
      formData.append("documentType", agentData.documentType);
    }
    if (agentData.documentNotes) {
      formData.append("documentNotes", agentData.documentNotes);
    }
    options.body = formData;
  } else {
    options.headers = {
      ...headers,
      "Content-Type": "application/json",
    };
    options.body = JSON.stringify({
      name: agentData.name,
      email: agentData.email,
      phone: agentData.phone,
      documentType: agentData.documentType,
      documentNotes: agentData.documentNotes,
    });
  }

  const response = await fetch(FIELD_AGENTS_API_URL, options);

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
    documentFile?: File;
    documentType?: string;
    documentNotes?: string;
  }
) => {
  const headers = getAuthHeaders();
  const hasFile = updates.image instanceof File || updates.documentFile instanceof File;

  const options: RequestInit = {
    method: "PUT",
    headers,
  };

  if (hasFile) {
    const formData = new FormData();
    formData.append("name", updates.name);
    formData.append("email", updates.email);
    if (updates.phone !== undefined) {
      formData.append("phone", updates.phone || "");
    }
    if (updates.image) {
      formData.append("image", updates.image);
    }
    if (updates.documentFile) {
      formData.append("document", updates.documentFile);
    }
    if (updates.documentType) {
      formData.append("documentType", updates.documentType);
    }
    if (updates.documentNotes) {
      formData.append("documentNotes", updates.documentNotes);
    }
    options.body = formData;
  } else {
    options.headers = {
      ...headers,
      "Content-Type": "application/json",
    };
    options.body = JSON.stringify({
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      documentType: updates.documentType,
      documentNotes: updates.documentNotes,
    });
  }

  const response = await fetch(`${FIELD_AGENTS_API_URL}/${id}`, options);

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
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete field agent");
  }

  return response.json();
};

