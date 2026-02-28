export interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  status: string;
  country: string;
  city: string;
  address: string;
  zip_code?: string;
  price?: number;
  currency?: string;
  payment_frequency?: string;
  deposit_amount?: number | null;
  deposit_type?: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  garages?: number | null;
  size?: number | null;
  floor?: number | null;
  total_floors?: number | null;
  is_furnished?: boolean | null;
  balcony?: boolean | null;
  amenities?: string[];
  is_published: boolean;
  createdAt: string;
  _count?: { tenants: number; property_applications: number };
  images?: { id: string; url: string }[];
}

export interface Application {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  message: string | null;
  status: string;
  propertyId: string;
  landlordId: string;
  createdAt: string;
  property?: { id: string; title: string; city: string };
  tenant?: Tenant | null;
}

export interface Tenant {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  status: string;
  propertyId: string | null;
  rentAmount: number | null;
  leaseStart: string | null;
  leaseEnd: string | null;
  createdAt: string;
  property?: { id: string; title: string; city?: string } | null;
  _count?: { applications: number };
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  name?: string; // computed: firstName + lastName (from backend)
  email: string;
  phone: string | null;
  role: string;
  status: string;
  assgnmentType?: "ALL_PROPERTIES" | "SPECIFIC_PROPERTIES";
  assignedProperties?: { id: string; title: string }[];
  propertyId?: string | null;
  property?: { id: string; title: string } | null;
  createdAt: string;
}
