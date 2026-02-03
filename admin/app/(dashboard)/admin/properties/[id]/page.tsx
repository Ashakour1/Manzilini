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
  Clock,
  Hash,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPropertyById, publishProperty, deleteProperty, deletePropertyImage } from "@/services/properties.service"
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
  images?: { id: string; url: string }[]
}

export default function AdminPropertyDetailsPage() {
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
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null)

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
      router.push("/admin/properties")
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

  if (isLoading) {
    return (
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/properties")} className="px-0">
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

  return (
    <main className="flex-1 p-3 sm:p-4 lg:p-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/properties")} className="px-0">
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
              variant="outline" 
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
            <Button 
              variant="outline" 
              onClick={() => router.push(`/admin/properties/${propertyId}/edit`)} 
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setDeleteDialogOpen(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{property.title}</CardTitle>
                <CardDescription>{property.description || "No description available"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{property.address}, {property.city}, {property.country}</span>
                  {property.zip_code && <span className="text-sm">({property.zip_code})</span>}
                </div>
                
                {property.images && property.images.length > 0 && (
                  <div className="mb-6">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-foreground mb-2">Property Images ({property.images.length})</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {property.images.map((img, idx) => (
                        <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden border group cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                          <img
                            src={img.url}
                            alt={`${property.title} - Image ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs text-white font-medium">Image {idx + 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-6" />

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-4">Property Information</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Property Type</p>
                          <p className="text-sm font-medium text-foreground mt-1">{property.property_type || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <Bed className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bedrooms</p>
                          <p className="text-sm font-medium text-foreground mt-1">{property.bedrooms || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <Bath className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bathrooms</p>
                          <p className="text-sm font-medium text-foreground mt-1">{property.bathrooms || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Garages</p>
                          <p className="text-sm font-medium text-foreground mt-1">{property.garages || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <Square className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Size</p>
                          <p className="text-sm font-medium text-foreground mt-1">{property.size ? `${property.size} sqft` : "N/A"}</p>
                        </div>
                      </div>
                      {property.floor && (
                        <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                          <Layers className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Floor</p>
                            <p className="text-sm font-medium text-foreground mt-1">{property.floor} / {property.total_floors || "N/A"}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <Sparkles className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Furnished</p>
                          <div className="mt-1">
                            <Badge variant={property.is_furnished ? "default" : "secondary"}>
                              {property.is_furnished ? "Yes" : "No"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Balcony</p>
                          <div className="mt-1">
                            <Badge variant={property.balcony ? "default" : "secondary"}>
                              {property.balcony ? "Yes" : "No"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-4">Pricing & Status</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Price</p>
                          <p className="text-lg font-bold text-foreground mt-1">
                            {property.currency} {property.price}
                            {property.payment_frequency && (
                              <span className="text-sm font-normal text-muted-foreground"> / {property.payment_frequency}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      {property.deposit_amount && (
                        <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                          <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Deposit Amount</p>
                            <p className="text-sm font-medium text-foreground mt-1">
                              {property.currency} {property.deposit_amount}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                          <div className="mt-1">
                            <Badge variant={property.status === "AVAILABLE" ? "default" : "secondary"}>
                              {property.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        {property.is_published ? (
                          <Globe className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <EyeOff className="h-5 w-5 text-muted-foreground mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Publication Status</p>
                          <div className="mt-1">
                            <Badge variant={property.is_published ? "default" : "secondary"} className={property.is_published ? "bg-green-100 text-green-800" : ""}>
                              {property.is_published ? (
                                <span className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  Published
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <EyeOff className="h-3 w-3" />
                                  Unpublished
                                </span>
                              )}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-4">Location Details</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 sm:col-span-2">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Full Address</p>
                          <p className="text-sm font-medium text-foreground mt-1">
                            {property.address}, {property.city}, {property.country}
                            {property.zip_code && ` (${property.zip_code})`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">City</p>
                          <p className="text-sm font-medium text-foreground mt-1">{property.city || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Country</p>
                          <p className="text-sm font-medium text-foreground mt-1">{property.country || "N/A"}</p>
                        </div>
                      </div>
                      {property.zip_code && (
                        <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Zip Code</p>
                            <p className="text-sm font-medium text-foreground mt-1">{property.zip_code}</p>
                          </div>
                        </div>
                      )}
                      {property.latitude && property.longitude && (
                        <>
                          <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Latitude</p>
                              <p className="text-sm font-medium text-foreground mt-1">{property.latitude}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Longitude</p>
                              <p className="text-sm font-medium text-foreground mt-1">{property.longitude}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {property.amenities && property.amenities.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-4">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.map((amenity, idx) => (
                          <Badge key={idx} variant="outline" className="text-sm py-1 px-3">{amenity}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {property.landlord && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Landlord
                  </CardTitle>
                  <CardDescription>Property owner information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{property.landlord.name}</p>
                      {property.landlord.company_name && (
                        <p className="text-sm text-muted-foreground">{property.landlord.company_name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${property.landlord.email}`} className="text-primary hover:underline">
                          {property.landlord.email}
                        </a>
                      </div>
                      {property.landlord.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${property.landlord.phone}`} className="text-primary hover:underline">
                            {property.landlord.phone}
                          </a>
                        </div>
                      )}
                      {property.landlord.address && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{property.landlord.address}</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => router.push(`/admin/landlords/${property.landlord_id}`)}
                    >
                      View Landlord
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {property.user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Created By
                  </CardTitle>
                  <CardDescription>User who created this property</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">{property.user.name}</p>
                    <p className="text-sm text-muted-foreground">{property.user.email}</p>
                    {property.user.role && (
                      <Badge variant="outline" className="text-xs">{property.user.role}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>Property creation and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {property.createdAt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Created</span>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-6">
                      {new Date(property.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
                {property.updatedAt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Last Updated</span>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-6">
                      {new Date(property.updatedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Hash className="h-3.5 w-3.5" />
                    <span>Property ID</span>
                  </div>
                  <p className="text-sm font-mono text-foreground pl-6 break-all">{property.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
              <br />
              <span className="font-semibold text-foreground mt-2 block">
                Property: {property.title}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </>
              ) : (
                "Delete Property"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
