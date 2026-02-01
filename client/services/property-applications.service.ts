const PRODUCTION_API_URL = "https://manzilline-production-fcab.up.railway.app/api/v1";
export const DEVELOPMENT_API_URL = "http://localhost:4000/api/v1";
export const API_URL = PRODUCTION_API_URL;

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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  property?: any;
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
