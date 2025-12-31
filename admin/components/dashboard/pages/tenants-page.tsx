"use client"

import { useMemo, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Home,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react"

type Tenant = {
  id: number
  name: string
  email: string
  phone: string
  property: string
  leaseExpiry: string
  status: string
  moveInDate: string
}

const initialTenants: Tenant[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "(555) 123-4567",
    property: "Apartment 101",
    leaseExpiry: "2025-01-15",
    status: "Active",
    moveInDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "(555) 234-5678",
    property: "House 5B",
    leaseExpiry: "2025-02-10",
    status: "Active",
    moveInDate: "2024-02-10",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "(555) 345-6789",
    property: "Commercial 3",
    leaseExpiry: "2026-06-01",
    status: "Active",
    moveInDate: "2023-06-01",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    phone: "(555) 456-7890",
    property: "Apartment 202",
    leaseExpiry: "2024-12-15",
    status: "Lease Expiring",
    moveInDate: "2023-12-15",
  },
]

const emptyTenant: Omit<Tenant, "id"> = {
  name: "",
  email: "",
  phone: "",
  property: "",
  leaseExpiry: "",
  status: "Active",
  moveInDate: "",
}

const statusTone: Record<Tenant["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  "Lease Expiring": "bg-amber-50 text-amber-700 border border-amber-100",
  Former: "bg-slate-100 text-slate-700 border border-slate-200",
}

const formatDate = (date: string) => {
  if (!date) return "—"
  const parsed = new Date(date)
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const initialsFor = (name: string) => {
  const parts = name.split(" ").filter(Boolean)
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase()
}

const tenantCode = (id: number) => `TEN-${id.toString().padStart(4, "0")}`

export function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Omit<Tenant, "id">>(emptyTenant)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [propertyFilter, setPropertyFilter] = useState("All")

  const totalActive = useMemo(() => tenants.filter((tenant) => tenant.status === "Active").length, [tenants])
  const propertyOptions = useMemo(() => ["All", ...Array.from(new Set(tenants.map((tenant) => tenant.property)))], [tenants])

  const filteredTenants = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    return tenants.filter((tenant) => {
      const matchesSearch =
        !term ||
        tenant.name.toLowerCase().includes(term) ||
        tenant.email.toLowerCase().includes(term) ||
        tenant.property.toLowerCase().includes(term)
      const matchesStatus = statusFilter === "All" || tenant.status === statusFilter
      const matchesProperty = propertyFilter === "All" || tenant.property === propertyFilter
      return matchesSearch && matchesStatus && matchesProperty
    })
  }, [propertyFilter, searchTerm, statusFilter, tenants])

  const startCreate = () => {
    setEditingId(null)
    setFormData(emptyTenant)
    setIsDialogOpen(true)
  }

  const startEdit = (tenant: Tenant) => {
    setEditingId(tenant.id)
    const { id, ...rest } = tenant
    setFormData(rest)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    const confirmDelete = window.confirm("Remove this tenant?")
    if (!confirmDelete) return
    setTenants((prev) => prev.filter((tenant) => tenant.id !== id))
  }

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.property.trim()) {
      return
    }

    setTenants((prev) => {
      if (editingId) {
        return prev.map((tenant) => (tenant.id === editingId ? { ...tenant, ...formData } : tenant))
      }
      const nextId = prev.length ? Math.max(...prev.map((tenant) => tenant.id)) + 1 : 1
      return [...prev, { id: nextId, ...formData }]
    })

    setIsDialogOpen(false)
    setEditingId(null)
    setFormData(emptyTenant)
  }

  return (
    <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Tenants</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {totalActive} active tenants tracked
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="border-border text-foreground">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={startCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add tenant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit tenant" : "Add tenant"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tenant name"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="tenant@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="property">Property</Label>
                  <Input
                    id="property"
                    value={formData.property}
                    onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                    placeholder="Apartment 101"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="moveInDate">Move-in date</Label>
                    <Input
                      id="moveInDate"
                      type="date"
                      value={formData.moveInDate}
                      onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="leaseExpiry">Lease expiry</Label>
                    <Input
                      id="leaseExpiry"
                      type="date"
                      value={formData.leaseExpiry}
                      onChange={(e) => setFormData({ ...formData, leaseExpiry: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Lease Expiring">Lease Expiring</SelectItem>
                      <SelectItem value="Former">Former</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="mt-4 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>{editingId ? "Save changes" : "Add tenant"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none bg-transparent p-0 shadow-none">
        <CardHeader className="gap-4 border-b border-border/80 px-0 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <CardTitle className="text-xl font-semibold leading-tight text-foreground">Tenant directory</CardTitle>
                <CardDescription>Central view of residents, leases, and contact details</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="border-border text-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Date: All
              </Button>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {["All", "Active", "Lease Expiring", "Former"].map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Property" />
                </SelectTrigger>
                <SelectContent>
                  {propertyOptions.map((property) => (
                    <SelectItem key={property} value={property}>
                      {property}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tenant or property"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-1">
                <Home className="h-4 w-4" />
                {filteredTenants.length} shown
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-1">
                <Mail className="h-4 w-4" />
                Contacts synced
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox aria-label="Select all tenants" />
                  </TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Move-in</TableHead>
                  <TableHead>Lease expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id} className="hover:bg-muted/40">
                    <TableCell>
                      <Checkbox aria-label={`Select ${tenant.name}`} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm font-semibold text-foreground">
                      {tenantCode(tenant.id)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border/80">
                          <AvatarFallback className="bg-blue-50 text-blue-700">{initialsFor(tenant.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{tenant.name}</p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {tenant.email}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {tenant.phone}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tenant.property}</TableCell>
                    <TableCell className="text-sm text-foreground">{formatDate(tenant.moveInDate)}</TableCell>
                    <TableCell className="text-sm text-foreground">{formatDate(tenant.leaseExpiry)}</TableCell>
                    <TableCell>
                      <Badge className={statusTone[tenant.status]}>{tenant.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 border-border"
                          onClick={() => startEdit(tenant)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive"
                          onClick={() => handleDelete(tenant.id)}
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
          <div className="flex flex-col gap-3 border-t border-border/80 px-0 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <div>Showing 1-{filteredTenants.length} of {tenants.length} entries</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="border-border text-foreground">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <div className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-foreground">
                <span className="font-semibold">1</span>
                <span className="text-muted-foreground">/ 1</span>
              </div>
              <Button size="sm" variant="outline" className="border-border text-foreground">
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
