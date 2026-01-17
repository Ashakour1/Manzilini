"use client"

import { useEffect, useState } from "react"
import PropertyCard from "./property-card"
import { fetchProperties } from "@/services/properties.service"

interface PropertyGridProps {
  onSelectProperty: (property: any) => void
}

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  status?: string;
  property_type?: string;
  address?: string;
  city?: string;
  country?: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  image?: string;
  is_featured?: boolean;
  is_published?: boolean;
}

export default function PropertyGrid({ onSelectProperty }: PropertyGridProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    fetchProperties("", "").then((data) => {
      // Filter only published properties, then sort: featured first, then by creation date
      const publishedProperties = (data || []).filter((p: Property) => p.is_published === true);
      const sorted = publishedProperties.sort((a: Property, b: Property) => {
        const aFeatured = a.is_featured || false;
        const bFeatured = b.is_featured || false;
        if (aFeatured && !bFeatured) return -1;
        if (!aFeatured && bFeatured) return 1;
        return 0;
      });
      setProperties(sorted);
      setLoading(false);
    }).catch((error) => {
      console.error(error);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="mb-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Latest Properties</h2>
          <p className="text-sm text-gray-500">
            Discover the latest properties available for rent in Nairobi.
          </p>
        </div>
      </div>

      {/* Property Grid - 4 columns */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No properties found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} onClick={() => onSelectProperty(property)} />
          ))}
        </div>
      )}
    </div>
  )
}
