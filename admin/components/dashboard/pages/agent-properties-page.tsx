"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  Home,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowUpDown,
  Building2,
  Image as ImageIcon,
  Users,
  Plus,
  Globe,
  EyeOff,
} from "lucide-react"
import { getPropertiesForAgent } from "@/services/properties.service"
import { useToast } from "@/components/ui/use-toast"

type Property = {
  id: string
  title: string
  address: string
  city: string
  country: string
  property_type: string
  status: string
  price: number | string
  currency: string
  payment_frequency?: string
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
  }
}

type SortField = "title" | "price" | "status" | "createdAt" | "city"
type SortDirection = "asc" | "desc"

export function AgentPropertiesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getPropertiesForAgent()
        setProperties(data || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load properties"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [toast])

  // Statistics
  const stats = useMemo(() => {
    const total = properties.length
    const forRent = properties.filter((p) => p.status === "FOR_RENT").length
    const forSale = properties.filter((p) => p.status === "FOR_SALE").length
    const rented = properties.filter((p) => p.status === "RENTED").length
    const sold = properties.filter((p) => p.status === "SOLD").length
    const featured = properties.filter((p) => p.is_featured).length
    const totalValue = properties.reduce((sum, p) => sum + (Number(p.price) || 0), 0)

    return { total, forRent, forSale, rented, sold, featured, totalValue }
  }, [properties])

  // Filtered and sorted properties
  const filteredAndSortedProperties = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    let filtered = properties.filter((property) => {
      const title = property.title?.toLowerCase() ?? ""
      const address = property.address?.toLowerCase() ?? ""
      const city = property.city?.toLowerCase() ?? ""
      const country = property.country?.toLowerCase() ?? ""

      const matchesSearch =
        !term || title.includes(term) || address.includes(term) || city.includes(term) || country.includes(term)
      const matchesType = typeFilter === "All" || property.property_type === typeFilter
      const matchesStatus = statusFilter === "All" || property.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "title":
          aValue = a.title?.toLowerCase() ?? ""
          bValue = b.title?.toLowerCase() ?? ""
          break
        case "price":
          aValue = Number(a.price) || 0
          bValue = Number(b.price) || 0
          break
        case "status":
          aValue = a.status ?? ""
          bValue = b.status ?? ""
          break
        case "city":
          aValue = a.city?.toLowerCase() ?? ""
          bValue = b.city?.toLowerCase() ?? ""
          break
        case "createdAt":
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [properties, searchTerm, statusFilter, typeFilter, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProperties.length / itemsPerPage)
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSortedProperties.slice(start, start + itemsPerPage)
  }, [filteredAndSortedProperties, currentPage])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
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

  const propertyTypes = useMemo(() => {
    const types = new Set(properties.map((p) => p.property_type))
    return Array.from(types).sort()
  }, [properties])

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Properties</h1>
          <p className="text-xs text-muted-foreground">Properties assigned to you</p>
        </div>
        <Button onClick={() => router.push("/agent/properties/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Properties</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <Building2 className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground">{stats.total}</div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Assigned properties</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground">For Rent</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <Home className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground">{stats.forRent}</div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Available for rent</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Rented</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <Users className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground">{stats.rented}</div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Currently rented</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Value</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <MapPin className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground">${stats.totalValue.toLocaleString()}</div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Portfolio value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Properties</CardTitle>
              <CardDescription className="mt-1">View and manage assigned properties</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, address, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 pl-10 transition-all focus:border-[#2a6f97] focus:ring-[#2a6f97]"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-10 w-[150px]">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="FOR_RENT">For Rent</SelectItem>
                <SelectItem value="FOR_SALE">For Sale</SelectItem>
                <SelectItem value="RENTED">Rented</SelectItem>
                <SelectItem value="SOLD">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="py-8 text-center text-sm text-destructive">{error}</div>
          ) : paginatedProperties.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No properties found</EmptyTitle>
                <EmptyDescription>
                  {searchTerm || typeFilter !== "All" || statusFilter !== "All"
                    ? "Try adjusting your filters"
                    : "You don't have any properties assigned yet"}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 bg-muted/30 hover:bg-muted/30">
                      <TableHead className="h-12 font-semibold text-foreground">ID</TableHead>
                      <TableHead className="h-12 font-semibold text-foreground">
                        <button
                          className="flex items-center gap-2 transition-colors hover:text-[#2a6f97]"
                          onClick={() => handleSort("title")}
                        >
                          Property
                          <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "title" ? "text-[#2a6f97]" : "text-muted-foreground"}`} />
                        </button>
                      </TableHead>
                      <TableHead className="h-12 font-semibold text-foreground">Location</TableHead>
                      <TableHead className="h-12 font-semibold text-foreground">Type</TableHead>
                      <TableHead className="h-12 font-semibold text-foreground">
                        <button
                          className="flex items-center gap-2 transition-colors hover:text-[#2a6f97]"
                          onClick={() => handleSort("price")}
                        >
                          Price
                          <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "price" ? "text-[#2a6f97]" : "text-muted-foreground"}`} />
                        </button>
                      </TableHead>
                      <TableHead className="h-12 font-semibold text-foreground">
                        <button
                          className="flex items-center gap-2 transition-colors hover:text-[#2a6f97]"
                          onClick={() => handleSort("status")}
                        >
                          Status
                          <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "status" ? "text-[#2a6f97]" : "text-muted-foreground"}`} />
                        </button>
                      </TableHead>
                      <TableHead className="h-12 font-semibold text-foreground">Owner</TableHead>
                      <TableHead className="h-12 font-semibold text-foreground">Publication Status</TableHead>
                      <TableHead className="h-12 text-right font-semibold text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProperties.map((property) => (
                      <TableRow 
                        key={property.id}
                        className="border-b border-border/30 transition-colors hover:bg-muted/20"
                      >
                        <TableCell className="py-4">
                          <div className="font-mono text-xs text-muted-foreground">{property.id}</div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            {property.images && property.images.length > 0 ? (
                              <img 
                                src={property.images[0].url} 
                                alt={property.title}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-foreground">{property.title}</div>
                              {property.is_featured && (
                                <Badge variant="outline" className="mt-1 text-[10px]">Featured</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm">
                            <div className="font-medium text-foreground">{property.city}, {property.country}</div>
                            <div className="text-xs text-muted-foreground">{property.address}</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant="outline">{property.property_type}</Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm font-medium text-foreground">
                            {property.currency} {Number(property.price).toLocaleString()}
                          </div>
                          {property.payment_frequency && (
                            <div className="text-xs text-muted-foreground">/{property.payment_frequency.toLowerCase()}</div>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          {getStatusBadge(property.status)}
                        </TableCell>
                        <TableCell className="py-4">
                          {property.user ? (
                            <div className="text-sm">
                              <div className="font-medium text-foreground">{property.user.name}</div>
                              <div className="text-xs text-muted-foreground">{property.user.email}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
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
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/agent/properties/${property.id}`)}
                              className="h-8 w-8 rounded-md transition-colors hover:bg-muted"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-medium text-foreground">
                      {Math.min(currentPage * itemsPerPage, filteredAndSortedProperties.length)}
                    </span>{" "}
                    of <span className="font-medium text-foreground">{filteredAndSortedProperties.length}</span> properties
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-9 px-4 transition-colors"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-9 px-4 transition-colors"
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
