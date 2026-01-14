"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Car,
  Ruler,
  Calendar,
  User,
  Mail,
  Phone,
  Image as ImageIcon,
  Globe,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getPropertyById } from "@/services/properties.service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Property = {
  id: string
  title: string
  description: string
  address: string
  city: string
  country: string
  zip_code: string
  property_type: string
  status: string
  price: number
  currency: string
  payment_frequency: string
  deposit_amount?: number
  bedrooms?: number
  bathrooms?: number
  garages?: number
  size?: number
  is_furnished?: boolean
  floor?: number
  total_floors?: number
  balcony?: boolean
  amenities: string[]
  is_featured?: boolean
  is_published?: boolean
  createdAt?: string
  images?: { url: string }[]
  user?: {
    id: string
    name: string
    email: string
  }
  landlord?: {
    id: string
    name: string
    email: string
    phone?: string
  }
}

export default function AgentPropertyDetailsPage() {
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

  if (isLoading)
    return (
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="space-y-4 w-full max-w-2xl">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </main>
    )

  if (error) {
    return (
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      FOR_RENT: { label: "For Rent", variant: "default" },
      FOR_SALE: { label: "For Sale", variant: "default" },
      RENTED: { label: "Rented", variant: "secondary" },
      SOLD: { label: "Sold", variant: "secondary" },
    }
    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  return (
    <main className="flex-1 p-3 sm:p-4 lg:p-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/agent/properties")} className="px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{property.title}</h1>
              <p className="text-sm text-muted-foreground">Property Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(property.status)}
            {property.is_featured && <Badge variant="outline">Featured</Badge>}
            {property.is_published ? (
              <Badge className="bg-green-50 text-green-700 border border-green-100 dark:bg-green-950 dark:text-green-300">
                <Globe className="mr-1 h-3 w-3" />
                Published
              </Badge>
            ) : (
              <Badge className="bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950 dark:text-amber-300">
                <EyeOff className="mr-1 h-3 w-3" />
                Waiting Approval
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {property.images && property.images.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <img
                        src={property.images[0].url}
                        alt={property.title}
                        className="h-64 w-full rounded-t-lg object-cover"
                      />
                    </div>
                    {property.images.slice(1, 5).map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={`${property.title} ${idx + 2}`}
                        className="h-32 w-full object-cover"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No images available</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground whitespace-pre-wrap">{property.description}</p>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {property.bedrooms !== null && property.bedrooms !== undefined && (
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-[#2a6f97]" />
                      <div>
                        <p className="text-xs text-muted-foreground">Bedrooms</p>
                        <p className="text-sm font-medium">{property.bedrooms}</p>
                      </div>
                    </div>
                  )}
                  {property.bathrooms !== null && property.bathrooms !== undefined && (
                    <div className="flex items-center gap-2">
                      <Bath className="h-4 w-4 text-[#2a6f97]" />
                      <div>
                        <p className="text-xs text-muted-foreground">Bathrooms</p>
                        <p className="text-sm font-medium">{property.bathrooms}</p>
                      </div>
                    </div>
                  )}
                  {property.garages !== null && property.garages !== undefined && (
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-[#2a6f97]" />
                      <div>
                        <p className="text-xs text-muted-foreground">Garages</p>
                        <p className="text-sm font-medium">{property.garages}</p>
                      </div>
                    </div>
                  )}
                  {property.size && (
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-[#2a6f97]" />
                      <div>
                        <p className="text-xs text-muted-foreground">Size</p>
                        <p className="text-sm font-medium">{property.size} sqft</p>
                      </div>
                    </div>
                  )}
                  {property.floor !== null && property.floor !== undefined && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#2a6f97]" />
                      <div>
                        <p className="text-xs text-muted-foreground">Floor</p>
                        <p className="text-sm font-medium">{property.floor} / {property.total_floors || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                  {property.is_furnished !== null && property.is_furnished !== undefined && (
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Furnished</p>
                        <p className="text-sm font-medium">{property.is_furnished ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, idx) => (
                      <Badge key={idx} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold text-foreground">
                    {property.currency} {property.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">/{property.payment_frequency.toLowerCase()}</p>
                </div>
                {property.deposit_amount && (
                  <div>
                    <p className="text-xs text-muted-foreground">Deposit</p>
                    <p className="text-lg font-semibold text-foreground">
                      {property.currency} {property.deposit_amount.toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#2a6f97] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{property.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {property.city}, {property.country} {property.zip_code}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creator Information */}
            {property.user && (
              <Card>
                <CardHeader>
                  <CardTitle>Property Creator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-[#2a6f97] text-white">
                        {property.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{property.user.name}</p>
                      <p className="text-xs text-muted-foreground">{property.user.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Landlord Information */}
            {property.landlord && (
              <Card>
                <CardHeader>
                  <CardTitle>Landlord</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{property.landlord.name}</p>
                    {property.landlord.company_name && (
                      <p className="text-xs text-muted-foreground">{property.landlord.company_name}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{property.landlord.email}</span>
                    </div>
                    {property.landlord.phone && (
                      <div className="flex items-center gap-2 text-xs">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{property.landlord.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Property Info */}
            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium text-foreground">{property.property_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Publication Status</p>
                  {property.is_published ? (
                    <Badge className="bg-green-50 text-green-700 border border-green-100 dark:bg-green-950 dark:text-green-300 mt-1">
                      <Globe className="mr-1 h-3 w-3" />
                      Published
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950 dark:text-amber-300 mt-1">
                      <EyeOff className="mr-1 h-3 w-3" />
                      Waiting Approval
                    </Badge>
                  )}
                </div>
                {property.createdAt && (
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(property.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
