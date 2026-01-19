"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
  MapPin,
} from "lucide-react"
import { getFieldAgents, deleteFieldAgent } from "@/services/field-agents.service"
import { useToast } from "@/components/ui/use-toast"

type FieldAgent = {
  id: string
  name: string
  email: string
  phone?: string
  image?: string
  document_image?: string
  createdAt?: string
}

type SortField = "name" | "email" | "createdAt"
type SortDirection = "asc" | "desc"

export function FieldAgentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [agents, setAgents] = useState<FieldAgent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getFieldAgents()
      setAgents(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load field agents")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load field agents",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Statistics
  const stats = useMemo(() => {
    const total = agents.length
    const withImage = agents.filter((a) => a.image && a.image.trim() !== "").length

    return { total, withImage }
  }, [agents])

  // Filtered and sorted agents
  const filteredAndSortedAgents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    let filtered = agents.filter((agent) => {
      const name = agent.name?.toLowerCase() ?? ""
      const email = agent.email?.toLowerCase() ?? ""
      const phone = agent.phone?.toLowerCase() ?? ""

      const matchesSearch = !term || name.includes(term) || email.includes(term) || phone.includes(term)
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
  }, [agents, searchTerm, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedAgents.length / itemsPerPage)
  const paginatedAgents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSortedAgents.slice(start, start + itemsPerPage)
  }, [filteredAndSortedAgents, currentPage])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDelete = async () => {
    if (!agentToDelete) return

    setDeletingId(agentToDelete)
    try {
      await deleteFieldAgent(agentToDelete)
      await loadAgents()
      setDeleteDialogOpen(false)
      setAgentToDelete(null)
      toast({
        title: "Success",
        description: "Field agent deleted successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete field agent",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Field Agents</h1>
          <p className="text-xs text-muted-foreground">Manage field agents and their territories</p>
        </div>
        <Button onClick={() => router.push("/field-agents/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Field Agent
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-2 md:grid-cols-2">
        <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Agents</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <Users className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground">{stats.total}</div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Registered field agents</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground">With Images</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <MapPin className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground">{stats.withImage}</div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Agents with profile images</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="">
        <CardHeader className="">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Field Agents</CardTitle>
              <CardDescription className="mt-1">View and manage all field agents</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="">
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
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
          ) : paginatedAgents.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No field agents found</EmptyTitle>
                <EmptyDescription>Get started by creating a new field agent.</EmptyDescription>
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
                        <TableHead className="h-12 font-semibold text-foreground">Image</TableHead>
                        <TableHead className="h-12 font-semibold text-foreground">Document</TableHead>
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
                      {paginatedAgents.map((agent) => (
                        <TableRow 
                          key={agent.id}
                          className="border-b border-border/30 transition-colors hover:bg-muted/20"
                        >
                          <TableCell className="py-4">
                            <div className="font-mono text-xs text-muted-foreground">{agent.id}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="font-medium text-foreground">{agent.name}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-[#2a6f97]" />
                              <span className="text-sm text-muted-foreground">{agent.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            {agent.phone ? (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-[#2a6f97]" />
                                <span className="text-sm">{agent.phone}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            {agent.image ? (
                              <div className="flex items-center gap-2">
                                <img 
                                  src={agent.image} 
                                  alt={`${agent.name} profile`}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            {agent.document_image ? (
                              <div className="flex items-center gap-2">
                                <a 
                                  href={agent.document_image} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-[#2a6f97] hover:underline"
                                >
                                  View Document
                                </a>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-sm text-muted-foreground">
                              {agent.createdAt
                                ? new Date(agent.createdAt).toLocaleDateString("en-US", {
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
                                onClick={() => router.push(`/field-agents/${agent.id}`)}
                                className="h-8 w-8 rounded-md transition-colors hover:bg-muted"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/field-agents/${agent.id}/edit`)}
                                className="h-8 w-8 rounded-md transition-colors hover:bg-muted"
                                title="Edit field agent"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setAgentToDelete(agent.id)
                                  setDeleteDialogOpen(true)
                                }}
                                className="h-8 w-8 rounded-md text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
                                title="Delete field agent"
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
                      {Math.min(currentPage * itemsPerPage, filteredAndSortedAgents.length)}
                    </span>{" "}
                    of <span className="font-medium text-foreground">{filteredAndSortedAgents.length}</span> field agents
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
            <DialogTitle>Delete Field Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this field agent? This action cannot be undone.
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

