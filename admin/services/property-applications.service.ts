import { API_URL, getAuthHeaders } from "../lib/api";

export interface PropertyApplication {
  id: string;
  propertyId: string;
  landlordId: string;
  fullName: string;
  email?: string;
  phone: string;
  message?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  remarks?: string;
  createdAt: string;
  updatedAt: string;
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

// Update property application status
export const updatePropertyApplication = async (id: string, status: string, remarks?: string): Promise<PropertyApplication> => {
  try {
    const response = await fetch(`${API_URL}/property-applications/${id}`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, remarks }),
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

