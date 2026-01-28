"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Building2,
  CheckCircle2,
  UserCheck,
  UserX,
  Clock,
  Send,
  User,
} from "lucide-react"
import { getLandlords, deleteLandlord, verifyLandlord, updateLandlordStatus } from "@/services/landlords.service"
import { useToast } from "@/components/ui/use-toast"

type Landlord = {
  id: string
  name: string
  email: string
  phone?: string
  company_name?: string
  address?: string
  nationality?: string
  gender?: "MALE" | "FEMALE" | "OTHER"
  isVerified?: boolean
  status?: "ACTIVE" | "INACTIVE"
  rejectionReason?: string | null
  inactiveReason?: string | null
  is_sent_email?: boolean
  is_sent_at?: string | null
  createdAt?: string
  properties?: { id: string; title: string; status: string }[]
  creator?: {
    id: string
    name: string
    email: string
    role?: string
    image?: string
  } | null
}

type SortField = "name" | "email" | "createdAt"
type SortDirection = "asc" | "desc"

export function LandlordsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [landlords, setLandlords] = useState<Landlord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [landlordToDelete, setLandlordToDelete] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusLandlordId, setStatusLandlordId] = useState<string | null>(null)
  const [statusLandlordCurrentStatus, setStatusLandlordCurrentStatus] = useState<"ACTIVE" | "INACTIVE" | undefined>(undefined)
  const [inactiveReason, setInactiveReason] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadLandlords()
  }, [])

  const loadLandlords = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getLandlords()
      setLandlords(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load landlords")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load landlords",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Statistics
  const stats = useMemo(() => {
    const total = landlords.length
    const withProperties = landlords.filter((l) => l.properties && l.properties.length > 0).length
    const totalProperties = landlords.reduce((sum, l) => sum + (l.properties?.length || 0), 0)

    return { total, withProperties, totalProperties }
  }, [landlords])

  // Filtered and sorted landlords
  const filteredAndSortedLandlords = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    let filtered = landlords.filter((landlord) => {
      const name = landlord.name?.toLowerCase() ?? ""
      const email = landlord.email?.toLowerCase() ?? ""
      const company = landlord.company_name?.toLowerCase() ?? ""
      const nationality = landlord.nationality?.toLowerCase() ?? ""

      const matchesSearch =
        !term ||
        name.includes(term) ||
        email.includes(term) ||
        company.includes(term) ||
        nationality.includes(term)
      return matchesSearch
    })

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "name":
          aValue = a.name?.toLowerCase() ?? ""
          bValue = b.name?.toLowerCase() ?? ""
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
  }, [landlords, searchTerm, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedLandlords.length / itemsPerPage)
  const paginatedLandlords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSortedLandlords.slice(start, start + itemsPerPage)
  }, [filteredAndSortedLandlords, currentPage])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDelete = async () => {
    if (!landlordToDelete) return

    setDeletingId(landlordToDelete)
    try {
      await deleteLandlord(landlordToDelete)
      await loadLandlords()
      setDeleteDialogOpen(false)
      setLandlordToDelete(null)
      toast({
        title: "Success",
        description: "Landlord deleted successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete landlord",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleAccept = async (id: string) => {
    setAcceptingId(id)
    try {
      await verifyLandlord(id, true)
      await loadLandlords()
      toast({
        title: "Success",
        description: "Landlord verified successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to verify landlord",
        variant: "destructive",
      })
    } finally {
      setAcceptingId(null)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: "ACTIVE" | "INACTIVE" | undefined) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    
    // If setting to inactive, show dialog for reason
    if (newStatus === "INACTIVE") {
      setStatusLandlordId(id)
      setStatusLandlordCurrentStatus(currentStatus)
      setInactiveReason("")
      setStatusDialogOpen(true)
      return
    }

    // If reactivating, just update directly
    setUpdatingStatusId(id)
    try {
      await updateLandlordStatus(id, newStatus)
      await loadLandlords()
      toast({
        title: "Success",
        description: `Landlord status updated to ${newStatus} successfully`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update landlord status",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const handleConfirmStatusChange = async () => {
    if (!statusLandlordId) return

    setUpdatingStatusId(statusLandlordId)
    try {
      await updateLandlordStatus(statusLandlordId, "INACTIVE", inactiveReason || undefined)
      await loadLandlords()
      setStatusDialogOpen(false)
      setStatusLandlordId(null)
      setInactiveReason("")
      toast({
        title: "Success",
        description: "Landlord set to inactive. Email sent!",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update landlord status",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatusId(null)
    }
  }

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Landlords</h1>
          <p className="text-xs text-muted-foreground">Manage property landlords</p>
        </div>
        <Button onClick={() => router.push("/landlords/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Landlord
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-2 md:grid-cols-3">
        <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Landlords</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <Users className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground">{stats.total}</div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Registered landlords</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground">With Properties</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <Building2 className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground">{stats.withProperties}</div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Active landlords</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Properties</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <Building2 className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground">{stats.totalProperties}</div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Managed properties</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="">
        <CardHeader className="">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Landlords</CardTitle>
              <CardDescription className="mt-1">View and manage all landlords</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="">
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 pl-10 transition-all focus:border-[#2a6f97] focus:ring-[#2a6f97]"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="py-8 text-center text-sm text-destructive">{error}</div>
          ) : paginatedLandlords.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No landlords found</EmptyTitle>
                <EmptyDescription>Get started by creating a new landlord.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="">
                <div className="">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/50 bg-muted/30 hover:bg-muted/30">
                        <TableHead className="h-12 font-semibold text-foreground">ID</TableHead>
                        <TableHead className="h-12 font-semibold text-foreground">
                          <button
                            className="flex items-center gap-2 transition-colors hover:text-[#2a6f97]"
                            onClick={() => handleSort("name")}
                          >
                            Name
                            <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "name" ? "text-[#2a6f97]" : "text-muted-foreground"}`} />
                          </button>
                        </TableHead>
                        <TableHead className="h-12 font-semibold text-foreground">
                          <button
                            className="flex items-center gap-2 transition-colors hover:text-[#2a6f97]"
                            onClick={() => handleSort("email")}
                          >
                            Email
                            <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "email" ? "text-[#2a6f97]" : "text-muted-foreground"}`} />
                          </button>
                        </TableHead>
                        <TableHead className="h-12 font-semibold text-foreground">Phone</TableHead>
                        <TableHead className="h-12 font-semibold text-foreground">Profile</TableHead>
                        <TableHead className="h-12 font-semibold text-foreground">Company</TableHead>
                        <TableHead className="h-12 font-semibold text-foreground">Creator</TableHead>
                        <TableHead className="h-12 font-semibold text-foreground">Verification</TableHead>
                        <TableHead className="h-12 font-semibold text-foreground">Status</TableHead>
                        <TableHead className="h-12 font-semibold text-foreground">Properties</TableHead>
                        <TableHead className="h-12 font-semibold text-foreground">Email Status</TableHead>
                        <TableHead className="h-12 font-semibold text-foreground">
                          <button
                            className="flex items-center gap-2 transition-colors hover:text-[#2a6f97]"
                            onClick={() => handleSort("createdAt")}
                          >
                            Created
                            <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "createdAt" ? "text-[#2a6f97]" : "text-muted-foreground"}`} />
                          </button>
                        </TableHead>
                        <TableHead className="h-12 text-right font-semibold text-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLandlords.map((landlord, index) => (
                        <TableRow 
                          key={landlord.id}
                          className="border-b border-border/30 transition-colors hover:bg-muted/20"
                        >
                          <TableCell className="py-4">
                            <div className="font-mono text-xs text-muted-foreground">{landlord.id}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="font-medium text-foreground">{landlord.name}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-[#2a6f97]" />
                              <span className="text-sm text-muted-foreground">{landlord.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            {landlord.phone ? (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-[#2a6f97]" />
                                <span className="text-sm">{landlord.phone}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            {landlord.gender || landlord.nationality ? (
                              <div className="flex flex-col text-xs text-muted-foreground">
                                {landlord.gender && (
                                  <span className="capitalize">
                                    {landlord.gender.toLowerCase()}
                                  </span>
                                )}
                                {landlord.nationality && (
                                  <span>{landlord.nationality}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-sm">{landlord.company_name || <span className="text-muted-foreground">-</span>}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            {landlord.creator ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <User className="h-3.5 w-3.5 text-[#2a6f97]" />
                                  <span className="text-sm font-medium text-foreground">{landlord.creator.name}</span>
                                </div>
                                <div className="text-xs text-muted-foreground pl-5">{landlord.creator.email}</div>
                                {landlord.creator.role && (
                                  <Badge variant="outline" className="ml-5 text-xs">
                                    {landlord.creator.role}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge 
                              variant={landlord.isVerified ? "default" : "secondary"} 
                              className={`gap-1.5 ${landlord.isVerified ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400" : ""}`}
                            >
                              {landlord.isVerified ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Verified
                                </>
                              ) : (
                                "Not Verified"
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
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
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge variant="outline" className="font-medium">
                              {landlord.properties?.length || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            {landlord.is_sent_email ? (
                              <div className="flex flex-col gap-1">
                                <Badge variant="default" className="w-fit gap-1.5 bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                                  <Send className="h-3 w-3" />
                                  Sent
                                </Badge>
                                {landlord.is_sent_at && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(landlord.is_sent_at).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                    <span className="text-[10px]">
                                      {new Date(landlord.is_sent_at).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <Badge variant="secondary" className="w-fit gap-1.5">
                                <Mail className="h-3 w-3" />
                                Not Sent
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-sm text-muted-foreground">
                              {landlord.createdAt
                                ? new Date(landlord.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "-"}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex justify-end gap-1.5">
                              {!landlord.isVerified && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAccept(landlord.id)}
                                  disabled={acceptingId === landlord.id}
                                  className="h-8 w-8 rounded-md text-green-600 transition-colors hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
                                  title="Accept and verify landlord"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(landlord.id, landlord.status)}
                                disabled={updatingStatusId === landlord.id}
                                className={`h-8 w-8 rounded-md transition-colors ${
                                  landlord.status === "ACTIVE"
                                    ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20"
                                    : "text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
                                }`}
                                title={landlord.status === "ACTIVE" ? "Deactivate landlord" : "Activate landlord"}
                              >
                                {updatingStatusId === landlord.id ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : landlord.status === "ACTIVE" ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/landlords/${landlord.id}`)}
                                className="h-8 w-8 rounded-md transition-colors hover:bg-muted"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/landlords/${landlord.id}/edit`)}
                                className="h-8 w-8 rounded-md transition-colors hover:bg-muted"
                                title="Edit landlord"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setLandlordToDelete(landlord.id)
                                  setDeleteDialogOpen(true)
                                }}
                                className="h-8 w-8 rounded-md text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
                                title="Delete landlord"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-medium text-foreground">
                      {Math.min(currentPage * itemsPerPage, filteredAndSortedLandlords.length)}
                    </span>{" "}
                    of <span className="font-medium text-foreground">{filteredAndSortedLandlords.length}</span> landlords
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-9 px-4 transition-colors"
                    >
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
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Landlord</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this landlord? This action cannot be undone.
              {landlordToDelete &&
                landlords.find((l) => l.id === landlordToDelete)?.properties &&
                landlords.find((l) => l.id === landlordToDelete)!.properties!.length > 0 && (
                  <span className="mt-2 block text-destructive">
                    Warning: This landlord has properties associated with them.
                  </span>
                )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deletingId !== null}>
              {deletingId ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inactive Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Landlord to Inactive</DialogTitle>
            <DialogDescription>
              Setting this landlord to inactive will send them an email notification and restrict their account access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inactiveReason">Inactive Reason (Optional)</Label>
              <Textarea
                id="inactiveReason"
                value={inactiveReason}
                onChange={(e) => setInactiveReason(e.target.value)}
                placeholder="Enter the reason for setting the account to inactive..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be included in the email sent to the landlord.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStatusDialogOpen(false)
                setInactiveReason("")
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmStatusChange}
              disabled={updatingStatusId !== null}
            >
              {updatingStatusId ? "Updating..." : "Set Inactive & Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
