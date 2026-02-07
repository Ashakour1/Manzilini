"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  Activity,
  FileText,
  CheckCircle,
  XCircle,
  MessageSquare,
  ArrowRight,
  Edit,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getTenantById, getTenantActivities, updateTenant, type Tenant, type TenantActivity } from "@/services/tenants.service"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function TenantDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const tenantId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined

  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [activities, setActivities] = useState<TenantActivity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingActivities, setLoadingActivities] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "NEW" as "NEW" | "ACTIVE" | "INACTIVE" | "BLOCKED"
  })

  useEffect(() => {
    if (!tenantId) return

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getTenantById(tenantId)
        setTenant(data)
        setFormData({
          fullName: data.fullName,
          email: data.email || "",
          phone: data.phone,
          status: data.status
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tenant")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load tenant",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [tenantId, toast])

  useEffect(() => {
    if (!tenantId) return

    const loadActivities = async () => {
      setLoadingActivities(true)
      try {
        const data = await getTenantActivities(tenantId, 50)
        setActivities(data || [])
      } catch (err) {
        console.error("Failed to load activities:", err)
      } finally {
        setLoadingActivities(false)
      }
    }

    loadActivities()
  }, [tenantId])

  const handleUpdate = async () => {
    if (!tenant || !formData.fullName || !formData.phone) {
      toast({
        title: "Error",
        description: "Full name and phone are required",
        variant: "destructive",
      })
      return
    }

    try {
      const updated = await updateTenant(tenant.id, formData)
      setTenant(updated)
      setEditDialogOpen(false)
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

  const getActivityIcon = (type: string) => {
    switch (type) {
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

  const getActivityLabel = (type: string) => {
    switch (type) {
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
        return type
    }
  }

  if (isLoading) {
    return (
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !tenant) {
    return (
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-destructive">{error || "Tenant not found"}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 p-3 sm:p-4 lg:p-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tenant Details</h1>
              <p className="text-sm text-muted-foreground">View and manage tenant information</p>
            </div>
          </div>
          <Button onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Tenant
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Tenant Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Tenant Information</CardTitle>
                  <div>{getStatusBadge(tenant.status)}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                    <p className="text-sm font-medium">{tenant.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="text-sm flex items-center gap-2">
                      {tenant.email ? (
                        <>
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {tenant.email}
                        </>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {tenant.phone}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Applications Count</Label>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      {tenant.applicationsCount || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Last Activity</Label>
                    <p className="text-sm flex items-center gap-2">
                      {tenant.lastActivityAt ? (
                        <>
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {new Date(tenant.lastActivityAt).toLocaleString()}
                        </>
                      ) : (
                        <span className="text-muted-foreground">No activity</span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Created At</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {new Date(tenant.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Updated At</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {new Date(tenant.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            {tenant.applications && tenant.applications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Recent Applications
                  </CardTitle>
                  <CardDescription>Latest property applications from this tenant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tenant.applications.slice(0, 10).map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
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
          </div>

          {/* Right Column */}
          <div className="space-y-6">
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
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No activities found
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{getActivityLabel(activity.type)}</p>
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Total Applications</Label>
                    <p className="text-2xl font-bold">{tenant.applicationsCount || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Total Activities</Label>
                    <p className="text-2xl font-bold">{activities.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
    </main>
  )
}
