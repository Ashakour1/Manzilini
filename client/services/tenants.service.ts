const PRODUCTION_API_URL = "https://manzilline-production-fcab.up.railway.app/api/v1";
export const DEVELOPMENT_API_URL = "http://localhost:4000/api/v1";
export const API_URL = DEVELOPMENT_API_URL;

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

export interface CreateTenantData {
  fullName: string;
  phone: string;
  email?: string;
  status?: "NEW" | "ACTIVE" | "INACTIVE" | "BLOCKED";
  landlordId?: string;
}

// Get all tenants
// landlordId is optional - backend will automatically filter by logged-in user's landlord profile
export const getTenants = async (
  token: string,
  status?: string,
  search?: string,
  landlordId?: string
): Promise<Tenant[]> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (search) params.append('search', search);
  // landlordId is optional - backend handles it automatically for landlord users
  if (landlordId) params.append('landlordId', landlordId);

  const response = await fetch(`${API_URL}/tenants?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch tenants");
  }

  return response.json();
};

// Get tenant by ID
export const getTenantById = async (id: string, token: string): Promise<Tenant> => {
  const response = await fetch(`${API_URL}/tenants/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch tenant");
  }

  return response.json();
};

// Create tenant
export const createTenant = async (
  data: CreateTenantData,
  token: string
): Promise<Tenant> => {
  const response = await fetch(`${API_URL}/tenants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create tenant");
  }

  return response.json();
};

// Update tenant
export const updateTenant = async (
  id: string,
  data: Partial<CreateTenantData>,
  token: string
): Promise<Tenant> => {
  const response = await fetch(`${API_URL}/tenants/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to update tenant");
  }

  return response.json();
};

// Delete tenant
export const deleteTenant = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/tenants/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to delete tenant");
  }
};
