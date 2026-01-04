"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  Download,
  Home,
  MapPin,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  TrendingUp,
  DollarSign,
  Building2,
  Image as ImageIcon,
  X,
  CheckCircle,
  Star,
} from "lucide-react"
import { getProperties, getPropertiesForUser } from "@/services/properties.service"
import { deleteProperty } from "@/services/properties.service"

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
  createdAt?: string
  images?: { url: string }[]
}

type SortField = "title" | "price" | "status" | "createdAt" | "city"
type SortDirection = "asc" | "desc"

export function PropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getPropertiesForUser()
        setProperties(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load properties")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProperties(new Set(paginatedProperties.map((p) => p.id)))
    } else {
      setSelectedProperties(new Set())
    }
  }

  const handleSelectProperty = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedProperties)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedProperties(newSelected)
  }

  const handleDeleteClick = (id: string) => {
    setPropertyToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return
    try {
      setDeletingId(propertyToDelete)
      await deleteProperty(propertyToDelete)
      setProperties((prev) => prev.filter((prop) => prop.id !== propertyToDelete))
      setSelectedProperties((prev) => {
        const newSet = new Set(prev)
        newSet.delete(propertyToDelete)
        return newSet
      })
      setDeleteDialogOpen(false)
      setPropertyToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete property")
    } finally {
      setDeletingId(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProperties.size === 0) return
    const confirm = window.confirm(`Delete ${selectedProperties.size} selected properties?`)
    if (!confirm) return

    try {
      const deletePromises = Array.from(selectedProperties).map((id) => deleteProperty(id))
      await Promise.all(deletePromises)
      setProperties((prev) => prev.filter((prop) => !selectedProperties.has(prop.id)))
      setSelectedProperties(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete properties")
    }
  }

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["ID", "Title", "Type", "Status", "Price", "Currency", "City", "Country", "Address"].join(","),
        ...filteredAndSortedProperties.map((p) =>
          [
            p.id,
            `"${p.title}"`,
            p.property_type,
            p.status,
            p.price,
            p.currency,
            `"${p.city}"`,
            `"${p.country}"`,
            `"${p.address}"`,
          ].join(",")
        ),
      ].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `properties-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const statusTone = (status: string) => {
    const tones: Record<string, string> = {
      FOR_RENT: "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950 dark:text-amber-300",
      FOR_SALE: "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
      RENTED: "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950 dark:text-blue-300",
      SOLD: "bg-gray-200 text-gray-800 border border-gray-300 dark:bg-gray-800 dark:text-gray-300",
    }
    return tones[status] ?? "bg-muted text-foreground"
  }

  const propertyCode = (id: string) => `PROP-${id.slice(0, 6).toUpperCase()}`

  const typeOptions = ["All", "APARTMENT", "HOUSE", "STUDIO", "OFFICE", "LAND"]
  const statusOptions = ["All", "FOR_RENT", "FOR_SALE", "RENTED", "SOLD"]

  const formatPrice = (price: number | string, currency: string, frequency?: string) => {
    const amount = Number(price) || 0
    const formatted = amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    return `${currency} ${formatted}${frequency ? ` / ${frequency.toLowerCase()}` : ""}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const allSelected = paginatedProperties.length > 0 && paginatedProperties.every((p) => selectedProperties.has(p.id))
  const someSelected = paginatedProperties.some((p) => selectedProperties.has(p.id))

  return (
    <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Properties</h1>
          <p className="text-xs text-muted-foreground">Manage your property portfolio</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {selectedProperties.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedProperties.size})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredAndSortedProperties.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => router.push("/properties/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Total Properties</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
            <Building2 className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-gray-900">{stats.total}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">All properties</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">For Rent</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
            <Home className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-gray-900">{stats.forRent}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Available for rent</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">For Sale</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
            <TrendingUp className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-gray-900">{stats.forSale}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Available for sale</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Rented</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
            <Home className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-gray-900">{stats.rented}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Currently rented</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Sold</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <CheckCircle className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-gray-900">{stats.sold}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Properties sold</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Featured</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <Star className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-gray-900">{stats.featured}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Featured properties</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Total Value</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <DollarSign className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalValue)}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Portfolio value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Properties</CardTitle>
              <CardDescription>
                {filteredAndSortedProperties.length} of {properties.length} properties
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search properties..."
                  className="pl-9"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[300px]" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                  <p className="text-sm font-medium text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : filteredAndSortedProperties.length === 0 ? (
              <div className="p-12">
                <Empty>
                  <EmptyHeader>
                    <Home className="h-12 w-12 text-muted-foreground" />
                    <EmptyTitle>No properties found</EmptyTitle>
                    <EmptyDescription>
                      {searchTerm || typeFilter !== "All" || statusFilter !== "All"
                        ? "Try adjusting your filters or search terms."
                        : "Get started by adding your first property."}
                    </EmptyDescription>
                  </EmptyHeader>
                  {(!searchTerm && typeFilter === "All" && statusFilter === "All") && (
                    <Button onClick={() => router.push("/properties/new")} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Property
                    </Button>
                  )}
                </Empty>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all properties"
                      />
                    </TableHead>
                    <TableHead className="w-20">Image</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3 data-[state=open]:bg-accent"
                        onClick={() => handleSort("title")}
                      >
                        Property
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3 data-[state=open]:bg-accent"
                        onClick={() => handleSort("price")}
                      >
                        Price
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 -ml-3 data-[state=open]:bg-accent"
                        onClick={() => handleSort("status")}
                      >
                        Status
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProperties.map((property) => (
                    <TableRow key={property.id} className="hover:bg-muted/40">
                      <TableCell>
                        <Checkbox
                          checked={selectedProperties.has(property.id)}
                          onCheckedChange={(checked) => handleSelectProperty(property.id, checked as boolean)}
                          aria-label={`Select ${property.title}`}
                        />
                      </TableCell>
                      <TableCell>
                        {property.images && property.images.length > 0 ? (
                          <div className="h-12 w-12 overflow-hidden rounded-lg border">
                            <img
                              src={property.images[0].url}
                              alt={property.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold text-foreground">{property.title}</div>
                          <div className="text-xs text-muted-foreground">{propertyCode(property.id)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="max-w-[200px] truncate">
                            {property.address ? `${property.address}, ` : ""}
                            {property.city}, {property.country}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {property.property_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatPrice(property.price, property.currency, property.payment_frequency)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusTone(property.status)}>{property.status.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        {property.is_featured ? (
                          <Badge className="bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-950 dark:text-orange-300">
                            Featured
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => router.push(`/properties/${property.id}`)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => router.push(`/properties/${property.id}/edit`)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            disabled={deletingId === property.id}
                            onClick={() => handleDeleteClick(property.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && !error && filteredAndSortedProperties.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedProperties.length)} of{" "}
            {filteredAndSortedProperties.length} properties
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deletingId !== null}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deletingId !== null}>
              {deletingId ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
