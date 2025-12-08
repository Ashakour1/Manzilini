"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Bath, Bed, MapPin, Maximize2 } from "lucide-react"
import { fetchProperties } from "@/services/properties.service"

const highlights = [
  "Handpicked luxury homes in Nairobi's top neighborhoods",
  "Verified listings with guided tours and concierge support",
  "Flexible payment plans with transparent terms",
]

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
  is_featured?: boolean
  images?: { url: string }[]
}

export default function FeaturedHousesSection() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeaturedProperties = async () => {
      try {
        const allProperties = await fetchProperties()
        // Filter and get only featured properties, limit to 4
        const featured = (allProperties || [])
          .filter((p: Property) => p.is_featured)
          .slice(0, 4)
        setFeaturedProperties(featured)
      } catch (error) {
        console.error("Failed to load featured properties:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedProperties()
  }, [])

  const getImageUrl = (property: Property) => {
    const imagePath = property.images?.[0]?.url || property.images?.[0]?.path
    if (!imagePath) return "/placeholder.svg"
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath
    }
    if (imagePath.startsWith("/uploads")) {
      return `http://localhost:4000${imagePath}`
    }
    return `http://localhost:4000/uploads/${imagePath}`
  }

  const formatAddress = (property: Property) => {
    if (property.address) {
      return `${property.address}, ${property.city || ''}, ${property.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '')
    }
    return `${property.city || ''}, ${property.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'Location not available'
  }

  const formatPrice = (price: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }
  return (
    <section className="py-20 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.05fr,1.35fr] items-start">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Curated Collection
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Featured Houses Ready For A Private Tour
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                Discover the most sought-after residences with natural light, contemporary finishes, and seamless smart-home integrations.
              </p>
            </div>
            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {/* <div className="grid grid-cols-3 gap-4 pt-2">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div> */}
            <div className="pt-4">
              <Link
                href="/properties?featured=true"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Explore all featured homes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {loading ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-muted-foreground">Loading featured properties...</p>
              </div>
            ) : featuredProperties.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-muted-foreground">No featured properties available at the moment.</p>
              </div>
            ) : (
              featuredProperties.map((property) => (
                <div
                  key={property.id}
                  className="group rounded-3xl border border-border bg-background overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={getImageUrl(property)}
                      alt={property.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 40vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary">
                      Featured
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Featured Listing</p>
                      <h3 className="text-xl font-semibold text-foreground mt-1">{property.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        {formatAddress(property)}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-semibold text-foreground">
                        {formatPrice(property.price, property.currency || "USD")}
                      </span>
                      {property.payment_frequency && (
                        <span className="text-sm text-muted-foreground">/{property.payment_frequency.toLowerCase()}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {property.bedrooms !== null && property.bedrooms !== undefined && (
                        <span className="flex items-center gap-1.5">
                          <Bed className="h-4 w-4 text-primary" /> {property.bedrooms} Beds
                        </span>
                      )}
                      {property.bathrooms !== null && property.bathrooms !== undefined && (
                        <span className="flex items-center gap-1.5">
                          <Bath className="h-4 w-4 text-primary" /> {property.bathrooms} Baths
                        </span>
                      )}
                      {property.size !== null && property.size !== undefined && (
                        <span className="flex items-center gap-1.5">
                          <Maximize2 className="h-4 w-4 text-primary" /> {property.size} sqft
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/properties/${property.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      View listing
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
