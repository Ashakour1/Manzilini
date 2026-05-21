"use client"

import { useState, useEffect } from "react"
import PropertyCard from "@/components/property-card"
import PropertyModal from "@/components/property-modal"
import { fetchProperties } from "@/services/properties.service"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { X, Filter, RotateCcw, ArrowUpDown, MapPin, Home, BedDouble, Bath, Sofa } from "lucide-react"
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
  is_published?: boolean
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
        // Filter only published properties
        const publishedProperties = (data || []).filter((p: Property) => p.is_published === true)
        setProperties(publishedProperties)
        setFilteredProperties(publishedProperties)
        // Set max price from data
        const maxPrice = Math.max(...publishedProperties.map((p: Property) => p.price || 0), 1000000)
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

  const maxAvailablePrice = Math.max(...properties.map((p) => p.price || 0), 1000000)

  const activeFilterCount =
    (filters.type !== "all" ? 1 : 0) +
    (filters.city !== "all" ? 1 : 0) +
    (filters.bedrooms !== "all" ? 1 : 0) +
    (filters.bathrooms !== "all" ? 1 : 0) +
    (filters.furnished !== "all" ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxAvailablePrice ? 1 : 0)

  const hasActiveFilters = activeFilterCount > 0

  return (
    <>
      <div className="w-full bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-12">
          {/* Top bar: sort + filter buttons */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground mr-2">
                <span className="inline-block h-2.5 w-2.5 rotate-45 rounded-sm bg-pink-500" />
                Prices include all fees
              </span>

              {/* Sort dropdown */}
              <div className="relative">
                <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="appearance-none rounded-full border border-border bg-background pl-8 pr-7 py-1.5 text-sm text-foreground transition hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 rounded-full"
                size="sm"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="gap-2 rounded-full text-muted-foreground hover:text-foreground"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside
              className={`${
                showFilters ? "block" : "hidden"
              } md:block w-full md:w-72 flex-shrink-0 mb-8 md:mb-0`}
            >
              <div className="sticky top-24 rounded-2xl border border-border bg-card overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">Filters</h2>
                    {activeFilterCount > 0 && (
                      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </button>
                  )}
                </div>

                <div className="px-5 py-5 space-y-6">
                  {/* Property Type */}
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Home className="h-3.5 w-3.5 text-primary" />
                      Property Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground transition hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="all">All types</option>
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
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      City
                    </label>
                    <select
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground transition hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="all">All cities</option>
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

                  <div className="border-t border-border" />

                  {/* Price Range */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Price Range
                      </label>
                      <span className="text-xs font-medium text-foreground tabular-nums">
                        KES {filters.priceRange[0].toLocaleString()} – {filters.priceRange[1].toLocaleString()}
                      </span>
                    </div>
                    <Slider
                      value={filters.priceRange}
                      onValueChange={(value) => {
                        if (Array.isArray(value) && value.length === 2) {
                          setFilters({ ...filters, priceRange: [value[0], value[1]] })
                        }
                      }}
                      min={0}
                      max={maxAvailablePrice}
                      step={10000}
                      className="w-full"
                    />
                    <div className="mt-2 flex justify-between text-[11px] text-muted-foreground tabular-nums">
                      <span>KES 0</span>
                      <span>KES {maxAvailablePrice.toLocaleString()}+</span>
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  {/* Bedrooms */}
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <BedDouble className="h-3.5 w-3.5 text-primary" />
                      Bedrooms
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {["all", "1", "2", "3", "4+"].map((value) => {
                        const active = filters.bedrooms === value
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setFilters({ ...filters, bedrooms: value })}
                            className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            }`}
                          >
                            {value === "all" ? "Any" : value}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Bath className="h-3.5 w-3.5 text-primary" />
                      Bathrooms
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {["all", "1", "1.5", "2", "3+"].map((value) => {
                        const active = filters.bathrooms === value
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setFilters({ ...filters, bathrooms: value })}
                            className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            }`}
                          >
                            {value === "all" ? "Any" : value}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  {/* Furnished */}
                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Sofa className="h-3.5 w-3.5 text-primary" />
                      Furnished
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { value: "all", label: "Any" },
                        { value: "yes", label: "Yes" },
                        { value: "no", label: "No" },
                      ].map((opt) => {
                        const active = filters.furnished === opt.value
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFilters({ ...filters, furnished: opt.value })}
                            className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            }`}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
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
