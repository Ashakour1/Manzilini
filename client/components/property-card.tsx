"use client"
import { Bed, Bath, Maximize2, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

interface PropertyCardProps {
  property: any
  onClick: () => void
}

export default function PropertyCard({ property, onClick }: PropertyCardProps) {
  const router = useRouter();

  // Format address from property data
  const address = property.address || `${property.city || ''}, ${property.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || property.location || '';

  // Check if property is featured (you can add a featured field to your schema later)
  const isFeatured = property.featured || false;

  // Handle image URL - support both relative paths and full URLs
  const getImageUrl = () => {
    // Prefer the first uploaded image, fall back to legacy property.image
    const imagePath =
      property.images?.[0]?.url ||
      property.image ||
      property.images?.[0]?.path;

    if (!imagePath) return "/placeholder.svg";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    if (imagePath.startsWith("/uploads")) {
      return `http://localhost:4000${imagePath}`;
    }
    return `http://localhost:4000/uploads/${imagePath}`;
  };

  return (
    <div
      onClick={() => router.push(`/properties/${property.id}`)}
      className="border rounded-lg cursor-pointer"
    >
      <div className="relative rounded-t-lg h-56 bg-gray-200 overflow-hidden">
        <img
          src={getImageUrl()}
          alt={property.title}
          className="w-full h-full object-cover rounded-t-lg"
        />
        {isFeatured && (
          <div className="absolute top-3 left-3 bg-orange-600 text-white px-3 py-1 rounded-md text-xs font-semibold">
            FEATURED
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Price - prominently displayed */}
        <div className="mb-3">
          <span className="text-2xl font-bold text-gray-900">
            KES {property.price?.toLocaleString() || property.price}
          </span>
        </div>

        {/* Property Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
          {property.title}
        </h3>

        {/* Address */}
        <div className="text-sm text-primary mb-4 line-clamp-1 flex items-center gap-1.5 ">
          <MapPin className="h-4 w-4 text-primary" />
          {address}
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1.5 text-primary">
            <Bed className="w-4 h-4 " />
            <span>{property.bedrooms || 0} Beds</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms || 0} Baths</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary">
            <Maximize2 className="w-4 h-4" />
            <span>{property.size || 0} sqft</span>
          </div>
        </div>
      </div>
    </div>
  )
}
