"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wrench,
} from "lucide-react"

type MaintenanceRequest = {
  id: number
  property: string
  issue: string
  reportedBy: string
  reportedDate: string
  status: "Completed" | "In Progress" | "Pending"
  priority: "High" | "Medium" | "Low"
  assignedTo: string
}

const initialRequests: MaintenanceRequest[] = [
  {
    id: 1,
    property: "Apartment 101",
    issue: "Leaky faucet in kitchen",
    reportedBy: "John Doe",
    reportedDate: "2024-11-20",
    status: "In Progress",
    priority: "Medium",
    assignedTo: "Mike's Repairs",
  },
  {
    id: 2,
    property: "House 5B",
    issue: "Broken window in bedroom",
    reportedBy: "Jane Smith",
    reportedDate: "2024-11-18",
    status: "Completed",
    priority: "High",
    assignedTo: "Pro Repairs Co",
  },
  {
    id: 3,
    property: "Commercial 3",
    issue: "HVAC system needs service",
    reportedBy: "ABC Corp",
    reportedDate: "2024-11-25",
    status: "Pending",
    priority: "High",
    assignedTo: "Not Assigned",
  },
  {
    id: 4,
    property: "Apartment 202",
    issue: "Paint touch-up needed",
    reportedBy: "Management",
    reportedDate: "2024-11-22",
    status: "In Progress",
    priority: "Low",
    assignedTo: "Property Care",
  },
]

const statusTone: Record<MaintenanceRequest["status"], string> = {
  Completed: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  "In Progress": "bg-sky-50 text-sky-700 border border-sky-100",
  Pending: "bg-amber-50 text-amber-700 border border-amber-100",
}

const priorityTone: Record<MaintenanceRequest["priority"], string> = {
  High: "bg-rose-50 text-rose-700 border border-rose-100",
  Medium: "bg-amber-50 text-amber-700 border border-amber-100",
  Low: "bg-emerald-50 text-emerald-700 border border-emerald-100",
}

const emptyRequest: Omit<MaintenanceRequest, "id"> = {
  property: "",
  issue: "",
  reportedBy: "",
  reportedDate: "",
  status: "Pending",
  priority: "Medium",
  assignedTo: "",
}

const formatDate = (date: string) => {
  if (!date) return "—"
  const parsed = new Date(date)
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const requestCode = (id: number) => `REQ-${id.toString().padStart(4, "0")}`

export function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(initialRequests)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Omit<MaintenanceRequest, "id">>(emptyRequest)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"All" | MaintenanceRequest["status"]>("All")
  const [priorityFilter, setPriorityFilter] = useState<"All" | MaintenanceRequest["priority"]>("All")

  const openCount = useMemo(() => requests.filter((req) => req.status !== "Completed").length, [requests])
  const highPriority = useMemo(() => requests.filter((req) => req.priority === "High").length, [requests])

  const filteredRequests = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    return requests.filter((request) => {
      const matchesSearch =
        !term ||
        request.issue.toLowerCase().includes(term) ||
        request.property.toLowerCase().includes(term) ||
        request.assignedTo.toLowerCase().includes(term)
      const matchesStatus = statusFilter === "All" || request.status === statusFilter
      const matchesPriority = priorityFilter === "All" || request.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [priorityFilter, requests, searchTerm, statusFilter])

  const startCreate = () => {
    setEditingId(null)
    setFormData(emptyRequest)
    setIsDialogOpen(true)
  }

  const startEdit = (request: MaintenanceRequest) => {
    setEditingId(request.id)
    const { id, ...rest } = request
    setFormData(rest)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete this request?")) return
    setRequests((prev) => prev.filter((request) => request.id !== id))
  }

  const handleSave = () => {
    if (!formData.property.trim() || !formData.issue.trim()) {
      return
    }

    setRequests((prev) => {
      if (editingId) {
        return prev.map((request) => (request.id === editingId ? { ...request, ...formData } : request))
      }
      const nextId = prev.length ? Math.max(...prev.map((request) => request.id)) + 1 : 1
      return [...prev, { id: nextId, ...formData }]
    })

    setIsDialogOpen(false)
    setEditingId(null)
    setFormData(emptyRequest)
  }

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-foreground">Maintenance</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Keep units safe and responsive
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="border-border text-foreground">
            <Download className="mr-2 h-4 w-4" />
            Export log
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={startCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit request" : "New request"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="property">Property</Label>
                  <Input
                    id="property"
                    value={formData.property}
                    onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                    placeholder="Apartment 101"
                  />
                </div>
                <div>
                  <Label htmlFor="issue">Issue</Label>
                  <Textarea
                    id="issue"
                    value={formData.issue}
                    onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                    placeholder="Describe the request"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="reportedBy">Reported by</Label>
                    <Input
                      id="reportedBy"
                      value={formData.reportedBy}
                      onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                      placeholder="Tenant or staff name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reportedDate">Reported date</Label>
                    <Input
                      id="reportedDate"
                      type="date"
                      value={formData.reportedDate}
                      onChange={(e) => setFormData({ ...formData, reportedDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as MaintenanceRequest["status"] })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value as MaintenanceRequest["priority"] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assignedTo">Assigned to</Label>
                    <Input
                      id="assignedTo"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      placeholder="Vendor or team"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-4 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>{editingId ? "Save changes" : "Create request"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* card */}
      <Card className="border-none bg-transparent p-0 shadow-none ">
        <CardHeader className="gap-4 border-b border-border/80 px-0  ">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Wrench className="h-4 w-4" />
              </span>
              <div>
                <CardTitle className="text-xl font-semibold leading-tight text-foreground">Maintenance board</CardTitle>
                <CardDescription>Track requests, assignments, and SLA focus</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="border-border text-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Date: All
              </Button>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as MaintenanceRequest["status"] | "All")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {["All", "Pending", "In Progress", "Completed"].map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as MaintenanceRequest["priority"] | "All")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {["All", "High", "Medium", "Low"].map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
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
                placeholder="Search issue, property, or vendor"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-1">
                <AlertCircle className="h-4 w-4" />
                Open: {openCount}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-1">
                <Wrench className="h-4 w-4" />
                High priority: {highPriority}
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
                    <Checkbox aria-label="Select all requests" />
                  </TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-muted/40">
                    <TableCell>
                      <Checkbox aria-label={`Select request ${request.id}`} />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{requestCode(request.id)}</p>
                        <p className="text-sm text-foreground">{request.issue}</p>
                        <p className="text-xs text-muted-foreground">Reported by {request.reportedBy}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{request.property}</TableCell>
                    <TableCell>
                      <Badge className={priorityTone[request.priority]}>{request.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusTone[request.status]}>{request.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{request.assignedTo}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(request.reportedDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 border-border"
                          onClick={() => startEdit(request)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive"
                          onClick={() => handleDelete(request.id)}
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
            <div>Showing 1-{filteredRequests.length} of {requests.length} entries</div>
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
