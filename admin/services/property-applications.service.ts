import { API_URL, getAuthHeaders } from "../lib/api";

export interface PropertyApplication {
  id: string;
  propertyId: string;
  landlordId: string;
  fullName: string;
  email?: string;
  phone: string;
  message?: string;
  status: "PENDING" | "CONTACTED" | "APPROVED" | "REJECTED" | "CLOSED";
  remarks?: string;
  statusChangedAt?: string | null;
  statusChangedBy?: string | null;
  emailSent: boolean;
  emailSentAt?: string | null;
  isCommunicated: boolean;
  communicatedAt?: string | null;
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
    description: string;
    price: number;
    city: string;
    address: string;
    property_type: string;
    status: string;
    images: Array<{ url: string }>;
    landlord?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
    };
  };
  landlord?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

// Get all property applications with optional filters
export const getPropertyApplications = async (propertyId?: string, landlordId?: string, status?: string): Promise<PropertyApplication[]> => {
  try {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId);
    if (landlordId) params.append('landlordId', landlordId);
    if (status) params.append('status', status);

    const response = await fetch(`${API_URL}/property-applications?${params.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch property applications");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching property applications:", error);
    throw error;
  }
};

// Get property application by ID
export const getPropertyApplicationById = async (id: string): Promise<PropertyApplication> => {
  try {
    const response = await fetch(`${API_URL}/property-applications/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch property application");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching property application:", error);
    throw error;
  }
};

// Update property application
export const updatePropertyApplication = async (
  id: string, 
  status?: string, 
  remarks?: string,
  emailSent?: boolean,
  emailSentAt?: string | null,
  isCommunicated?: boolean,
  communicatedAt?: string | null,
  viewingRequested?: boolean,
  viewingDate?: string | null
): Promise<PropertyApplication> => {
  try {
    const body: any = {};
    if (status !== undefined) body.status = status;
    if (remarks !== undefined) body.remarks = remarks;
    if (emailSent !== undefined) body.emailSent = emailSent;
    if (emailSentAt !== undefined) body.emailSentAt = emailSentAt;
    if (isCommunicated !== undefined) body.isCommunicated = isCommunicated;
    if (communicatedAt !== undefined) body.communicatedAt = communicatedAt;
    if (viewingRequested !== undefined) body.viewingRequested = viewingRequested;
    if (viewingDate !== undefined) body.viewingDate = viewingDate;

    const response = await fetch(`${API_URL}/property-applications/${id}`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update application" }));
      throw new Error(error.message || "Failed to update property application");
    }

    return response.json();
  } catch (error) {
    console.error("Error updating property application:", error);
    throw error;
  }
};

// Delete property application
export const deletePropertyApplication = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/property-applications/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete property application");
    }
  } catch (error) {
    console.error("Error deleting property application:", error);
    throw error;
  }
};

// Get property applications by landlord
export const getPropertyApplicationsByLandlord = async (landlordId: string): Promise<PropertyApplication[]> => {
  try {
    const response = await fetch(`${API_URL}/property-applications/landlord/${landlordId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch property applications");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching property applications:", error);
    throw error;
  }
};

