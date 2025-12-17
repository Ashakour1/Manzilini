"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { fetchPropertyTypes } from "@/services/properties.service"
import { StaticImport } from "next/dist/shared/lib/get-img-props"

interface PropertyType {
  name: string
  image: string | StaticImport
  type: string
  count: number
}

// Dummy images for property types (hardcoded, not from API)
const propertyTypeImages: Record<string, string> = {
  HOUSE: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
  APARTMENT: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
  OFFICE: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
  STUDIO: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop",
  LAND: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
}

const propertyTypeLabels: Record<string, string> = {
  HOUSE: "Houses",
  APARTMENT: "Apartments",
  OFFICE: "Office",
  STUDIO: "Studio",
  LAND: "Land",
}

export default function ApartmentTypesSection() {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPropertyTypes = async () => {
      try {
        // Fetch type and count from API
        const data = await fetchPropertyTypes()
        // Map the API response: type and count come from API, images are dummy data
        const mappedTypes = (data || []).map((item: PropertyType) => ({
          type: item.type, // From API
          count: item.count, // From API
          name: propertyTypeLabels[item.type] || item.type, // Mapped label
          image: propertyTypeImages[item.type] || propertyTypeImages.LAND, // Dummy image
        })).sort((a: PropertyType & { name: string; image: string }, b: PropertyType & { name: string; image: string }) => b.count - a.count)
        setPropertyTypes(mappedTypes)
      } catch (error) {
        console.error("Failed to load property types:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPropertyTypes()
  }, [])
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Explore Property Types</h2>
            <p className="text-muted-foreground">Browse properties by type</p>
          </div>
          <Link
            href="/properties"
            className="mt-4 md:mt-0 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            All Types
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading property types...</p>
            </div>
          ) : propertyTypes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No property types available.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto scrollbar-hide pb-4">
                <div className="flex gap-6 min-w-max">
                  {propertyTypes.map((type) => (
                    <Link
                      key={type.type}
                      href={`/properties?type=${type.type.toLowerCase()}`}
                      className="group flex-shrink-0 w-64 bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
                    >
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={type.image}
                          alt={type.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="256px"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-foreground mb-1">{type.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {type.count} {type.count === 1 ? "Property" : "Properties"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Pagination Dots */}
              {propertyTypes.length > 0 && (
                <div className="flex justify-center gap-2 mt-6">
                  {propertyTypes.slice(0, 5).map((_, index) => {
                    const isActive = index === 0
                    return (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          isActive ? "bg-foreground" : "bg-gray-300"
                        }`}
                      />
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

