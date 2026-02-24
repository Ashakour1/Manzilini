"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react"
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
  type EmployeeItem,
  type EmployeePayload,
  type EmployeeStatus,
} from "@/services/employees.service"

type SortField = "name" | "email" | "status" | "createdAt"
type SortDirection = "asc" | "desc"

type FormState = {
  companyId: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  status: EmployeeStatus
  hiredAt: string
}

const INITIAL_FORM: FormState = {
  companyId: "",
  name: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  status: "ACTIVE",
  hiredAt: "",
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "-"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "-"

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const toDateTimeLocalInput = (value?: string | null) => {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const timezoneOffset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

const toIsoDateTime = (value: string) => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

const getStatusBadgeClass = (status: EmployeeStatus) => {
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-700 border border-emerald-100"
  return "bg-slate-100 text-slate-700 border border-slate-200"
}

export function EmployeesPage() {
  const { toast } = useToast()

  const [employees, setEmployees] = useState<EmployeeItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const itemsPerPage = 10

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getEmployees()
      setEmployees(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load employees"
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const stats = useMemo(() => {
    const total = employees.length
    const active = employees.filter((employee) => employee.status === "ACTIVE").length
    const inactive = employees.filter((employee) => employee.status === "INACTIVE").length

    return { total, active, inactive }
  }, [employees])

  const filteredAndSortedEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    const filtered = employees.filter((employee) => {
      const companyId = employee.companyId?.toLowerCase() ?? ""
      const name = employee.name?.toLowerCase() ?? ""
      const email = employee.email?.toLowerCase() ?? ""
      const phone = employee.phone?.toLowerCase() ?? ""
      const position = employee.position?.toLowerCase() ?? ""
      const department = employee.department?.toLowerCase() ?? ""

      const matchesSearch =
        !term ||
        companyId.includes(term) ||
        name.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        position.includes(term) ||
        department.includes(term)

      const matchesStatus = statusFilter === "all" || employee.status === statusFilter

      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let aValue: string | number = ""
      let bValue: string | number = ""

      if (sortField === "name") {
        aValue = a.name?.toLowerCase() ?? ""
        bValue = b.name?.toLowerCase() ?? ""
      } else if (sortField === "email") {
        aValue = a.email?.toLowerCase() ?? ""
        bValue = b.email?.toLowerCase() ?? ""
      } else if (sortField === "status") {
        aValue = a.status ?? ""
        bValue = b.status ?? ""
      } else {
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [employees, searchTerm, statusFilter, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedEmployees.length / itemsPerPage)

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredAndSortedEmployees.slice(start, start + itemsPerPage)
  }, [filteredAndSortedEmployees, currentPage])

  const hasActiveFilters = searchTerm.trim().length > 0 || statusFilter !== "all"

  const resetForm = () => {
    setFormData(INITIAL_FORM)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const openCreateDialog = () => {
    setEditingEmployee(null)
    resetForm()
    setIsFormDialogOpen(true)
  }

  const openEditDialog = (employee: EmployeeItem) => {
    setEditingEmployee(employee)
    setFormData({
      companyId: employee.companyId || "",
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      position: employee.position || "",
      department: employee.department || "",
      status: employee.status || "ACTIVE",
      hiredAt: toDateTimeLocalInput(employee.hiredAt),
    })
    setIsFormDialogOpen(true)
  }

  const handleSave = async () => {
    const companyId = formData.companyId.trim()
    const name = formData.name.trim()
    const email = formData.email.trim()

    if (!companyId || !name || !email) {
      toast({
        title: "Validation Error",
        description: "Company ID, name, and email are required",
        variant: "destructive",
      })
      return
    }

    const payload: EmployeePayload = {
      companyId,
      name,
      email,
      phone: formData.phone.trim() || undefined,
      position: formData.position.trim() || undefined,
      department: formData.department.trim() || undefined,
      status: formData.status,
      hiredAt: toIsoDateTime(formData.hiredAt),
    }

    setIsSaving(true)

    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, payload)
      } else {
        await createEmployee(payload)
      }

      await loadEmployees()

      setIsFormDialogOpen(false)
      setEditingEmployee(null)
      resetForm()
      setCurrentPage(1)

      toast({
        title: "Success",
        description: editingEmployee ? "Employee updated successfully" : "Employee created successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save employee",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!employeeToDelete) return

    setDeletingId(employeeToDelete.id)

    try {
      await deleteEmployee(employeeToDelete.id)
      await loadEmployees()

      setIsDeleteDialogOpen(false)
      setEmployeeToDelete(null)
      setCurrentPage(1)

      toast({
        title: "Success",
        description: "Employee deleted successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete employee",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-in fade-in-0 slide-in-from-top-1 duration-500">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Employees</h1>
          <p className="mt-1 text-xs text-gray-600">Manage company employees, status, and profile details</p>
        </div>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto bg-[#2a6f97] hover:bg-[#1f5a7a]">
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Card className="border border-gray-200 bg-white animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Total Employees</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <Users className="h-3 w-3 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-gray-900">{stats.total}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">All employee profiles</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Active</CardTitle>
            <div className="rounded-lg bg-emerald-100 p-1.5">
              <UserCheck className="h-3 w-3 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-gray-900">{stats.active}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Currently active employees</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600">Inactive</CardTitle>
            <div className="rounded-lg bg-slate-100 p-1.5">
              <UserX className="h-3 w-3 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-gray-900">{stats.inactive}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Inactive employee records</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-200 bg-white animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Employee Directory</CardTitle>
              <CardDescription className="text-gray-600">Search, edit, and maintain employee records</CardDescription>
            </div>
            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setCurrentPage(1)
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by company ID, name, email, phone, position, or department..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 h-11 border-gray-300 focus:border-[#2a6f97] focus:ring-[#2a6f97]"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-11 border-gray-300">
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
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
                <p className="text-sm font-medium text-red-800">{error}</p>
                <Button variant="outline" size="sm" onClick={loadEmployees} className="mt-4">
                  Try Again
                </Button>
              </div>
            </div>
          ) : paginatedEmployees.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No employees found</EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? "Try adjusting your filters to see more results."
                    : "Get started by creating your first employee record."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="rounded-lg border border-gray-200 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700">Employee ID</TableHead>
                      <TableHead className="font-semibold text-gray-700">Company ID</TableHead>
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
                      <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Phone</TableHead>
                      <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Position</TableHead>
                      <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Department</TableHead>
                      <TableHead>
                        <button
                          className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                          onClick={() => handleSort("status")}
                        >
                          Status
                          {sortField === "status" ? (
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
                      <TableHead className="font-semibold text-gray-700 hidden xl:table-cell">Hired At</TableHead>
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
                    {paginatedEmployees.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="max-w-[200px]">
                          <span className="text-xs font-mono text-gray-500 break-all">{employee.id}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono text-gray-600 break-all">{employee.companyId || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{employee.name || "-"}</div>
                          <div className="mt-1 text-xs text-gray-500 md:hidden">{employee.position || "No position"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            <span className="truncate max-w-[180px]">{employee.email || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            <span>{employee.phone || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm text-gray-700">{employee.position || "-"}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-sm text-gray-700">{employee.department || "-"}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`font-medium ${getStatusBadgeClass(employee.status)}`}>{employee.status}</Badge>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm text-gray-600">{formatDateTime(employee.hiredAt)}</TableCell>
                        <TableCell className="text-sm text-gray-600">{formatDateTime(employee.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(employee)}
                              className="h-8 w-8 rounded-md transition-colors hover:bg-muted"
                              title="Edit employee"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEmployeeToDelete(employee)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="h-8 w-8 rounded-md text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
                              title="Delete employee"
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

              {totalPages > 1 ? (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                    <span className="font-medium text-gray-900">
                      {Math.min(currentPage * itemsPerPage, filteredAndSortedEmployees.length)}
                    </span>{" "}
                    of <span className="font-medium text-gray-900">{filteredAndSortedEmployees.length}</span> employees
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="h-9 px-4"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="h-9 px-4"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isFormDialogOpen}
        onOpenChange={(open) => {
          setIsFormDialogOpen(open)
          if (!open) {
            setEditingEmployee(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit Employee" : "Create Employee"}</DialogTitle>
            <DialogDescription>
              {editingEmployee
                ? "Update employee information and status."
                : "Add a new employee profile to the system."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employee-companyId">Company ID *</Label>
                <Input
                  id="employee-companyId"
                  value={formData.companyId}
                  onChange={(event) => setFormData((prev) => ({ ...prev, companyId: event.target.value }))}
                  placeholder="COMP-EMP-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-name">Name *</Label>
                <Input
                  id="employee-name"
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Employee name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-email">Email *</Label>
                <Input
                  id="employee-email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="employee@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employee-phone">Phone</Label>
                <Input
                  id="employee-phone"
                  value={formData.phone}
                  onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="+1 555 000 0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: EmployeeStatus) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger id="employee-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employee-position">Position</Label>
                <Input
                  id="employee-position"
                  value={formData.position}
                  onChange={(event) => setFormData((prev) => ({ ...prev, position: event.target.value }))}
                  placeholder="Operations Manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-department">Department</Label>
                <Input
                  id="employee-department"
                  value={formData.department}
                  onChange={(event) => setFormData((prev) => ({ ...prev, department: event.target.value }))}
                  placeholder="Operations"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee-hiredAt">Hired Date & Time</Label>
              <Input
                id="employee-hiredAt"
                type="datetime-local"
                value={formData.hiredAt}
                onChange={(event) => setFormData((prev) => ({ ...prev, hiredAt: event.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsFormDialogOpen(false)
                setEditingEmployee(null)
                resetForm()
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-[#2a6f97] hover:bg-[#1f5a7a]">
              {isSaving ? "Saving..." : editingEmployee ? "Update Employee" : "Create Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) {
            setEmployeeToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              {employeeToDelete
                ? `Are you sure you want to delete ${employeeToDelete.name}? This action cannot be undone.`
                : "Are you sure you want to delete this employee?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setEmployeeToDelete(null)
              }}
              disabled={deletingId !== null}
            >
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
