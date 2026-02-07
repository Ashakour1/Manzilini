import { API_URL, getAuthHeaders } from "../lib/api";

export interface Tenant {
  id: string;
  fullName: string;
  email?: string | null;
  phone: string;
  status: "NEW" | "ACTIVE" | "INACTIVE" | "BLOCKED";
  lastActivityAt?: string | null;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
  applications?: Array<{
    id: string;
    status: string;
    property?: {
      id: string;
      title: string;
      city: string;
    };
  }>;
  _count?: {
    applications: number;
    activities: number;
  };
}

export interface TenantActivity {
  id: string;
  tenantId: string;
  applicationId?: string | null;
  type: "APPLICATION_SENT" | "CONTACTED" | "APPROVED" | "REJECTED" | "VIEWING_REQUESTED" | "STATUS_CHANGED";
  description?: string | null;
  createdAt: string;
  application?: {
    id: string;
    property?: {
      id: string;
      title: string;
    };
  };
}

// Get all tenants
export const getTenants = async (status?: string, search?: string): Promise<Tenant[]> => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const response = await fetch(`${API_URL}/tenants?${params.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tenants");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching tenants:", error);
    throw error;
  }
};

// Get tenant by ID
export const getTenantById = async (id: string): Promise<Tenant> => {
  try {
    const response = await fetch(`${API_URL}/tenants/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tenant");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching tenant:", error);
    throw error;
  }
};

// Create tenant
export const createTenant = async (
  fullName: string,
  phone: string,
  email?: string,
  status?: string
): Promise<Tenant> => {
  try {
    const response = await fetch(`${API_URL}/tenants`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fullName, phone, email, status }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to create tenant" }));
      throw new Error(error.message || "Failed to create tenant");
    }

    return response.json();
  } catch (error) {
    console.error("Error creating tenant:", error);
    throw error;
  }
};

// Update tenant
export const updateTenant = async (
  id: string,
  data: {
    fullName?: string;
    email?: string;
    phone?: string;
    status?: string;
  }
): Promise<Tenant> => {
  try {
    const response = await fetch(`${API_URL}/tenants/${id}`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update tenant" }));
      throw new Error(error.message || "Failed to update tenant");
    }

    return response.json();
  } catch (error) {
    console.error("Error updating tenant:", error);
    throw error;
  }
};

// Delete tenant
export const deleteTenant = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/tenants/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete tenant");
    }
  } catch (error) {
    console.error("Error deleting tenant:", error);
    throw error;
  }
};

// Get tenant activities
export const getTenantActivities = async (id: string, limit?: number): Promise<TenantActivity[]> => {
  try {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(`${API_URL}/tenants/${id}/activities?${params.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tenant activities");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching tenant activities:", error);
    throw error;
  }
};
