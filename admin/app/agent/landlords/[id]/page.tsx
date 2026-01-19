"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  User,
  Building,
  UserCheck,
  UserX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getLandlordById } from "@/services/landlords.service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Landlord = {
  id: string
  name: string
  email: string
  phone?: string
  company_name?: string
  address?: string
  isVerified?: boolean
  status?: "ACTIVE" | "INACTIVE"
  createdAt?: string
  properties?: {
    id: string
    title: string
    status: string
    images?: { url: string }[]
  }[]
  creator?: {
    id: string
    name: string
    email: string
    role?: string
    image?: string
  } | null
}

export default function AgentLandlordDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const landlordId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined

  const [landlord, setLandlord] = useState<Landlord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!landlordId) return

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getLandlordById(landlordId)
        setLandlord(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load landlord")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [landlordId])

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

  if (!landlord) {
    return null
  }

  return (
    <main className="flex-1 p-3 sm:p-4 lg:p-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/agent/landlords")} className="px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Landlord Details</h1>
              <p className="text-sm text-muted-foreground">View complete information about this landlord</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {landlord.isVerified ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary">Unverified</Badge>
            )}
            {landlord.status === "ACTIVE" ? (
              <Badge className="bg-green-50 text-green-700 border border-green-100 dark:bg-green-950 dark:text-green-300">
                <UserCheck className="mr-1 h-3 w-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-50 text-gray-700 border border-gray-100 dark:bg-gray-950 dark:text-gray-300">
                <UserX className="mr-1 h-3 w-3" />
                Inactive
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Basic details about the landlord</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border-2 border-[#2a6f97]">
                    <AvatarFallback className="bg-[#2a6f97] text-white text-xl font-semibold">
                      {landlord.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">{landlord.name}</h2>
                    {landlord.company_name && (
                      <p className="text-sm text-muted-foreground mt-1">{landlord.company_name}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">Email</span>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-6">{landlord.email}</p>
                  </div>

                  {landlord.phone && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span className="font-medium">Phone</span>
                      </div>
                      <p className="text-sm font-medium text-foreground pl-6">{landlord.phone}</p>
                    </div>
                  )}

                  {landlord.address && (
                    <div className="space-y-2 sm:col-span-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Address</span>
                      </div>
                      <p className="text-sm font-medium text-foreground pl-6">{landlord.address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Properties Card */}
            {landlord.properties && landlord.properties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Properties</CardTitle>
                  <CardDescription>Properties managed by this landlord</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {landlord.properties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/agent/properties/${property.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          {property.images && property.images.length > 0 ? (
                            <img
                              src={property.images[0].url}
                              alt={property.title}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">{property.title}</p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {property.status}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Landlord Creator Information */}
            {landlord.creator && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Landlord Creator
                  </CardTitle>
                  <CardDescription>User who created this landlord</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{landlord.creator.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${landlord.creator.email}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {landlord.creator.email}
                      </a>
                    </div>
                  </div>
                  {landlord.creator.role && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</p>
                      <Badge variant="outline" className="mt-1">
                        {landlord.creator.role}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Created</span>
                  </div>
                  <p className="text-sm font-medium text-foreground pl-6">
                    {landlord.createdAt
                      ? new Date(landlord.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Building className="h-3.5 w-3.5" />
                    <span>Properties</span>
                  </div>
                  <p className="text-sm font-medium text-foreground pl-6">
                    {landlord.properties?.length || 0} properties
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verification</span>
                  </div>
                  <Badge variant={landlord.isVerified ? "default" : "secondary"} className="ml-6">
                    {landlord.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {landlord.status === "ACTIVE" ? (
                      <UserCheck className="h-3.5 w-3.5" />
                    ) : (
                      <UserX className="h-3.5 w-3.5" />
                    )}
                    <span>Status</span>
                  </div>
                  {landlord.status === "ACTIVE" ? (
                    <Badge className="ml-6 bg-green-50 text-green-700 border border-green-100 dark:bg-green-950 dark:text-green-300">
                      <UserCheck className="mr-1 h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-6 bg-gray-50 text-gray-700 border border-gray-100 dark:bg-gray-950 dark:text-gray-300">
                      <UserX className="mr-1 h-3 w-3" />
                      Inactive
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
