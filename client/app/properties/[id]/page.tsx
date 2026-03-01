"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { fetchPropertyById } from "@/services/properties.service"
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Car,
  Home,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Share2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PropertyApplicationForm from "@/components/property-application-form"
import Link from "next/link"

export default function PropertyDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    if (id) {
      fetchPropertyById(id)
        .then((data) => {
          if (data && data.is_published === true) {
            setProperty(data)
          } else {
            setProperty(null)
          }
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading property...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Home className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Property not found</h1>
        <p className="text-muted-foreground mb-8">
          The property you are looking for does not exist or is no longer available.
        </p>
        <Button asChild variant="outline">
          <Link href="/properties">Browse all properties</Link>
        </Button>
      </div>
    )
  }

  const getImageUrl = (image: any) => {
    const imagePath =
      typeof image === "string"
        ? image
        : image?.url || image?.path || property.image || property.images?.[0]?.url || property.images?.[0]?.path

    if (!imagePath) return "/placeholder.svg"
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath
    }
    if (imagePath.startsWith("/uploads")) {
      return `http://localhost:4000${imagePath}`
    }
    return `http://localhost:4000/uploads/${imagePath}`
  }

  const rawImages = property.images?.length ? property.images : property.image ? [property.image] : []
  const images = rawImages.length ? rawImages : ["/placeholder.svg"]

  const fullAddress = property.address
    ? `${property.address}, ${property.city || ""}, ${property.country || ""}`
        .trim()
        .replace(/^,\s*|,\s*$/g, "")
    : `${property.city || ""}, ${property.country || ""}`
        .trim()
        .replace(/^,\s*|,\s*$/g, "") || "Address not available"

  const featureItems = [
    { icon: Bed, label: "Bedrooms", value: property.bedrooms, show: property.bedrooms != null },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms, show: property.bathrooms != null },
    { icon: Maximize2, label: "Size", value: property.size ? `${property.size} sqft` : null, show: property.size != null },
    { icon: Car, label: "Garages", value: property.garages, show: property.garages != null },
  ].filter((f) => f.show)

  const detailItems = [
    {
      icon: Home,
      label: "Property Type",
      value: property.property_type?.toLowerCase().replace("_", " "),
      show: !!property.property_type,
    },
    {
      icon: Layers,
      label: "Floor",
      value: property.floor != null ? `${property.floor}${property.total_floors ? ` of ${property.total_floors}` : ""}` : null,
      show: property.floor != null,
    },
    {
      icon: CheckCircle2,
      label: "Furnished",
      value: property.is_furnished ? "Yes" : "No",
      show: property.is_furnished != null,
    },
    {
      icon: Building2,
      label: "Balcony",
      value: property.balcony ? "Yes" : "No",
      show: property.balcony != null,
    },
  ].filter((d) => d.show)

  return (
    <div className="bg-background min-h-screen">
      {/* Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="relative w-full h-[480px] md:h-[560px] rounded-2xl overflow-hidden bg-muted group">
          <img
            src={getImageUrl(images[selectedImageIndex])}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {images.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background text-foreground p-2.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background text-foreground p-2.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Bottom overlay info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
            {images.length > 1 && (
              <div className="bg-background/80 backdrop-blur-sm text-foreground px-3 py-1.5 rounded-full text-sm font-medium">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="bg-background/80 backdrop-blur-sm border-transparent hover:bg-background ml-auto"
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
            >
              <Share2 className="w-4 h-4 mr-1.5" />
              Share
            </Button>
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img: any, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImageIndex === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={getImageUrl(img)}
                  alt={`${property.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Title, Location, Price */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {property.status && (
                  <Badge variant="secondary" className="capitalize text-xs">
                    {property.status.toLowerCase().replace("_", " ")}
                  </Badge>
                )}
                {property.property_type && (
                  <Badge variant="outline" className="capitalize text-xs">
                    {property.property_type.toLowerCase().replace("_", " ")}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
                {property.title}
              </h1>

              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">{fullAddress}</span>
              </div>

              {/* Price card */}
              <div className="p-6 bg-primary/5 border border-primary/10 rounded-xl">
                <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Rent Price</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-medium text-primary">KES</span>
                      <span className="text-4xl font-extrabold text-foreground tabular-nums">
                        {Number(property.price || 0).toLocaleString("en-KE")}
                      </span>
                      {property.payment_frequency && (
                        <span className="text-base text-muted-foreground font-normal">
                          /{property.payment_frequency.toLowerCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  {property.deposit_amount != null && (
                    <div className="pl-8 border-l-2 border-primary/20">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Deposit Required</p>
                      <div className="flex items-baseline gap-1">
                        {property.deposit_type === "PERCENTAGE" ? (
                          <>
                            <span className="text-2xl font-bold text-foreground tabular-nums">
                              {Number(property.deposit_amount || 0).toLocaleString("en-KE")}%
                            </span>
                            <span className="text-sm text-muted-foreground">of rent</span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-medium text-primary">KES</span>
                            <span className="text-2xl font-bold text-foreground tabular-nums">
                              {Number(property.deposit_amount || 0).toLocaleString("en-KE")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Features */}
            {featureItems.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {featureItems.map((feat) => {
                  const Icon = feat.icon
                  return (
                    <div
                      key={feat.label}
                      className="group p-5 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                          <Icon className="w-4.5 h-4.5 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">{feat.label}</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">{feat.value}</p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">About this Property</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* Additional Details */}
            {detailItems.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Property Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {detailItems.map((detail) => {
                    const Icon = detail.icon
                    return (
                      <div
                        key={detail.label}
                        className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{detail.label}</p>
                          <p className="text-sm font-semibold text-foreground capitalize">{detail.value}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2.5 p-3 bg-card rounded-lg border border-border"
                    >
                      <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {property.latitude && property.longitude && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Location</h2>
                <div className="w-full h-64 bg-muted rounded-xl border border-border flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Map view coming soon</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {property.latitude}, {property.longitude}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {property.landlord?.id && (
                <PropertyApplicationForm
                  propertyId={property.id}
                  landlordId={property.landlord.id}
                  propertyTitle={property.title}
                />
              )}

              {property.createdAt && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Listed on {new Date(property.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
