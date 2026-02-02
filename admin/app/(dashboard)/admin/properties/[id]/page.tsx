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
            <Button onClick={() => router.push(`/admin/properties/${propertyId}/edit`)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">{property.title}</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{property.address}, {property.city}, {property.country}</span>
          </div>
        </div>
      </div>
    </main>
  )
}
