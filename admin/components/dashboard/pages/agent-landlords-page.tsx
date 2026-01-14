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
  Search,
  Eye,
  ArrowUpDown,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react"
import { getLandlordsForAgent } from "@/services/landlords.service"
import { useToast } from "@/components/ui/use-toast"

type Landlord = {
  id: string
  name: string
  email: string
  phone?: string
  company_name?: string
  address?: string
  isVerified?: boolean
  createdAt?: string
  properties?: { id: string; title: string; status: string }[]
}

type SortField = "name" | "email" | "createdAt"
type SortDirection = "asc" | "desc"

export function AgentLandlordsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [landlords, setLandlords] = useState<Landlord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
      const data = await getLandlordsForAgent()
      setLandlords(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load landlords"
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

  // Statistics
  const stats = useMemo(() => {
    const total = landlords.length
    const withProperties = landlords.filter((l) => l.properties && l.properties.length > 0).length
    const totalProperties = landlords.reduce((sum, l) => sum + (l.properties?.length || 0), 0)
    const verified = landlords.filter((l) => l.isVerified).length

    return { total, withProperties, totalProperties, verified }
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

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Landlords</h1>
          <p className="text-xs text-muted-foreground">Landlords with properties assigned to you</p>
        </div>
        <Button onClick={() => router.push("/agent/landlords/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Landlord
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Landlords</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <UserCheck className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground">{stats.total}</div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Assigned landlords</p>
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
            <p className="mt-0.5 text-[10px] text-muted-foreground">Properties managed</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Verified</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <CheckCircle2 className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground">{stats.verified}</div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Verified landlords</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Landlords</CardTitle>
              <CardDescription className="mt-1">View and manage assigned landlords</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                <EmptyDescription>
                  {searchTerm
                    ? "Try adjusting your search"
                    : "You don't have any landlords assigned yet"}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 bg-muted/30 hover:bg-muted/30">
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
                      <TableHead className="h-12 font-semibold text-foreground">Company</TableHead>
                      <TableHead className="h-12 font-semibold text-foreground">Properties</TableHead>
                      <TableHead className="h-12 font-semibold text-foreground">Status</TableHead>
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
                    {paginatedLandlords.map((landlord) => (
                      <TableRow 
                        key={landlord.id}
                        className="border-b border-border/30 transition-colors hover:bg-muted/20"
                      >
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
                          {landlord.company_name ? (
                            <span className="text-sm font-medium text-foreground">{landlord.company_name}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant="outline">
                            {landlord.properties?.length || 0} properties
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          {landlord.isVerified ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Unverified</Badge>
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/agent/landlords/${landlord.id}`)}
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
