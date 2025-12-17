"use client"

import { useState, useEffect } from "react"
import PropertyCard from "@/components/property-card"
import PropertyModal from "@/components/property-modal"
import { fetchProperties } from "@/services/properties.service"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { X, Filter } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface Property {
  id: string
  title: string
  description: string
  price: number
  status?: string
  property_type?: string
  address?: string
  city?: string
  country?: string
  bedrooms?: number
  bathrooms?: number
  size?: number
  image?: string
  is_furnished?: boolean
}

interface Filters {
  type: string
  city: string
  bedrooms: string
  bathrooms: string
  furnished: string
  priceRange: [number, number]
  sortBy: string
}

export default function PropertiesPage() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const searchParams = useSearchParams()


  const city = searchParams.get("city")
  const property_type = searchParams.get("property_type")


  // const price = searchParams.get("price")


  

  
  const [filters, setFilters] = useState<Filters>({
    type: "all",
    city: "all",
    bedrooms: "all",
    bathrooms: "all",
    furnished: "all",
    priceRange: [0, 1000000],
    sortBy: "newest",
  })

  // Get unique values from properties
  const cities = ["all", ...Array.from(new Set(properties.map((p) => p.city).filter(Boolean)))]
  const propertyTypes = ["all", ...Array.from(new Set(properties.map((p) => p.property_type).filter(Boolean)))]

  useEffect(() => {
    setLoading(true)
    fetchProperties( city || "", property_type || "" )
      .then((data) => {
        setProperties(data)
        setFilteredProperties(data)
        // Set max price from data
        const maxPrice = Math.max(...data.map((p: Property) => p.price || 0), 1000000)
        setFilters((prev) => ({ ...prev, priceRange: [0, maxPrice] }))
        setLoading(false)
      })
      .catch((error) => {
        console.error(error)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let filtered = [...properties]

    // Filter by type
    if (filters.type !== "all") {
      filtered = filtered.filter(
        (p) => p.property_type?.toLowerCase() === filters.type.toLowerCase()
      )
    }

    // Filter by city
    if (filters.city !== "all") {
      filtered = filtered.filter((p) => p.city?.toLowerCase() === filters.city.toLowerCase())
    }

    // Filter by bedrooms
    if (filters.bedrooms !== "all") {
      const beds = filters.bedrooms === "4+" ? 4 : parseInt(filters.bedrooms)
      filtered = filtered.filter((p) => {
        if (filters.bedrooms === "4+") {
          return (p.bedrooms || 0) >= 4
        }
        return p.bedrooms === beds
      })
    }

    // Filter by bathrooms
    if (filters.bathrooms !== "all") {
      const baths = filters.bathrooms === "3+" ? 3 : parseFloat(filters.bathrooms)
      filtered = filtered.filter((p) => {
        if (filters.bathrooms === "3+") {
          return (p.bathrooms || 0) >= 3
        }
        return p.bathrooms === baths
      })
    }

    // Filter by furnished
    if (filters.furnished !== "all") {
      const isFurnished = filters.furnished === "yes"
      filtered = filtered.filter((p) => p.is_furnished === isFurnished)
    }

    // Filter by price range
    filtered = filtered.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    )

    // Sort
    switch (filters.sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case "newest":
      default:
        // Keep original order (newest first)
        break
    }

    setFilteredProperties(filtered)
  }, [filters, properties])

  const clearFilters = () => {
    const maxPrice = Math.max(...properties.map((p) => p.price || 0), 1000000)
    setFilters({
      type: "all",
      city: "all",
      bedrooms: "all",
      bathrooms: "all",
      furnished: "all",
      priceRange: [0, maxPrice],
      sortBy: "newest",
    })
  }

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.city !== "all" ||
    filters.bedrooms !== "all" ||
    filters.bathrooms !== "all" ||
    filters.furnished !== "all" ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < Math.max(...properties.map((p) => p.price || 0), 1000000)

  return (
    <>
      <div className="w-full">
        {/* Header */}
        <div className="bg-card pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Browse Properties</h1>
                <p className="text-muted-foreground">
                  {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"} found
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters} className="gap-2">
                    <X className="w-4 h-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside
              className={`${
                showFilters ? "block" : "hidden"
              } md:block w-full md:w-64 flex-shrink-0 space-y-6 mb-8 md:mb-0`}
            >
              <div className="bg-card  rounded-xl p-6 space-y-6 sticky top-24">
                <h2 className="text-lg font-semibold text-foreground">Filters</h2>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Property Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Types</option>
                    {propertyTypes
                      .filter((t) => t !== "all")
                      .map((type) =>
                        typeof type === "string" ? (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ) : null
                      )}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">City</label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Cities</option>
                    {cities
                      .filter((c) => c !== "all")
                      .map((city) =>
                        typeof city === "string" ? (
                          <option key={city} value={city}>
                            {city.charAt(0).toUpperCase() + city.slice(1)}
                          </option>
                        ) : null
                      )}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price Range: KES {filters.priceRange[0].toLocaleString()} - KES{" "}
                    {filters.priceRange[1].toLocaleString()}
                  </label>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => {
                      if (Array.isArray(value) && value.length === 2) {
                        setFilters({ ...filters, priceRange: [value[0], value[1]] })
                      }
                    }}
                    min={0}
                    max={Math.max(...properties.map((p) => p.price || 0), 1000000)}
                    step={10000}
                    className="w-full"
                  />
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bedrooms</label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bathrooms</label>
                  <select
                    value={filters.bathrooms}
                    onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All</option>
                    <option value="1">1</option>
                    <option value="1.5">1.5</option>
                    <option value="2">2</option>
                    <option value="3+">3+</option>
                  </select>
                </div>

                {/* Furnished */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Furnished</label>
                  <select
                    value={filters.furnished}
                    onChange={(e) => setFilters({ ...filters, furnished: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All</option>
                    <option value="yes">Furnished</option>
                    <option value="no">Unfurnished</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </aside>

            {/* Properties Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading properties...</p>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No properties found matching your filters.</p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onClick={() => setSelectedProperty(property)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {selectedProperty && (
        <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </>
  )
}
