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
  Globe,
  EyeOff,
  Calendar,
  Building2,
  Star,
  ChevronRight,
  ExternalLink,
  Heart,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPropertyById, publishProperty, deleteProperty } from "@/services/properties.service"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  user?: {
    id: string
    name: string
    email: string
    role?: string
    image?: string
  }
  is_published?: boolean
  createdAt?: string
  updatedAt?: string
  images?: { url: string }[]
}

export default function PropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const propertyId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined

  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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

  const handlePublish = async () => {
    if (!property) return
    setIsPublishing(true)
    try {
      const updatedProperty = await publishProperty(property.id, !property.is_published)
      setProperty({ ...property, is_published: updatedProperty.is_published })
      toast({
        title: "Success",
        description: updatedProperty.is_published ? "Property published successfully" : "Property unpublished successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update publication status",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleDelete = async () => {
    if (!property) return
    setIsDeleting(true)
    try {
      await deleteProperty(property.id)
      toast({
        title: "Success",
        description: "Property deleted successfully",
      })
      router.push("/properties")
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete property",
        variant: "destructive",
      })
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

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
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-96 w-full" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="px-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
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

  const mainImage = property.images && property.images.length > 0 ? property.images[selectedImageIndex] : null
  const allImages = property.images || []

  return (
    <main className="flex-1 p-3 sm:p-4 lg:p-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/properties")} className="px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Property Details</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={property.is_published ? "outline" : "default"}
              onClick={handlePublish}
              disabled={isPublishing}
              className="gap-2"
            >
              {isPublishing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {property.is_published ? "Unpublishing..." : "Publishing..."}
                </>
              ) : property.is_published ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Unpublish
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  Publish
                </>
              )}
            </Button>
            <Button onClick={() => router.push(`/properties/${propertyId}/edit`)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Location Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer">{property.country}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="hover:text-foreground cursor-pointer">{property.city}</span>
          {property.zip_code && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span>{property.zip_code}</span>
            </>
          )}
          {property.latitude && property.longitude && Number(property.latitude) !== 0 && Number(property.longitude) !== 0 && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <Button variant="ghost" size="sm" className="h-auto p-0 text-sm" asChild>
                <a href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`} target="_blank" rel="noopener noreferrer">
                  View on map
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </>
          )}
        </div>

        {/* Title and Address */}
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">{property.title}</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{property.address}, {property.city}, {property.country}</span>
          </div>
        </div>

        {/* Image Gallery */}
        {allImages.length > 0 ? (
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
              {mainImage && (
                <img
                  src={mainImage.url}
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            {/* All Other Images Grid */}
            {allImages.length > 1 && (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {allImages.map((image, index) => (
                  <button
                    key={image.url}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-video w-full overflow-hidden rounded-lg border bg-muted transition-opacity hover:opacity-80 ${
                      selectedImageIndex === index ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${property.title} - Image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No images available</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Accommodates Section */}
            <Card>
              <CardHeader>
                <CardTitle>Accommodates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Bedrooms</p>
                    <p className="text-2xl font-bold text-foreground">
                      {property.bedrooms !== undefined && property.bedrooms !== null ? property.bedrooms : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Bathrooms</p>
                    <p className="text-2xl font-bold text-foreground">
                      {property.bathrooms !== undefined && property.bathrooms !== null ? property.bathrooms : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Garages</p>
                    <p className="text-2xl font-bold text-foreground">
                      {property.garages !== undefined && property.garages !== null ? property.garages : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Size</p>
                    <p className="text-2xl font-bold text-foreground">
                      {property.size && Number(property.size) > 0 ? (
                        <>
                          {Number(property.size).toLocaleString()} <span className="text-base font-normal">sq ft</span>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>
                </div>
                {property.floor !== undefined && property.floor !== null && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Floor: {property.floor}
                        {property.total_floors && ` of ${property.total_floors}`}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Property Type</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{property.property_type || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                    <div className="mt-1">
                      <Badge variant={getStatusVariant(property.status)} className="uppercase">
                        {property.status || "N/A"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Furnished</p>
                    <div className="mt-1 flex items-center gap-2">
                      {property.is_furnished ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <p className="text-sm font-medium text-foreground">
                        {property.is_furnished ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Balcony</p>
                    <div className="mt-1 flex items-center gap-2">
                      {property.balcony ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <p className="text-sm font-medium text-foreground">{property.balcony ? "Yes" : "No"}</p>
                    </div>
                  </div>
                  {property.zip_code && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Zip Code</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{property.zip_code}</p>
                    </div>
                  )}
                  {(property.latitude || property.longitude) && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Coordinates</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {Number(property.latitude) !== 0 && Number(property.longitude) !== 0 ? (
                          <>
                            {property.latitude}, {property.longitude}
                          </>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Description</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {property.description || "No description provided"}
                  </p>
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
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {property.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-foreground">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing & Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">
                      {formatPrice(property.price, property.currency, property.payment_frequency)}
                    </span>
                  </div>
                  {property.deposit_amount && Number(property.deposit_amount) > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Deposit: {property.currency} {Number(property.deposit_amount).toLocaleString()}
                    </p>
                  )}
                </div>
                <Separator />
                <div className="space-y-3">
                  <Button 
                    onClick={() => router.push(`/properties/${propertyId}/edit`)} 
                    className="w-full" 
                    size="lg"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Property
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? "Deleting..." : "Delete Property"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Landlord Information */}
            {property.landlord && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Landlord
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{property.landlord.name || "N/A"}</p>
                  </div>
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/landlords/${property.landlord?.id}`)}
                  >
                    View Landlord Details
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Property Creator */}
            {property.user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Created By
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{property.user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${property.user.email}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {property.user.email}
                      </a>
                    </div>
                  </div>
                  {property.user.role && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</p>
                      <Badge variant="outline" className="mt-1">
                        {property.user.role}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Property Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Publication</p>
                  <div className="mt-1">
                    {property.is_published ? (
                      <Badge className="bg-green-50 text-green-700 border border-green-100 dark:bg-green-950 dark:text-green-300">
                        <Globe className="mr-1 h-3 w-3" />
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <EyeOff className="mr-1 h-3 w-3" />
                        Unpublished
                      </Badge>
                    )}
                  </div>
                </div>
                {property.createdAt && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        {new Date(property.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {property.updatedAt && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last Updated</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        {new Date(property.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property "{property.title}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
