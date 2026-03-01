"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Bath, Bed, MapPin, Maximize2, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchProperties } from "@/services/properties.service"

interface Property {
  currency: string
  payment_frequency: any
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
  is_published?: boolean
  images?: { url: string }[]
}

export default function FeaturedHousesSection() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeaturedProperties = async () => {
      try {
        const allProperties = await fetchProperties("", "")
        const featured = (allProperties || [])
          .filter((p: Property) => p.is_published === true && p.is_featured === true)
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
    const imagePath = property.images?.[0]?.url
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
      return `${property.address}, ${property.city || ""}, ${property.country || ""}`
        .trim()
        .replace(/^,\s*|,\s*$/g, "")
    }
    return (
      `${property.city || ""}, ${property.country || ""}`.trim().replace(/^,\s*|,\s*$/g, "") ||
      "Location not available"
    )
  }

  return (
    <section className="py-20 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              <Star className="w-3.5 h-3.5 fill-primary" />
              Curated Collection
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight mb-3">
              Featured Homes Ready for You
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Discover handpicked residences with premium finishes, natural light, and modern amenities in Nairobi&apos;s top neighborhoods.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full self-start md:self-auto">
            <Link href="/properties?featured=true" className="gap-2">
              View all featured
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
                <div className="h-56 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-5 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                  <div className="h-8 w-2/3 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProperties.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border bg-card">
            <Star className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No featured properties available at the moment.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Check back soon for curated listings.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredProperties.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={getImageUrl(property)}
                    alt={property.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0 shadow-md text-[11px]">
                    Featured
                  </Badge>
                  {property.property_type && (
                    <Badge
                      variant="secondary"
                      className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm border-0 text-foreground capitalize text-[11px]"
                    >
                      {property.property_type.toLowerCase().replace("_", " ")}
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span className="text-xs truncate">{formatAddress(property)}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-xs font-medium text-primary">KES</span>
                    <span className="text-2xl font-extrabold text-foreground tabular-nums">
                      {Number(property.price || 0).toLocaleString("en-KE")}
                    </span>
                    {property.payment_frequency && (
                      <span className="text-xs text-muted-foreground">
                        /{property.payment_frequency.toLowerCase()}
                      </span>
                    )}
                  </div>

                  {/* Divider + Features */}
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {property.bedrooms != null && (
                        <span className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5 text-primary" />
                          {property.bedrooms} Beds
                        </span>
                      )}
                      {property.bathrooms != null && (
                        <span className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5 text-primary" />
                          {property.bathrooms} Baths
                        </span>
                      )}
                      {property.size != null && (
                        <span className="flex items-center gap-1">
                          <Maximize2 className="h-3.5 w-3.5 text-primary" />
                          {property.size} sqft
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
