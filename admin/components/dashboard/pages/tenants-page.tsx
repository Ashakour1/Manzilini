"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  Users,
  Mail,
  Phone,
  User,
  Clock,
  Building2,
  Activity,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  MessageSquare,
  ArrowRight,
} from "lucide-react"
import { getTenants, getTenantById, getTenantActivities, createTenant, updateTenant, deleteTenant, type Tenant, type TenantActivity } from "@/services/tenants.service"
import { useToast } from "@/components/ui/use-toast"
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

type SortField = "fullName" | "email" | "createdAt"
type SortDirection = "asc" | "desc"

export function TenantsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [tenantActivities, setTenantActivities] = useState<TenantActivity[]>([])
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "NEW" as "NEW" | "ACTIVE" | "INACTIVE" | "BLOCKED"
  })

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getTenants(statusFilter !== "All" ? statusFilter : undefined, searchTerm || undefined)
      setTenants(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tenants")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load tenants",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== "" || statusFilter !== "All") {
        loadTenants()
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter])

  // Statistics
  const stats = useMemo(() => {
    const total = tenants.length
    const newTenants = tenants.filter((t) => t.status === "NEW").length
    const active = tenants.filter((t) => t.status === "ACTIVE").length
    const totalApplications = tenants.reduce((sum, t) => sum + (t.applicationsCount || 0), 0)

    return { total, newTenants, active, totalApplications }
  }, [tenants])

  // Filtered and sorted tenants
  const filteredAndSortedTenants = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    let filtered = tenants.filter((tenant) => {
      const name = tenant.fullName?.toLowerCase() ?? ""
      const email = tenant.email?.toLowerCase() ?? ""
      const phone = tenant.phone?.toLowerCase() ?? ""

      const matchesSearch =
        !term ||
        name.includes(term) ||
        email.includes(term) ||
        phone.includes(term)
      return matchesSearch
    })

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "fullName":
          aValue = a.fullName?.toLowerCase() ?? ""
          bValue = b.fullName?.toLowerCase() ?? ""
          break
        case "email":
          aValue = a.email?.toLowerCase() ?? ""
          bValue = b.email?.toLowerCase() ?? ""
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
  }, [tenants, searchTerm, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTenants.length / itemsPerPage)
  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSortedTenants.slice(start, start + itemsPerPage)
  }, [filteredAndSortedTenants, currentPage])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleCreate = async () => {
    if (!formData.fullName || !formData.phone) {
      toast({
        title: "Error",
        description: "Full name and phone are required",
        variant: "destructive",
      })
      return
    }

    try {
      await createTenant(formData.fullName, formData.phone, formData.email || undefined, formData.status)
      await loadTenants()
      setCreateDialogOpen(false)
      setFormData({ fullName: "", email: "", phone: "", status: "NEW" })
      toast({
        title: "Success",
        description: "Tenant created successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create tenant",
        variant: "destructive",
      })
    }
  }

  const handleView = async (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setViewDialogOpen(true)
    setLoadingActivities(true)
    try {
      const activities = await getTenantActivities(tenant.id, 50)
      setTenantActivities(activities || [])
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load tenant activities",
        variant: "destructive",
      })
    } finally {
      setLoadingActivities(false)
    }
  }

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setFormData({
      fullName: tenant.fullName,
      email: tenant.email || "",
      phone: tenant.phone,
      status: tenant.status
    })
    setEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedTenant || !formData.fullName || !formData.phone) {
      toast({
        title: "Error",
        description: "Full name and phone are required",
        variant: "destructive",
      })
      return
    }

    try {
      await updateTenant(selectedTenant.id, formData)
      await loadTenants()
      setEditDialogOpen(false)
      setSelectedTenant(null)
      toast({
        title: "Success",
        description: "Tenant updated successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update tenant",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (id: string) => {
    setTenantToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!tenantToDelete) return

    setDeletingId(tenantToDelete)
    try {
      await deleteTenant(tenantToDelete)
      await loadTenants()
      setDeleteDialogOpen(false)
      setTenantToDelete(null)
      toast({
        title: "Success",
        description: "Tenant deleted successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete tenant",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            New
          </Badge>
        )
      case "ACTIVE":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <User className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case "INACTIVE":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Inactive
          </Badge>
        )
      case "BLOCKED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Blocked
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      <div className="space-y-4 p-3 sm:p-4 lg:p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
              Tenants
            </h1>
            <p className="text-xs text-gray-600">Manage tenant records and applications</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tenant
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Total</CardTitle>
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground">New</CardTitle>
              <Clock className="h-3.5 w-3.5 text-blue-600" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold text-foreground">{stats.newTenants}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Active</CardTitle>
              <User className="h-3.5 w-3.5 text-green-600" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold text-foreground">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Applications</CardTitle>
              <Building2 className="h-3.5 w-3.5 text-purple-600" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold text-foreground">{stats.totalApplications}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-border/50 shadow-none">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tenants Table */}
        <Card className="border-border/50 shadow-none">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : paginatedTenants.length === 0 ? (
              <Empty className="py-12">
                <EmptyHeader>
                  <EmptyTitle>No tenants found</EmptyTitle>
                  <EmptyDescription>
                    {searchTerm || statusFilter !== "All"
                      ? "Try adjusting your filters"
                      : "Get started by creating a new tenant"}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button
                          onClick={() => handleSort("fullName")}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          Name
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort("createdAt")}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          Created
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applications</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell>
                          <div className="font-medium">{tenant.fullName}</div>
                        </TableCell>
                        <TableCell>
                          {tenant.email ? (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {tenant.email}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {tenant.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            {new Date(tenant.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tenant.applicationsCount || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          {tenant.lastActivityAt ? (
                            <div className="text-xs text-muted-foreground">
                              {new Date(tenant.lastActivityAt).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(tenant)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(tenant)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(tenant.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Tenant</DialogTitle>
            <DialogDescription>Add a new tenant to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Tenant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>Update tenant information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-fullName">Full Name *</Label>
              <Input
                id="edit-fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Tenant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Tenant Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tenant Details</DialogTitle>
            <DialogDescription>View tenant information and activity history</DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-6">
              {/* Tenant Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tenant Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Full Name</Label>
                      <p className="text-sm font-medium mt-1">{selectedTenant.fullName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <div className="mt-1">{getStatusBadge(selectedTenant.status)}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        {selectedTenant.email ? (
                          <>
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {selectedTenant.email}
                          </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {selectedTenant.phone}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Applications Count</Label>
                      <p className="text-sm font-medium mt-1 flex items-center gap-2">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        {selectedTenant.applicationsCount || 0}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Last Activity</Label>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        {selectedTenant.lastActivityAt ? (
                          <>
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {new Date(selectedTenant.lastActivityAt).toLocaleString()}
                          </>
                        ) : (
                          <span className="text-muted-foreground">No activity</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Created At</Label>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(selectedTenant.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Updated At</Label>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(selectedTenant.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Applications */}
              {selectedTenant.applications && selectedTenant.applications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Applications</CardTitle>
                    <CardDescription>Latest property applications from this tenant</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedTenant.applications.slice(0, 5).map((app) => (
                        <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{app.property?.title || "N/A"}</p>
                            <p className="text-xs text-muted-foreground">{app.property?.city || ""}</p>
                          </div>
                          <Badge variant="outline">{app.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Activity History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activity History
                  </CardTitle>
                  <CardDescription>All activities and events for this tenant</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingActivities ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : tenantActivities.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No activities found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tenantActivities.map((activity) => {
                        const getActivityIcon = () => {
                          switch (activity.type) {
                            case "APPLICATION_SENT":
                              return <FileText className="h-4 w-4 text-blue-500" />
                            case "CONTACTED":
                              return <MessageSquare className="h-4 w-4 text-green-500" />
                            case "APPROVED":
                              return <CheckCircle className="h-4 w-4 text-green-600" />
                            case "REJECTED":
                              return <XCircle className="h-4 w-4 text-red-500" />
                            case "VIEWING_REQUESTED":
                              return <Calendar className="h-4 w-4 text-purple-500" />
                            case "STATUS_CHANGED":
                              return <ArrowRight className="h-4 w-4 text-orange-500" />
                            default:
                              return <Activity className="h-4 w-4 text-gray-500" />
                          }
                        }

                        const getActivityLabel = () => {
                          switch (activity.type) {
                            case "APPLICATION_SENT":
                              return "Application Sent"
                            case "CONTACTED":
                              return "Contacted"
                            case "APPROVED":
                              return "Approved"
                            case "REJECTED":
                              return "Rejected"
                            case "VIEWING_REQUESTED":
                              return "Viewing Requested"
                            case "STATUS_CHANGED":
                              return "Status Changed"
                            default:
                              return activity.type
                          }
                        }

                        return (
                          <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="mt-0.5">{getActivityIcon()}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium">{getActivityLabel()}</p>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(activity.createdAt).toLocaleString()}
                                </span>
                              </div>
                              {activity.description && (
                                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                              )}
                              {activity.application?.property && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                  <Building2 className="h-3 w-3" />
                                  <span>{activity.application.property.title}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedTenant && (
              <Button onClick={() => {
                setViewDialogOpen(false)
                handleEdit(selectedTenant)
              }}>
                Edit Tenant
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tenant and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
