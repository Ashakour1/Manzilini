"use client"

import { useState, MouseEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Heart, ChevronLeft, ChevronRight, Star, Bed, Bath, Maximize2, MapPin } from "lucide-react"

interface PropertyCardProps {
  property: any
  onClick?: () => void
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  const resolveImage = (item: any): string => {
    const path = item?.url || item?.path || item
    if (!path || typeof path !== "string") return "/placeholder.svg"
    if (path.startsWith("http://") || path.startsWith("https://")) return path
    if (path.startsWith("/uploads")) return `http://localhost:4000${path}`
    if (path.startsWith("/")) return path
    return `http://localhost:4000/uploads/${path}`
  }

  const images: string[] = (() => {
    if (Array.isArray(property.images) && property.images.length > 0) {
      return property.images.map(resolveImage)
    }
    if (property.image) return [resolveImage(property.image)]
    return ["/placeholder.svg"]
  })()

  const totalImages = images.length
  const hasMultipleImages = totalImages > 1

  const cityLabel = property.city
    ? `${property.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1) : "Property"} in ${property.city}`
    : property.property_type
      ? `${property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}`
      : "Property"

  const ratingValue: number | null =
    typeof property.rating === "number"
      ? property.rating
      : property.average_rating ?? null
  const reviewCount: number | null =
    property.review_count ?? property.reviews_count ?? null

  const isFeatured = property.is_featured || property.featured
  const isNew = property.is_new
  const isSuperhost = property.is_superhost

  const badge = isFeatured
    ? { label: "Featured", className: "bg-primary text-primary-foreground" }
    : isSuperhost
      ? { label: "Superhost", className: "bg-amber-500 text-white" }
      : isNew
        ? { label: "New", className: "bg-emerald-500 text-white" }
        : null

  const frequency = (property.payment_frequency || "month").toString().toLowerCase()
  const oldPrice = property.original_price ?? property.old_price
  const formattedPrice = `KES ${Number(property.price || 0).toLocaleString("en-KE")}`
  const formattedOldPrice =
    oldPrice && Number(oldPrice) > Number(property.price || 0)
      ? `KES ${Number(oldPrice).toLocaleString("en-KE")}`
      : null

  const locationLabel =
    property.address ||
    [property.city, property.country].filter(Boolean).join(", ") ||
    property.location ||
    ""

  const goPrev = (e: MouseEvent) => {
    e.stopPropagation()
    setActiveIndex((i) => (i - 1 + totalImages) % totalImages)
  }
  const goNext = (e: MouseEvent) => {
    e.stopPropagation()
    setActiveIndex((i) => (i + 1) % totalImages)
  }
  const toggleFavorite = (e: MouseEvent) => {
    e.stopPropagation()
    setIsFavorite((v) => !v)
  }

  return (
    <article
      onClick={() => router.push(`/properties/${property.id}`)}
      className="group cursor-pointer"
    >
      {/* Image / carousel */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted">
        {images.map((src, idx) => (
          <Image
            key={`${src}-${idx}`}
            src={src}
            alt={property.title || "Property image"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-opacity duration-300 ${
              idx === activeIndex ? "opacity-100" : "opacity-0"
            }`}
            priority={idx === 0}
          />
        ))}

        {/* Top-left badge */}
        {badge && (
          <div
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${badge.className}`}
          >
            {badge.label}
          </div>
        )}

        {/* Heart icon */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white transition hover:scale-110 hover:bg-black/30"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFavorite ? "fill-red-500 text-red-500" : "fill-black/30 text-white/90"
            }`}
            strokeWidth={2}
          />
        </button>

        {/* Carousel arrows (only on hover, only with multiple images) */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-foreground shadow-md opacity-0 transition group-hover:opacity-100 hover:scale-105"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-foreground shadow-md opacity-0 transition group-hover:opacity-100 hover:scale-105"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
              {images.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    idx === activeIndex % 5
                      ? "bg-white scale-110"
                      : "bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-foreground line-clamp-1">
            {cityLabel}
          </h3>
          {ratingValue !== null && (
            <div className="flex flex-shrink-0 items-center gap-1 text-sm text-foreground">
              <Star className="h-3.5 w-3.5 fill-foreground" />
              <span className="tabular-nums">
                {Number(ratingValue).toFixed(2).replace(/\.?0+$/, "")}
                {reviewCount !== null ? ` (${reviewCount})` : ""}
              </span>
            </div>
          )}
        </div>

        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
          {property.title}
        </p>

        {locationLabel && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground line-clamp-1">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
            {locationLabel}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-primary" />
              <span className="tabular-nums">{property.bedrooms}</span>
              <span>{property.bedrooms === 1 ? "Bed" : "Beds"}</span>
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-primary" />
              <span className="tabular-nums">{property.bathrooms}</span>
              <span>{property.bathrooms === 1 ? "Bath" : "Baths"}</span>
            </span>
          )}
          {property.size != null && (
            <span className="flex items-center gap-1.5">
              <Maximize2 className="h-4 w-4 text-primary" />
              <span className="tabular-nums">{property.size}</span>
              <span>sqft</span>
            </span>
          )}
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          {formattedOldPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formattedOldPrice}
            </span>
          )}
          <span className="text-sm font-semibold text-foreground underline underline-offset-2">
            {formattedPrice}
          </span>
          <span className="text-sm text-muted-foreground">for 1 {frequency}</span>
        </div>
      </div>
    </article>
  )
}
