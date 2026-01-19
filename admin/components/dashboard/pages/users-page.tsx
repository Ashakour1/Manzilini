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
  ArrowUp,
  ArrowDown,
  Users,
  Mail,
  Shield,
  UserCheck,
  Filter,
  X,
  MoreVertical,
  Building2,
  UserX,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { getUsers, deleteUser, updateUser } from "@/services/users.service"
import { getFieldAgents } from "@/services/field-agents.service"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type User = {
  id: string
  name: string
  email: string
  role: string
  status?: string
  image?: string
  createdAt?: string
  updatedAt?: string
  agentId?: string | null
  agent?: {
    id: string
    name: string
    email: string
    phone?: string
    image?: string
  } | null
  _count?: {
    property_applications: number
    properties?: number
  }
}

type SortField = "name" | "email" | "role" | "createdAt"
type SortDirection = "asc" | "desc"

export function UsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    status: "ACTIVE",
    agentId: "" as string | null,
  })
  const [fieldAgents, setFieldAgents] = useState<Array<{ id: string; name: string; email: string }>>([])
  const itemsPerPage = 10

  useEffect(() => {
    loadUsers()
    loadFieldAgents()
  }, [])

  const loadFieldAgents = async () => {
    try {
      const agents = await getFieldAgents()
      setFieldAgents(agents || [])
    } catch (err) {
      console.error("Failed to load field agents:", err)
    }
  }

  const loadUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getUsers()
      setUsers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Statistics
  const stats = useMemo(() => {
    const total = users.length
    const admins = users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length
    const regularUsers = users.filter((u) => u.role === "USER").length
    const propertyOwners = users.filter((u) => u.role === "PROPERTY_OWNER").length
    const activeUsers = users.filter((u) => u.status === "ACTIVE").length
    const inactiveUsers = users.filter((u) => u.status === "INACTIVE").length

    return { total, admins, regularUsers, propertyOwners, activeUsers, inactiveUsers }
  }, [users])

  // Filtered and sorted users
  const filteredAndSortedUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    let filtered = users.filter((user) => {
      const name = user.name?.toLowerCase() ?? ""
      const email = user.email?.toLowerCase() ?? ""
      const role = user.role?.toLowerCase() ?? ""

      const matchesSearch = !term || name.includes(term) || email.includes(term) || role.includes(term)
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesStatus = statusFilter === "all" || user.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
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
        case "role":
          aValue = a.role?.toLowerCase() ?? ""
          bValue = b.role?.toLowerCase() ?? ""
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
  }, [users, searchTerm, roleFilter, statusFilter, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSortedUsers.slice(start, start + itemsPerPage)
  }, [filteredAndSortedUsers, currentPage])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDelete = async () => {
    if (!userToDelete) return

    setDeletingId(userToDelete)
    try {
      await deleteUser(userToDelete)
      await loadUsers()
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      setCurrentPage(1)
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = async () => {
    if (!editingUser || !formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      await updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        agentId: formData.agentId || null,
        ...(formData.password && { password: formData.password }),
      })
      await loadUsers()
      setEditDialogOpen(false)
      setEditingUser(null)
      setFormData({ name: "", email: "", password: "", role: "USER", status: "ACTIVE", agentId: "" })
      toast({
        title: "Success",
        description: "User updated successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      status: user.status || "ACTIVE",
      agentId: user.agentId || "",
    })
    setEditDialogOpen(true)
  }

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    try {
      await updateUser(user.id, {
        status: newStatus,
      })
      await loadUsers()
      toast({
        title: "Success",
        description: `User ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "destructive"
      case "ADMIN":
        return "default"
      case "PROPERTY_OWNER":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setRoleFilter("all")
    setStatusFilter("all")
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || roleFilter !== "all" || statusFilter !== "all"

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-xs text-gray-600">Manage system users, roles, and permissions</p>
        </div>
        <Button 
          onClick={() => router.push("/users/new")} 
          className="w-full sm:w-auto bg-[#2a6f97] hover:bg-[#1f5a7a] text-white shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Total Users</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <Users className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-gray-900">{stats.total}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">All registered users</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Administrators</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <Shield className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-gray-900">{stats.admins}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Admin & Super Admin</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Regular Users</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <UserCheck className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-gray-900">{stats.regularUsers}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Standard users</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Property Owners</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <Users className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-gray-900">{stats.propertyOwners}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Property owners</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Active Users</CardTitle>
            <div className="rounded-lg bg-green-100 p-1.5">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-gray-900">{stats.activeUsers}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Active accounts</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Inactive Users</CardTitle>
            <div className="rounded-lg bg-gray-100 p-1.5">
              <UserX className="h-3 w-3 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-gray-900">{stats.inactiveUsers}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Inactive accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Users</CardTitle>
              <CardDescription className="text-gray-600">View and manage all system users</CardDescription>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 h-11 border-gray-300 focus:border-[#2a6f97] focus:ring-[#2a6f97]"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value) => {
              setRoleFilter(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-full sm:w-[180px] h-11 border-gray-300">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="PROPERTY_OWNER">Property Owner</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-full sm:w-[180px] h-11 border-gray-300">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
                <p className="text-sm font-medium text-red-800">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadUsers}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No users found</EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? "Try adjusting your filters to see more results."
                    : "Get started by creating a new user."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700">
                        User ID
                      </TableHead>
                      <TableHead>
                        <button
                          className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                          onClick={() => handleSort("name")}
                        >
                          Name
                          {sortField === "name" ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                          onClick={() => handleSort("email")}
                        >
                          Email
                          {sortField === "email" ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                          onClick={() => handleSort("role")}
                        >
                          Role
                          {sortField === "role" ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Properties</TableHead>
                      <TableHead className="font-semibold text-gray-700">Applications</TableHead>
                      <TableHead className="font-semibold text-gray-700">Field Agent</TableHead>
                      <TableHead>
                        <button
                          className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                          onClick={() => handleSort("createdAt")}
                        >
                          Created
                          {sortField === "createdAt" ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="max-w-[180px]">
                          <span className="text-xs font-mono text-gray-500 break-all">
                            {user.id}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-gray-200">
                              <AvatarImage src={user.image} alt={user.name} />
                              <AvatarFallback className="bg-[#2a6f97] text-white text-xs font-semibold">
                                {getUserInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-gray-900">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            <span className="truncate max-w-[200px]">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)} className="font-medium">
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === "ACTIVE" ? "default" : "secondary"} 
                            className={`font-medium ${
                              user.status === "ACTIVE" 
                                ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }`}
                          >
                            {user.status === "ACTIVE" ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Inactive
                              </span>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            <Building2 className="mr-1 h-3 w-3 inline" />
                            {user._count?.properties || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-medium">
                            {user._count?.property_applications || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.agent ? (
                            <div className="flex items-center gap-2">
                              <Users className="h-3.5 w-3.5 text-gray-400" />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">{user.agent.name}</span>
                                <span className="text-xs text-gray-500">{user.agent.email}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No agent assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => router.push(`/users/${user.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(user)}
                              >
                                {user.status === "ACTIVE" ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Deactivate User
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Activate User
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setUserToDelete(user.id)
                                  setDeleteDialogOpen(true)
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {paginatedUsers.map((user) => (
                  <Card key={user.id} className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-12 w-12 border border-gray-200 flex-shrink-0">
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback className="bg-[#2a6f97] text-white text-sm font-semibold">
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-mono text-gray-500 break-all">
                              ID: {user.id}
                            </p>
                            <p className="mt-0.5 font-semibold text-gray-900 truncate">{user.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                              <p className="text-sm text-gray-600 truncate">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                                {user.role.replace('_', ' ')}
                              </Badge>
                              <Badge 
                                variant={user.status === "ACTIVE" ? "default" : "secondary"} 
                                className={`text-xs ${
                                  user.status === "ACTIVE" 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {user.status === "ACTIVE" ? (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <XCircle className="h-3 w-3" />
                                    Inactive
                                  </span>
                                )}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Building2 className="mr-1 h-3 w-3 inline" />
                                {user._count?.properties || 0} properties
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {user._count?.property_applications || 0} applications
                              </Badge>
                            </div>
                            {user.agent && (
                              <div className="flex items-center gap-2 mt-2">
                                <Users className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-600">
                                  Agent: {user.agent.name}
                                </span>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Created: {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : "-"}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => router.push(`/users/${user.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(user)}
                            >
                              {user.status === "ACTIVE" ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Deactivate User
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Activate User
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setUserToDelete(user.id)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)} of{" "}
                    {filteredAndSortedUsers.length} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-gray-300"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
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
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={
                              currentPage === pageNum
                                ? "bg-[#2a6f97] hover:bg-[#1f5a7a] text-white border-[#2a6f97]"
                                : "border-gray-300"
                            }
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-gray-300"
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

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password" className="text-sm font-medium">
                Password <span className="text-gray-500 font-normal">(optional)</span>
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave blank to keep current password"
                className="h-11"
              />
              <p className="text-xs text-gray-500">Leave blank to keep the current password</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-sm font-medium">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="PROPERTY_OWNER">Property Owner</SelectItem>
                  <SelectItem value="AGENT">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status" className="text-sm font-medium">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-agent" className="text-sm font-medium">
                Field Agent <span className="text-gray-500 font-normal">(optional)</span>
              </Label>
              <Select 
                value={formData.agentId || "none"} 
                onValueChange={(value) => {
                  const selectedAgentId = value === "none" ? "" : value
                  const selectedAgent = fieldAgents.find(a => a.id === selectedAgentId)
                  setFormData({ 
                    ...formData, 
                    agentId: selectedAgentId,
                    name: selectedAgent ? selectedAgent.name : formData.name,
                    email: selectedAgent ? selectedAgent.email : formData.email
                  })
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a field agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Agent</SelectItem>
                  {fieldAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} ({agent.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.agentId && (
                <p className="text-xs text-gray-500">Name and email will be auto-filled from the selected agent</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} className="bg-[#2a6f97] hover:bg-[#1f5a7a] text-white">
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-destructive">Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
              {userToDelete &&
                users.find((u) => u.id === userToDelete)?._count &&
                users.find((u) => u.id === userToDelete)!._count!.property_applications > 0 && (
                  <span className="mt-2 block rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                    <strong>Warning:</strong> This user has {users.find((u) => u.id === userToDelete)!._count!.property_applications} property application(s) associated with them.
                  </span>
                )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={deletingId !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingId ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
