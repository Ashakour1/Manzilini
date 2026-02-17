"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus, Search, Mail, Phone, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import { getTenants, type Tenant } from "@/services/tenants.service"
import { getLandlordIdFromProperties } from "@/services/landlords.service"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty } from "@/components/ui/empty"

function getStatusStyle(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "NEW":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "INACTIVE":
      return "bg-gray-50 text-gray-700 border-gray-200"
    case "BLOCKED":
      return "bg-red-50 text-red-700 border-red-200"
    default:
      return "bg-gray-100 text-gray-600 border-gray-200"
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Active"
    case "NEW":
      return "New"
    case "INACTIVE":
      return "Inactive"
    case "BLOCKED":
      return "Blocked"
    default:
      return status
  }
}

export default function TenantsPage() {
  const router = useRouter()
  const { user, isLoggedIn } = useAuthStore()
  const { toast } = useToast()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [landlordId, setLandlordId] = useState<string | null>(null)
  const [isLoadingLandlordId, setIsLoadingLandlordId] = useState(true)

  // Fetch landlord ID first
  useEffect(() => {
    const fetchLandlordId = async () => {
      if (!isLoggedIn || !user?.token) return
      setIsLoadingLandlordId(true)
      try {
        const id = await getLandlordIdFromProperties(user.token)
        setLandlordId(id)
      } catch (err) {
        console.error("Failed to get landlord ID:", err)
        setError("Unable to load your landlord profile")
      } finally {
        setIsLoadingLandlordId(false)
      }
    }
    fetchLandlordId()
  }, [isLoggedIn, user?.token])

  const fetchTenants = useCallback(async () => {
    if (!isLoggedIn || !user?.token || !landlordId) return
    setIsLoading(true)
    setError(null)

    try {
      const status = statusFilter === "all" ? undefined : statusFilter
      const search = searchQuery.trim() || undefined
      const data = await getTenants(user.token, status, search, landlordId)
      setTenants(data)
    } catch (err: any) {
      setError(err.message || "Failed to load tenants")
      toast({
        title: "Error",
        description: err.message || "Failed to load tenants",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, user?.token, landlordId, statusFilter, searchQuery, toast])

  useEffect(() => {
    fetchTenants()
  }, [fetchTenants])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTenants()
  }

  if (!isLoggedIn) {
    router.push("/")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your tenant information</p>
          </div>
          <Link href="/landlords/tenants/create">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </form>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-sm text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {(isLoading || isLoadingLandlordId) && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-4" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && tenants.length === 0 && (
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-12">
              <Empty
                icon={Users}
                title="No tenants found"
                description={
                  searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first tenant"
                }
              />
            </CardContent>
          </Card>
        )}

        {/* Tenants Grid */}
        {!isLoading && tenants.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tenants.map((tenant) => (
              <Card
                key={tenant.id}
                className="border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold text-gray-900">
                        {tenant.fullName}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${getStatusStyle(tenant.status)}`}
                        >
                          {getStatusLabel(tenant.status)}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    {tenant.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{tenant.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{tenant.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span>
                        {tenant._count?.applications || tenant.applicationsCount || 0} application
                        {(tenant._count?.applications || tenant.applicationsCount || 0) !== 1
                          ? "s"
                          : ""}
                      </span>
                    </div>
                    {tenant.lastActivityAt && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-xs">
                          {new Date(tenant.lastActivityAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
