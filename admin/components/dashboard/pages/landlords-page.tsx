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
} from "lucide-react"
import { getLandlords, deleteLandlord } from "@/services/landlords.service"
import { useToast } from "@/components/ui/use-toast"

type Landlord = {
  id: string
  name: string
  email: string
  phone?: string
  company_name?: string
  address?: string
  createdAt?: string
  properties?: { id: string; title: string; status: string }[]
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

      const matchesSearch = !term || name.includes(term) || email.includes(term) || company.includes(term)
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Landlords</h1>
          <p className="text-sm text-muted-foreground">Manage property landlords</p>
        </div>
        <Button onClick={() => router.push("/landlords/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Landlord
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Landlords</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Registered landlords</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withProperties}</div>
            <p className="text-xs text-muted-foreground">Active landlords</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">Managed properties</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Landlords</CardTitle>
          <CardDescription>View and manage all landlords</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button
                          className="flex items-center gap-2 hover:text-foreground"
                          onClick={() => handleSort("name")}
                        >
                          Name
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          className="flex items-center gap-2 hover:text-foreground"
                          onClick={() => handleSort("email")}
                        >
                          Email
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead>
                        <button
                          className="flex items-center gap-2 hover:text-foreground"
                          onClick={() => handleSort("createdAt")}
                        >
                          Created
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLandlords.map((landlord) => (
                      <TableRow key={landlord.id}>
                        <TableCell className="font-medium">{landlord.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {landlord.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {landlord.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {landlord.phone}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{landlord.company_name || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{landlord.properties?.length || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          {landlord.createdAt
                            ? new Date(landlord.createdAt).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/landlords/${landlord.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/landlords/${landlord.id}/edit`)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedLandlords.length)} of{" "}
                    {filteredAndSortedLandlords.length} landlords
                  </p>
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
    </div>
  )
}
