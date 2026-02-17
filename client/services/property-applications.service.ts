const PRODUCTION_API_URL = "https://manzilline-production-fcab.up.railway.app/api/v1";
export const DEVELOPMENT_API_URL = "http://localhost:4000/api/v1";
export const API_URL = DEVELOPMENT_API_URL;

export interface CreatePropertyApplicationDto {
  propertyId: string;
  landlordId: string;
  fullName: string;
  email?: string;
  phone: string;
  message?: string;
}

export interface PropertyApplication {
  id: string;
  propertyId: string;
  landlordId: string;
  fullName: string;
  email?: string;
  phone: string;
  message?: string;
  status: 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED' | 'CLOSED';
  isApproved: boolean;
  adminApprovalStatus: "PENDING" | "APPROVED" | "REJECTED";
  adminApprovedAt?: string | null;
  adminApprovedBy?: string | null;
  remarks?: string;
  statusChangedAt?: string | null;
  emailSent: boolean;
  isCommunicated: boolean;
  viewingRequested: boolean;
  viewingDate?: string | null;
  createdAt: string;
  updatedAt: string;
  tenant?: {
    id: string;
    fullName: string;
    email?: string | null;
    phone: string;
    status: string;
  };
  property?: {
    id: string;
    title: string;
    price: number;
    city: string;
    address: string;
    status: string;
    images?: { url: string }[];
  };
  landlord?: any;
}

// Create a property application
export const createPropertyApplication = async (data: CreatePropertyApplicationDto): Promise<PropertyApplication> => {
  const response = await fetch(`${API_URL}/property-applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to submit application' }));
    throw new Error(error.message || 'Failed to submit application');
  }

  return response.json();
};

// Get property applications by email or phone
export const getPropertyApplicationsByTenant = async (email?: string, phone?: string): Promise<PropertyApplication[]> => {
  const params = new URLSearchParams();
  if (email) params.append('email', email);
  if (phone) params.append('phone', phone);

  const response = await fetch(`${API_URL}/property-applications/tenant?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch applications');
  }

  return response.json();
};

// Get property application by ID
export const getPropertyApplicationById = async (id: string): Promise<PropertyApplication> => {
  const response = await fetch(`${API_URL}/property-applications/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch application');
  }

  return response.json();
};

// Get property applications by landlord ID (uses general endpoint with query params)
export const getPropertyApplicationsByLandlord = async (
  landlordId: string,
  token: string,
  status?: string
): Promise<PropertyApplication[]> => {
  const params = new URLSearchParams();
  params.append("landlordId", landlordId);
  if (status) params.append("status", status);

  const response = await fetch(
    `${API_URL}/property-applications?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch applications");
  }

  return response.json();
};

// Update property application status
export const updatePropertyApplicationStatus = async (
  id: string,
  token: string,
  data: { status?: string; remarks?: string }
): Promise<PropertyApplication> => {
  const response = await fetch(`${API_URL}/property-applications/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to update application");
  }

  return response.json();
};
