"use client"

import { useEffect, useState } from "react"
import PropertyCard from "./property-card"
import { fetchProperties } from "@/services/properties.service"
const MOCK_PROPERTIES = [
  {
    id: 1,
    title: "Modern Downtown Apartment",
    description: "Beautiful 2BR apartment in the heart of the city",
    price: 2500,
    frequency: "month",
    location: "New York, NY",
    bedrooms: 2,
    bathrooms: 2,
    size: 1200,
    furnished: true,
    type: "apartment",
    image: "/modern-downtown-apartment.png",
    images: ["/cozy-apartment-living-room.png", "/modern-bedroom.png", "/luxury-kitchen.png"],
    amenities: ["Gym", "Pool", "Concierge", "Parking", "WiFi"],
    contact: {
      name: "John Doe",
      email: "john@example.com",
      phone: "(555) 123-4567",
    },
    address: "123 Main St, New York, NY 10001",
    lat: 40.7128,
    lng: -74.006,
  },
  {
    id: 2,
    title: "Spacious Family House",
    description: "Large 4BR house with garden in suburban area",
    price: 3500,
    frequency: "month",
    location: "Los Angeles, CA",
    bedrooms: 4,
    bathrooms: 3,
    size: 2500,
    furnished: false,
    type: "house",
    image: "/modern-family-house.png",
    images: ["/modern-house-exterior.png", "/spacious-living-room.png", "/modern-kitchen-house.jpg"],
    amenities: ["Backyard", "Garage", "Patio", "Garden", "Security"],
    contact: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "(555) 234-5678",
    },
    address: "456 Oak Ave, Los Angeles, CA 90001",
    lat: 34.0522,
    lng: -118.2437,
  },
  {
    id: 3,
    title: "Luxury Condo with Views",
    description: "Premium 3BR condo with stunning city views",
    price: 4000,
    frequency: "month",
    location: "Chicago, IL",
    bedrooms: 3,
    bathrooms: 2,
    size: 1800,
    furnished: true,
    type: "condo",
    image: "/luxury-condo-skyline.jpg",
    images: ["/condo-city-view.jpg", "/luxury-bedroom.png", "/modern-bathroom.png"],
    amenities: ["Doorman", "Pool", "Gym", "Concierge", "Rooftop"],
    contact: {
      name: "Michael Johnson",
      email: "michael@example.com",
      phone: "(555) 345-6789",
    },
    address: "789 State St, Chicago, IL 60601",
    lat: 41.8781,
    lng: -87.6298,
  },
  {
    id: 4,
    title: "Cozy Studio Apartment",
    description: "Perfect starter apartment, fully furnished",
    price: 1500,
    frequency: "month",
    location: "Houston, TX",
    bedrooms: 1,
    bathrooms: 1,
    size: 600,
    furnished: true,
    type: "apartment",
    image: "/cozy-studio-apartment.png",
    images: ["/cozy-studio-apartment.png", "/compact-kitchen.jpg", "/studio-bedroom.jpg"],
    amenities: ["WiFi", "Utilities Included", "Laundry", "Parking"],
    contact: {
      name: "Sarah Williams",
      email: "sarah@example.com",
      phone: "(555) 456-7890",
    },
    address: "321 Main Blvd, Houston, TX 77002",
    lat: 29.7604,
    lng: -95.3698,
  },
  {
    id: 5,
    title: "Executive Office Space",
    description: "Prime office location in business district",
    price: 5000,
    frequency: "month",
    location: "New York, NY",
    bedrooms: 0,
    bathrooms: 2,
    size: 1500,
    furnished: true,
    type: "office",
    image: "/executive-office-space.jpg",
    images: ["/cluttered-office-desk.png", "/modern-conference-room.png", "/open-office-area.jpg"],
    amenities: ["Reception", "Conference Rooms", "WiFi", "Parking", "Security"],
    contact: {
      name: "Robert Brown",
      email: "robert@example.com",
      phone: "(555) 567-8901",
    },
    address: "654 Business Ave, New York, NY 10005",
    lat: 40.7074,
    lng: -74.0113,
  },
  {
    id: 6,
    title: "Charming Townhouse",
    description: "3BR townhouse with modern updates",
    price: 2800,
    frequency: "month",
    location: "Chicago, IL",
    bedrooms: 3,
    bathrooms: 2,
    size: 1600,
    furnished: false,
    type: "house",
    image: "/charming-townhouse.jpg",
    images: ["/modern-townhouse.png", "/modern-townhouse-interior.png", "/townhouse-deck.jpg"],
    amenities: ["Patio", "Garage", "Updated Kitchen", "Hardwood Floors"],
    contact: {
      name: "Emily Davis",
      email: "emily@example.com",
      phone: "(555) 678-9012",
    },
    address: "987 Park Way, Chicago, IL 60614",
    lat: 41.8971,
    lng: -87.6278,
  },
]




interface PropertyGridProps {
  filters: Record<string, any>
  onSelectProperty: (property: any) => void
}

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  frequency: string;
  location: string;
}

export default function PropertyGrid({ filters, onSelectProperty }: PropertyGridProps) {

  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
   fetchProperties().then((data) => {
    setProperties(data);
   }).catch((error) => {
    console.error(error);
   });
  }, []);

  let filtered = MOCK_PROPERTIES

  if (filters.type !== "all") {
    filtered = filtered.filter((p) => p.type === filters.type)
  }
  if (filters.bedrooms !== "all") {
    filtered = filtered.filter((p) => p.bedrooms.toString() === filters.bedrooms)
  }
  if (filters.city !== "all") {
    filtered = filtered.filter((p) => p.location.toLowerCase().includes(filters.city))
  }
  if (filters.priceMax) {
    filtered = filtered.filter((p) => p.price <= filters.priceMax)
  }

  if (filters.sortBy === "price-low") {
    filtered.sort((a, b) => a.price - b.price)
  } else if (filters.sortBy === "price-high") {
    filtered.sort((a, b) => b.price - a.price)
  }




  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">{properties.length} Properties Found</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} onClick={() => onSelectProperty(property)} />
        ))}
      </div>
    </div>
  )
}
