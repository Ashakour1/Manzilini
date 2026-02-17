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
import { useToast } from "@/components/ui/use-toast"

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

  const fetchTenants = useCallback(async () => {
    if (!isLoggedIn || !user?.token) return
    setIsLoading(true)
    setError(null)

    try {
      const status = statusFilter === "all" ? undefined : statusFilter
      const search = searchQuery.trim() || undefined
      // landlordId is optional - backend will automatically filter by user's landlord profile
      const data = await getTenants(user.token, status, search)
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
  }, [isLoggedIn, user?.token, statusFilter, searchQuery, toast])

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

  const hasTenants = tenants && tenants.length > 0

  return (
    <div className="p-5 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Tenants
          </h1>
          <p className="text-sm text-gray-500">
            Manage your tenant information
          </p>
        </div>
        <Button
          onClick={() => router.push("/landlords/tenants/create")}
          className="bg-[#2a6f97] hover:bg-[#235d7f] text-white shadow-sm text-xs gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Tenant
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-gray-200/80 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Search & Filter</CardTitle>
          <CardDescription className="text-xs">
            Find tenants by name, email, or phone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
            </form>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] text-sm">
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

      <Card className="border-gray-200/80 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Tenants</CardTitle>
          <CardDescription className="text-xs">
            {hasTenants
              ? `${tenants.length} tenant${tenants.length !== 1 ? "s" : ""}`
              : "Your tenants will appear here"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="py-8 text-center text-gray-400 text-sm">
              Loading your tenants...
            </div>
          )}

          {!isLoading && error && (
            <div className="py-8 text-center text-red-500 text-sm">
              {error}
            </div>
          )}

          {!isLoading && !error && !hasTenants && (
            <div className="text-center py-12 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500 mb-1">No tenants yet</p>
              <p className="text-xs text-gray-400">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start by adding your first tenant"}
              </p>
            </div>
          )}

          {!isLoading && !error && hasTenants && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="group rounded-xl border border-gray-200/80 overflow-hidden hover:shadow-md hover:border-gray-300/80 transition-all duration-200 bg-white"
                >
                  <div className="p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1">
                        {tenant.fullName}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold capitalize ml-2 ${getStatusStyle(tenant.status)}`}
                      >
                        {getStatusLabel(tenant.status)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1.5 text-xs text-gray-600">
                      {tenant.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{tenant.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span>{tenant.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span>
                          {tenant._count?.applications || tenant.applicationsCount || 0} application
                          {(tenant._count?.applications || tenant.applicationsCount || 0) !== 1
                            ? "s"
                            : ""}
                        </span>
                      </div>
                      {tenant.lastActivityAt && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span>
                            {new Date(tenant.lastActivityAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
