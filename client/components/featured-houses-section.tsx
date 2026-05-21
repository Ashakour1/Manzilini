"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"
import PropertyCard from "@/components/property-card"
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

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Featured
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Handpicked homes ready for you
            </h2>
            <p className="mt-3 text-muted-foreground">
              Curated residences with premium finishes and great locations across Kenya — chosen by our team.
            </p>
          </div>
          <Link
            href="/properties?featured=true"
            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:text-primary"
          >
            View all featured
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] w-full rounded-2xl bg-muted" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                  <div className="h-3 w-2/3 rounded bg-muted" />
                  <div className="h-4 w-1/3 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProperties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-16 text-center">
            <Star className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-muted-foreground">
              No featured properties available at the moment.
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Check back soon for curated listings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
