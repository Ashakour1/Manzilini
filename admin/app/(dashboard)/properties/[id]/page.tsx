"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit,
  MapPin,
  Bed,
  Bath,
  Car,
  Square,
  Layers,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  User,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getPropertyById } from "@/services/properties.service"

type Property = {
  id: string
  title: string
  description?: string
  property_type: string
  status: string
  price: number | string
  currency: string
  payment_frequency?: string
  deposit_amount?: number | string
  country: string
  city: string
  address: string
  zip_code?: string
  latitude?: number | string
  longitude?: number | string
  bedrooms?: number | string
  bathrooms?: number | string
  garages?: number | string
  size?: number | string
  is_furnished?: boolean
  floor?: number | string
  total_floors?: number | string
  balcony?: boolean
  amenities?: string[]
  landlord_id?: string
  landlord?: {
    id: string
    name: string
    email: string
    phone?: string
    company_name?: string
    address?: string
  }
  images?: { url: string }[]
}

export default function PropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined

  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!propertyId) return

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getPropertyById(propertyId)
        setProperty(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load property")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [propertyId])

  const formatPrice = (price: number | string, currency: string, frequency?: string) => {
    const amount = Number(price) || 0
    const formatted = amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    return `${currency} ${formatted}${frequency ? ` / ${frequency.toLowerCase()}` : ""}`
  }

  const getStatusVariant = (status: string) => {
    const lowerStatus = status.toLowerCase()
    if (lowerStatus === "available" || lowerStatus === "active") return "default"
    if (lowerStatus === "rented" || lowerStatus === "sold") return "secondary"
    return "outline"
  }

  if (isLoading) {
    return (
      <main className="flex-1 p-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading property details…</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 p-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      </main>
    )
  }

  if (!property) {
    return null
  }

  return (
    <main className="flex-1 p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-2xl font-semibold text-foreground">Property Details</h1>
          </div>
          <Button onClick={() => router.push(`/properties/${propertyId}/edit`)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Property
          </Button>
        </div>

        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-medium">
              {property.property_type}
            </Badge>
            <Badge variant={getStatusVariant(property.status)} className="uppercase font-medium">
              {property.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex-1 space-y-2">
              <h2 className="text-4xl font-bold text-foreground">{property.title}</h2>
              {property.description && (
                <p className="text-base leading-relaxed text-muted-foreground max-w-3xl">{property.description}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(property.price, property.currency, property.payment_frequency)}
              </span>
              {property.deposit_amount && (
                <span className="text-sm text-muted-foreground">
                  Deposit: {property.currency} {Number(property.deposit_amount).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Images Gallery */}
        {property.images && property.images.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Property Images</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {property.images.map((image, index) => (
                <div
                  key={image.url}
                  className="group relative overflow-hidden rounded-lg border bg-muted/30 transition-all hover:shadow-lg"
                >
                  <img
                    src={image.url}
                    alt={`${property.title} - Image ${index + 1}`}
                    className="h-64 w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Specifications */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Property Specifications</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {property.bedrooms && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <Bed className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bedrooms</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{property.bedrooms}</p>
                    </div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <Bath className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bathrooms</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{property.bathrooms}</p>
                    </div>
                  </div>
                )}
                {property.garages && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Garages</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{property.garages}</p>
                    </div>
                  </div>
                )}
                {property.size && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <Square className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Size</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {Number(property.size).toLocaleString()} sq ft
                      </p>
                    </div>
                  </div>
                )}
                {property.floor && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <Layers className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Floor</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {property.floor}
                        {property.total_floors && ` of ${property.total_floors}`}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Furnished</p>
                    <div className="mt-1 flex items-center gap-2">
                      {property.is_furnished ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <p className="text-lg font-semibold text-foreground">
                        {property.is_furnished ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>
                {property.balcony !== undefined && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Balcony</p>
                      <div className="mt-1 flex items-center gap-2">
                        {property.balcony ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <p className="text-lg font-semibold text-foreground">{property.balcony ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Address</p>
                  <p className="mt-1 text-base font-medium text-foreground">
                    {property.address}, {property.city}, {property.country}
                  </p>
                </div>
                {property.zip_code && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Zip Code</p>
                    <p className="mt-1 text-base font-medium text-foreground">{property.zip_code}</p>
                  </div>
                )}
                {property.latitude && property.longitude && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Coordinates</p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {property.latitude}, {property.longitude}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="px-3 py-1.5 font-normal">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-8 space-y-6">
              {/* Contact Information */}
              {property.landlord && (
                <div className="space-y-4 rounded-lg border bg-muted/30 p-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Landlord Information
                  </h3>
                  <div className="space-y-4">
                    {property.landlord.name && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{property.landlord.name}</p>
                      </div>
                    )}
                    {property.landlord.company_name && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Company</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{property.landlord.company_name}</p>
                      </div>
                    )}
                    {property.landlord.email && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`mailto:${property.landlord.email}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {property.landlord.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {property.landlord.phone && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`tel:${property.landlord.phone}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {property.landlord.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    {property.landlord.address && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Address</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{property.landlord.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
