"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  User,
  CheckCircle,
  XCircle,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getPropertyApplicationById, updatePropertyApplication, type PropertyApplication } from "@/services/property-applications.service"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function PropertyApplicationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const applicationId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined

  const [application, setApplication] = useState<PropertyApplication | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState<string>("")
  const [updateRemarks, setUpdateRemarks] = useState<string>("")
  const [updateEmailSent, setUpdateEmailSent] = useState<boolean>(false)
  const [updateIsCommunicated, setUpdateIsCommunicated] = useState<boolean>(false)
  const [updateViewingRequested, setUpdateViewingRequested] = useState<boolean>(false)
  const [updateViewingDate, setUpdateViewingDate] = useState<string>("")

  useEffect(() => {
    if (!applicationId) return

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getPropertyApplicationById(applicationId)
        setApplication(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load application")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load application",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [applicationId, toast])

  const handleUpdateClick = () => {
    if (!application) return
    setUpdateStatus(application.status)
    setUpdateRemarks(application.remarks || "")
    setUpdateEmailSent(application.emailSent || false)
    setUpdateIsCommunicated(application.isCommunicated || false)
    setUpdateViewingRequested(application.viewingRequested || false)
    setUpdateViewingDate(application.viewingDate ? new Date(application.viewingDate).toISOString().split('T')[0] : "")
    setUpdateDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!application || !updateStatus) return

    setUpdatingId(application.id)
    try {
      const updated = await updatePropertyApplication(
        application.id,
        updateStatus,
        updateRemarks || undefined,
        updateEmailSent,
        updateEmailSent ? new Date().toISOString() : undefined,
        updateIsCommunicated,
        updateIsCommunicated ? new Date().toISOString() : undefined,
        updateViewingRequested,
        updateViewingDate || undefined
      )
      setApplication(updated)
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
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !application) {
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
              <p className="text-destructive">{error || "Application not found"}</p>
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
              <h1 className="text-2xl font-bold text-foreground">Application Details</h1>
              <p className="text-sm text-muted-foreground">View and manage application information</p>
            </div>
          </div>
          <Button onClick={handleUpdateClick}>
            <Edit className="mr-2 h-4 w-4" />
            Update Status
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Application Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Application Overview</CardTitle>
                  <div>{getStatusBadge(application.status)}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Application ID</Label>
                    <p className="text-sm font-mono">{application.id}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Submitted</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {new Date(application.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Last Updated</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {new Date(application.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  {application.statusChangedAt && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Status Changed At</Label>
                      <p className="text-sm flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {new Date(application.statusChangedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Applicant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Applicant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                    <p className="text-sm font-medium">{application.fullName}</p>
                  </div>
                  {application.tenant && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Tenant Status</Label>
                      <Badge variant="outline">{application.tenant.status}</Badge>
                    </div>
                  )}
                  {application.email && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="text-sm flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {application.email}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {application.phone}
                    </p>
                  </div>
                  {application.message && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Message from Applicant</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm whitespace-pre-wrap">{application.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Property Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {application.property ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Property Title</Label>
                      <p className="text-sm font-medium">{application.property.title}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Address</Label>
                        <p className="text-sm">{application.property.address}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">City</Label>
                        <p className="text-sm">{application.property.city}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Price</Label>
                        <p className="text-sm font-medium">
                          {application.property.price?.toLocaleString()} {application.property.property_type}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Property Status</Label>
                        <Badge variant="outline">{application.property.status}</Badge>
                      </div>
                    </div>
                    {application.property.description && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {application.property.description}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Property information not available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Landlord Information */}
            {application.landlord && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Landlord Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="text-sm font-medium">{application.landlord.name}</p>
                    </div>
                    {application.landlord.email && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <p className="text-sm flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {application.landlord.email}
                        </p>
                      </div>
                    )}
                    {application.landlord.phone && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <p className="text-sm flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {application.landlord.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Communication Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2 p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Email Sent</Label>
                      <Badge variant={application.emailSent ? "default" : "secondary"}>
                        {application.emailSent ? "Yes" : "No"}
                      </Badge>
                    </div>
                    {application.emailSentAt && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(application.emailSentAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Communicated</Label>
                      <Badge variant={application.isCommunicated ? "default" : "secondary"}>
                        {application.isCommunicated ? "Yes" : "No"}
                      </Badge>
                    </div>
                    {application.communicatedAt && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(application.communicatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Viewing Requested</Label>
                      <Badge variant={application.viewingRequested ? "default" : "secondary"}>
                        {application.viewingRequested ? "Yes" : "No"}
                      </Badge>
                    </div>
                    {application.viewingDate && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(application.viewingDate).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Remarks & Notes */}
            {application.remarks && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Remarks & Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{application.remarks}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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
              <Label className="text-sm font-medium">Status</Label>
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
              <Label className="text-sm font-medium">Remarks (Optional)</Label>
              <Textarea
                value={updateRemarks}
                onChange={(e) => setUpdateRemarks(e.target.value)}
                placeholder="Add any remarks or notes..."
                rows={4}
              />
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
                  <Label className="text-sm font-medium">Viewing Date</Label>
                  <input
                    type="datetime-local"
                    value={updateViewingDate}
                    onChange={(e) => setUpdateViewingDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
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
    </main>
  )
}
