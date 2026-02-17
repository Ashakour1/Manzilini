"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  Trash2,
  Mail,
  Phone,
  Building2,
  Calendar,
  MessageSquare,
  User,
  ShieldCheck,
  EyeOff,
} from "lucide-react"
import {
  getPropertyApplications,
  updatePropertyApplication,
  deletePropertyApplication,
  type PropertyApplication,
} from "@/services/property-applications.service"
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
import { Label } from "@/components/ui/label"

type SortField = "fullName" | "property" | "status" | "createdAt"
type SortDirection = "asc" | "desc"

export function PropertyApplicationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [applications, setApplications] = useState<PropertyApplication[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedApplication, setSelectedApplication] = useState<PropertyApplication | null>(null)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [hidingId, setHidingId] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState<string>("")
  const [updateRemarks, setUpdateRemarks] = useState<string>("")
  const [updateEmailSent, setUpdateEmailSent] = useState<boolean>(false)
  const [updateIsCommunicated, setUpdateIsCommunicated] = useState<boolean>(false)
  const [updateViewingRequested, setUpdateViewingRequested] = useState<boolean>(false)
  const [updateViewingDate, setUpdateViewingDate] = useState<string>("")
  const [updateIsApproved, setUpdateIsApproved] = useState<boolean>(false)
  const [updateAdminApprovalStatus, setUpdateAdminApprovalStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING")
  const itemsPerPage = 10

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getPropertyApplications()
        setApplications(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load property applications")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  // Statistics
  const stats = useMemo(() => {
    const total = applications.length
    const pending = applications.filter((a) => a.status === "PENDING").length
    const approved = applications.filter((a) => a.status === "APPROVED").length
    const rejected = applications.filter((a) => a.status === "REJECTED").length
    const contacted = applications.filter((a) => a.status === "CONTACTED").length
    const closed = applications.filter((a) => a.status === "CLOSED").length

    return { total, pending, approved, rejected, contacted, closed }
  }, [applications])

  // Filtered and sorted applications
  const filteredAndSortedApplications = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    let filtered = applications.filter((application) => {
      const fullName = application.fullName?.toLowerCase() ?? ""
      const email = application.email?.toLowerCase() ?? ""
      const phone = application.phone?.toLowerCase() ?? ""
      const propertyTitle = application.property?.title?.toLowerCase() ?? ""

      const matchesSearch =
        !term ||
        fullName.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        propertyTitle.includes(term)
      const matchesStatus = statusFilter === "All" || application.status === statusFilter

      return matchesSearch && matchesStatus
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
        case "property":
          aValue = a.property?.title?.toLowerCase() ?? ""
          bValue = b.property?.title?.toLowerCase() ?? ""
          break
        case "status":
          aValue = a.status ?? ""
          bValue = b.status ?? ""
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
  }, [applications, searchTerm, statusFilter, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedApplications.length / itemsPerPage)
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSortedApplications.slice(start, start + itemsPerPage)
  }, [filteredAndSortedApplications, currentPage])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleView = (application: PropertyApplication) => {
    router.push(`/property-applications/${application.id}`)
  }

  const handleUpdateClick = (application: PropertyApplication) => {
    setSelectedApplication(application)
    setUpdateStatus(application.status)
    setUpdateRemarks(application.remarks || "")
    setUpdateEmailSent(application.emailSent || false)
    setUpdateIsCommunicated(application.isCommunicated || false)
    setUpdateViewingRequested(application.viewingRequested || false)
    setUpdateViewingDate(application.viewingDate ? new Date(application.viewingDate).toISOString().split('T')[0] : "")
    setUpdateIsApproved(application.isApproved || false)
    setUpdateAdminApprovalStatus(application.adminApprovalStatus || "PENDING")
    setUpdateDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedApplication || !updateStatus) return

    setUpdatingId(selectedApplication.id)
    try {
      const updated = await updatePropertyApplication(
        selectedApplication.id,
        updateStatus,
        updateRemarks || undefined,
        updateEmailSent,
        updateEmailSent ? new Date().toISOString() : undefined,
        updateIsCommunicated,
        updateIsCommunicated ? new Date().toISOString() : undefined,
        updateViewingRequested,
        updateViewingDate || undefined,
        updateIsApproved,
        updateAdminApprovalStatus
      )
      setApplications((prev) =>
        prev.map((app) => (app.id === updated.id ? updated : app))
      )
      setUpdateDialogOpen(false)
      toast({
        title: "Success",
        description: "Application updated successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update application",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteClick = (id: string) => {
    setApplicationToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!applicationToDelete) return

    try {
      await deletePropertyApplication(applicationToDelete)
      setApplications((prev) => prev.filter((app) => app.id !== applicationToDelete))
      setDeleteDialogOpen(false)
      toast({
        title: "Success",
        description: "Application deleted successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete application",
        variant: "destructive",
      })
    } finally {
      setApplicationToDelete(null)
    }
  }

  const handleApproveForLandlord = async (applicationId: string) => {
    setApprovingId(applicationId)
    try {
      const updated = await updatePropertyApplication(
        applicationId,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined, // isApproved (legacy)
        "APPROVED" // adminApprovalStatus = APPROVED
      )
      setApplications((prev) =>
        prev.map((app) => (app.id === updated.id ? updated : app))
      )
      toast({
        title: "Success",
        description: "Application approved! Landlord can now see this application.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to approve application",
        variant: "destructive",
      })
    } finally {
      setApprovingId(null)
    }
  }

  const handleHideFromLandlord = async (applicationId: string) => {
    setHidingId(applicationId)
    try {
      const updated = await updatePropertyApplication(
        applicationId,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined, // isApproved (legacy)
        "REJECTED" // adminApprovalStatus = REJECTED (hide from landlord)
      )
      setApplications((prev) =>
        prev.map((app) => (app.id === updated.id ? updated : app))
      )
      toast({
        title: "Success",
        description: "Application hidden from landlord.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to hide application",
        variant: "destructive",
      })
    } finally {
      setHidingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "CONTACTED":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <MessageSquare className="w-3 h-3 mr-1" />
            Contacted
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      case "CLOSED":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <XCircle className="w-3 h-3 mr-1" />
            Closed
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
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
            Property Applications
          </h1>
          <p className="text-xs text-gray-600">Manage property inquiries and applications</p>
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
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Pending</CardTitle>
              <Clock className="h-3.5 w-3.5 text-yellow-600" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold text-foreground">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Approved</CardTitle>
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold text-foreground">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Rejected</CardTitle>
              <XCircle className="h-3.5 w-3.5 text-red-600" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold text-foreground">{stats.rejected}</div>
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
                  placeholder="Search by name, email, phone, or property..."
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
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONTACTED">Contacted</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card className="border-border/50 shadow-none">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : paginatedApplications.length === 0 ? (
              <Empty className="py-12">
                <EmptyHeader>
                  <EmptyTitle>No applications found</EmptyTitle>
                  <EmptyDescription>
                    {searchTerm || statusFilter !== "All"
                      ? "Try adjusting your filters"
                      : "Property applications will appear here"}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <button
                          onClick={() => handleSort("createdAt")}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          Date
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort("fullName")}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          Applicant
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort("property")}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          Property
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort("status")}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          Status
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            {new Date(application.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{application.fullName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <div className="font-medium truncate">
                              {application.property?.title || "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {application.property?.city || ""}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {application.email && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {application.email}
                              </div>
                            )}
                          
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                           
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {application.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(application.status)}
                            {application.adminApprovalStatus === 'APPROVED' ? (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] w-fit">
                                <ShieldCheck className="w-2.5 h-2.5 mr-1" />
                                Admin Approved
                              </Badge>
                            ) : application.adminApprovalStatus === 'REJECTED' ? (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] w-fit">
                                <XCircle className="w-2.5 h-2.5 mr-1" />
                                Admin Rejected
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] w-fit">
                                <Clock className="w-2.5 h-2.5 mr-1" />
                                Pending Admin Approval
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(application)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {application.adminApprovalStatus !== 'APPROVED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproveForLandlord(application.id)}
                                disabled={approvingId === application.id || hidingId === application.id}
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                title="Approve for Landlord"
                              >
                                {approvingId === application.id ? (
                                  <Clock className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ShieldCheck className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            {application.adminApprovalStatus !== 'REJECTED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleHideFromLandlord(application.id)}
                                disabled={hidingId === application.id || approvingId === application.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Hide from Landlord"
                              >
                                {hidingId === application.id ? (
                                  <Clock className="h-4 w-4 animate-spin" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateClick(application)}
                              title="Update Status"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(application.id)}
                              title="Delete"
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


      {/* Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>Change the status and add remarks for this application</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={updateStatus} onValueChange={setUpdateStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONTACTED">Contacted</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Remarks (Optional)</label>
              <Textarea
                value={updateRemarks}
                onChange={(e) => setUpdateRemarks(e.target.value)}
                placeholder="Add any remarks or notes..."
                rows={4}
              />
            </div>
            <div className="space-y-4 border-t pt-4">
              <div className="text-sm font-medium">Admin Approval Status</div>
              <div>
                <Label htmlFor="adminApprovalStatus" className="text-xs text-gray-600 mb-1.5 block">
                  Approval Status for Landlord Visibility
                </Label>
                <Select
                  value={updateAdminApprovalStatus}
                  onValueChange={(value: "PENDING" | "APPROVED" | "REJECTED") => setUpdateAdminApprovalStatus(value)}
                >
                  <SelectTrigger id="adminApprovalStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending - Not visible to landlord</SelectItem>
                    <SelectItem value="APPROVED">Approved - Visible to landlord</SelectItem>
                    <SelectItem value="REJECTED">Rejected - Not visible to landlord</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 mt-1">
                  This controls whether the landlord can see this application
                </p>
              </div>
            </div>
            <div className="space-y-4 border-t pt-4">
              <div className="text-sm font-medium">Communication Tracking</div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailSent"
                  checked={updateEmailSent}
                  onChange={(e) => setUpdateEmailSent(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="emailSent" className="text-sm font-medium">
                  Email Sent
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isCommunicated"
                  checked={updateIsCommunicated}
                  onChange={(e) => setUpdateIsCommunicated(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="isCommunicated" className="text-sm font-medium">
                  Is Communicated
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="viewingRequested"
                  checked={updateViewingRequested}
                  onChange={(e) => setUpdateViewingRequested(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="viewingRequested" className="text-sm font-medium">
                  Viewing Requested
                </label>
              </div>
              {updateViewingRequested && (
                <div>
                  <label className="text-sm font-medium">Viewing Date</label>
                  <Input
                    type="datetime-local"
                    value={updateViewingDate}
                    onChange={(e) => setUpdateViewingDate(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updatingId !== null}>
              {updatingId ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the application.
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
