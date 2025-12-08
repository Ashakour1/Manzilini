"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { fetchPropertyById } from "@/services/properties.service"
import { Bed, Bath, Maximize2, MapPin, Car, Home, Building2, Mail, Phone, MessageCircle, Calendar, DollarSign, Key, Layers, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PropertyDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Fetch property data
  useEffect(() => {
    if (id) {
      fetchPropertyById(id).then((data) => {
        setProperty(data)
        setLoading(false)
      }).catch(() => {
        setLoading(false)
      })
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-500">Loading property...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-2xl font-semibold text-gray-900">Property not found</h1>
        <p className="text-gray-500 mt-2">The property you are looking for does not exist.</p>
      </div>
    )
  }

  // Normalize any type of image reference to an absolute URL.
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

  // Build gallery sources from uploaded images (fallback to legacy single image or placeholder).
  const rawImages = property.images?.length
    ? property.images
    : property.image
      ? [property.image]
      : []
  const images = rawImages.length ? rawImages : ["/placeholder.svg"]

  // Format address
  const fullAddress = property.address 
    ? `${property.address}, ${property.city || ''}, ${property.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '')
    : `${property.city || ''}, ${property.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'Address not available'

  // Format price with currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: property.currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(property.price || 0)

  return (
    <div className="bg-white">
      <div className="w-full">
        {/* Hero Section with Image Gallery */}
        <div className="">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="relative w-full h-[600px] border rounded-2xl overflow-hidden mb-4">
                <img
                  src={getImageUrl(images[selectedImageIndex])}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {/* {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
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
              )} */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title and Location */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{fullAddress}</span>
                </div>
              </div>

              {/* Price and Status */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">{formattedPrice}</span>
                    {property.payment_frequency && (
                      <span className="text-lg text-gray-600">/ {property.payment_frequency.toLowerCase()}</span>
                    )}
                  </div>
                  {property.deposit_amount && (
                    <p className="text-sm text-gray-600 mt-1">Deposit: {new Intl.NumberFormat('en-US', { style: 'currency', currency: property.currency || 'USD' }).format(property.deposit_amount)}</p>
                  )}
                </div>
                <div className="px-4 py-2 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm font-semibold text-gray-700 capitalize">{property.status?.toLowerCase().replace('_', ' ')}</span>
                </div>
              </div>

              {/* Property Features Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.bedrooms !== null && property.bedrooms !== undefined && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Bed className="w-6 h-6 text-blue-600" />
                      <span className="text-sm text-gray-600">Bedrooms</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{property.bedrooms}</p>
                  </div>
                )}
                {property.bathrooms !== null && property.bathrooms !== undefined && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Bath className="w-6 h-6 text-blue-600" />
                      <span className="text-sm text-gray-600">Bathrooms</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{property.bathrooms}</p>
                  </div>
                )}
                {property.size !== null && property.size !== undefined && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Maximize2 className="w-6 h-6 text-blue-600" />
                      <span className="text-sm text-gray-600">Size</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{property.size} sqft</p>
                  </div>
                )}
                {property.garages !== null && property.garages !== undefined && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Car className="w-6 h-6 text-blue-600" />
                      <span className="text-sm text-gray-600">Garages</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{property.garages}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {property.property_type && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">Property Type</span>
                    </div>
                    <p className="text-lg text-gray-900 capitalize">{property.property_type.toLowerCase().replace('_', ' ')}</p>
                  </div>
                )}
                {property.floor !== null && property.floor !== undefined && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">Floor</span>
                    </div>
                    <p className="text-lg text-gray-900">
                      {property.floor} {property.total_floors ? `of ${property.total_floors}` : ''}
                    </p>
                  </div>
                )}
                {property.is_furnished !== null && property.is_furnished !== undefined && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">Furnished</span>
                    </div>
                    <p className="text-lg text-gray-900">{property.is_furnished ? 'Yes' : 'No'}</p>
                  </div>
                )}
                {property.balcony !== null && property.balcony !== undefined && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">Balcony</span>
                    </div>
                    <p className="text-lg text-gray-900">{property.balcony ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Map Placeholder */}
              {property.latitude && property.longitude && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
                  <div className="w-full h-64 bg-gray-200 rounded-xl border border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Map view coming soon</p>
                      <p className="text-sm text-gray-500 mt-1">Coordinates: {property.latitude}, {property.longitude}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Contact Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="rounded-2xl p-6 ">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
                  

                  {/* // to see the landlord details you want to pay a small fee to the landlord
                  {property.landlord.name && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Contact Name</p>
                      <p className="text-lg font-semibold text-gray-900">{property.landlord.name}</p>
                    </div>
                  )}

                  <div className="space-y-4 mb-6">
                    {property.landlord.email && (
                      <a
                        href={`mailto:${property.landlord.email}`}
                        className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Mail className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-700">{property.landlord.email}</span>
                      </a>
                    )}
                    {property.landlord.phone && (
                      <a
                        href={`tel:${property.landlord.phone}`}
                        className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <Phone className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">{property.landlord.phone}</span>
                      </a>
                    )}
                  </div> */}

<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 text-center mb-2">
                      Unlock Landlord Contact Details
                    </h4>
                    <p className="text-sm text-gray-600 text-center mb-4">
                      To view the landlord's contact information (name, email, and phone), please pay a support fee to the company.
                    </p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Pay Support Fee to View Details
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Secure payment • Instant access
                    </p>
                  </div>
                  

                

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    {/* <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Property ID</span>
                      <span className="font-mono text-gray-900">{property.id.slice(0, 8)}...</span>
                    </div> */}
                    {property.createdAt && (
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-600">Listed</span>
                        <span className="text-gray-900">{new Date(property.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
    </div>
  )
}
