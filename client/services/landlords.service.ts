const PRODUCTION_API_URL = "https://manzilline-production-fcab.up.railway.app/api/v1";
export const DEVELOPMENT_API_URL = "http://localhost:4000/api/v1";
export const API_URL = PRODUCTION_API_URL;


export interface LandlordRegistrationData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company_name?: string;
  address?: string;
}

export interface Landlord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LandlordLoginData {
  email: string;
  password: string;
}

export interface LandlordLoginResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  token: string;
}

export interface LandlordProperty {
  id: string;
  title: string;
  city: string;
  address: string;
  status: string;
  price: number;
  currency: string;
  images?: { id: string; url: string }[];
  createdAt?: string;
}

// Register a new landlord (public endpoint)
export const registerLandlord = async (landlordData: LandlordRegistrationData): Promise<Landlord> => {
  const response = await fetch(`${API_URL}/landlords/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(landlordData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to register landlord");
  }

  return response.json();
};

// Login landlord
export const loginLandlord = async (loginData: LandlordLoginData): Promise<LandlordLoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to login");
  }

  return response.json();
};

// Get properties for the currently logged-in landlord
export const getLandlordProperties = async (token: string): Promise<LandlordProperty[]> => {
  const response = await fetch(`${API_URL}/properties/landlord`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch landlord properties");
  }

  return response.json();
};

// ─── Property Applications ───────────────────────────────────────────

export interface LandlordApplication {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  message?: string;
  status: "PENDING" | "CONTACTED" | "APPROVED" | "REJECTED" | "CLOSED";
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
}

// Get property applications for the logged-in landlord
export const getLandlordApplications = async (
  landlordId: string,
  token: string,
  status?: string
): Promise<LandlordApplication[]> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  const qs = params.toString() ? `?${params.toString()}` : "";

  const response = await fetch(
    `${API_URL}/property-applications/landlord/${landlordId}${qs}`,
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

// Update a property application status
export const updateLandlordApplication = async (
  id: string,
  token: string,
  data: { status?: string; remarks?: string }
): Promise<LandlordApplication> => {
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

// ─── Property Creation ───────────────────────────────────────────

export interface CreatePropertyData {
  title: string;
  description: string;
  property_type: string;
  status: string;
  price: string;
  currency: string;
  payment_frequency: string;
  deposit_amount?: string;
  deposit_type?: "FIXED" | "PERCENTAGE";
  country: string;
  city: string;
  address: string;
  zip_code: string;
  latitude: string;
  longitude: string;
  bedrooms?: string;
  bathrooms?: string;
  garages?: string;
  size?: string;
  is_furnished?: boolean;
  floor?: string;
  total_floors?: string;
  balcony?: boolean;
  amenities?: string[];
  landlord_id?: string;
  is_published?: boolean;
  images?: File[];
}

// Get landlord ID from existing properties (helper function)
// The backend returns properties with landlord info, so we extract it
export const getLandlordIdFromProperties = async (token: string): Promise<string | null> => {
  try {
    const response = await fetch(`${API_URL}/properties/landlord`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const properties = await response.json();
    if (properties && properties.length > 0) {
      // The backend includes landlord info in the response
      const firstProp = properties[0];
      return firstProp.landlord?.id || firstProp.landlord_id || null;
    }
    return null;
  } catch {
    return null;
  }
};

// Create a new property
export const createProperty = async (
  token: string,
  propertyData: CreatePropertyData
): Promise<any> => {
  const formData = new FormData();

  // Append all property fields
  Object.entries(propertyData).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    
    if (key === "images" && Array.isArray(value)) {
      value.forEach((file) => formData.append("images", file));
      return;
    }
    
    if (key === "amenities" && Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }
    
    if (typeof value === "boolean") {
      formData.append(key, value.toString());
      return;
    }
    
    formData.append(key, value.toString());
  });

  // Always set is_published to false for landlord-created properties
  formData.append("is_published", "false");

  const response = await fetch(`${API_URL}/properties`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create property");
  }

  return response.json();
};
