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

// Register a new landlord (public endpoint)
export const registerLandlord = async (landlordData: LandlordRegistrationData): Promise<Landlord> => {
  const response = await fetch(`${API_URL}/landlords/register`, {
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
