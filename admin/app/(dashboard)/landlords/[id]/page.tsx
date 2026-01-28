"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
  User,
  UserCheck,
  UserX,
  Calendar,
  Send,
  ExternalLink,
  AlertCircle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getLandlordById, verifyLandlord, updateLandlordStatus } from "@/services/landlords.service"
import { useToast } from "@/components/ui/use-toast"
import { SendEmailDialog } from "@/components/dashboard/send-email-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Landlord = {
  id: string
  name: string
  email: string
  phone?: string
  company_name?: string
  address?: string
  isVerified?: boolean
  status?: "ACTIVE" | "INACTIVE"
  rejectionReason?: string | null
  inactiveReason?: string | null
  is_sent_email?: boolean
  is_sent_at?: string | null
  createdAt?: string
  updatedAt?: string
  properties?: {
    id: string
    title: string
    status: string
    images?: { url: string }[]
  }[]
  creator?: {
    id: string
    name: string
    email: string
    role?: string
    image?: string
  } | null
  documents?: {
    id: string
    documentType?: string | null
    documentImage?: string | null
    url?: string | null
    notes?: string | null
    uploadedAt?: string
  }[]
}

type LandlordDocument = {
  id: string
  documentType?: string | null
  documentImage?: string | null
  url?: string | null
  notes?: string | null
  uploadedAt?: string
}

export default function LandlordDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const landlordId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined

  const [landlord, setLandlord] = useState<Landlord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [inactiveReason, setInactiveReason] = useState("")
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [inactiveDialogOpen, setInactiveDialogOpen] = useState(false)
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<LandlordDocument | null>(null)
  const [documentModalOpen, setDocumentModalOpen] = useState(false)

  useEffect(() => {
    if (!landlordId) return

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getLandlordById(landlordId)
        setLandlord(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load landlord")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load landlord",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [landlordId, toast])

  const handleAccept = async () => {
    if (!landlord) return
    setIsAccepting(true)
    try {
      await verifyLandlord(landlord.id, true)
      setLandlord({ ...landlord, isVerified: true })
      toast({
        title: "Success",
        description: "Landlord approved successfully",
      })
      // Reload to get updated data
      const data = await getLandlordById(landlord.id)
      setLandlord(data)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to approve landlord",
        variant: "destructive",
      })
    } finally {
      setIsAccepting(false)
    }
  }

  const handleReject = async () => {
    if (!landlord) return
    setIsRejecting(true)
    try {
      await verifyLandlord(landlord.id, false, rejectionReason || undefined)
      setLandlord({ ...landlord, isVerified: false, rejectionReason: rejectionReason || null })
      setRejectDialogOpen(false)
      setRejectionReason("")
      toast({
        title: "Success",
        description: "Landlord rejected successfully",
      })
      // Reload to get updated data
      const data = await getLandlordById(landlord.id)
      setLandlord(data)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to reject landlord",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  const handleStatusChange = async (newStatus: "ACTIVE" | "INACTIVE") => {
    if (!landlord) return
    setIsChangingStatus(true)
    try {
      await updateLandlordStatus(landlord.id, newStatus, inactiveReason || undefined)
      setLandlord({ ...landlord, status: newStatus, inactiveReason: inactiveReason || null })
      if (newStatus === "INACTIVE") {
        setInactiveDialogOpen(false)
        setInactiveReason("")
      }
      toast({
        title: "Success",
        description: `Landlord status updated to ${newStatus} successfully`,
      })
      // Reload to get updated data
      const data = await getLandlordById(landlord.id)
      setLandlord(data)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update landlord status",
        variant: "destructive",
      })
    } finally {
      setIsChangingStatus(false)
    }
  }

  const handleInactiveConfirm = async () => {
    await handleStatusChange("INACTIVE")
  }

  if (isLoading) {
    return (
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Skeleton className="h-10 w-32" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
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

  if (error || !landlord) {
    return (
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="px-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error || "Landlord not found"}</p>
          </div>
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
            <Button variant="ghost" size="sm" onClick={() => router.push("/landlords")} className="px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{landlord.name}</h1>
              <p className="text-sm text-muted-foreground">Landlord details and information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push(`/landlords/${landlord.id}/edit`)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>Landlord contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{landlord.name}</p>
                  </div>
                  {landlord.company_name && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Company</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{landlord.company_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${landlord.email}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {landlord.email}
                      </a>
                    </div>
                  </div>
                  {landlord.phone && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`tel:${landlord.phone}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {landlord.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {landlord.address && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Address</p>
                      <div className="mt-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">{landlord.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Properties Card */}
            {landlord.properties && landlord.properties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Properties</CardTitle>
                  <CardDescription>Properties managed by this landlord</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {landlord.properties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/properties/${property.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          {property.images && property.images.length > 0 ? (
                            <img
                              src={property.images[0].url}
                              alt={property.title}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">{property.title}</p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {property.status}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents Card */}
            {landlord.documents && landlord.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Uploaded landlord documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {landlord.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {doc.documentType || "Document"}
                          </p>
                          {doc.notes && (
                            <p className="text-xs text-muted-foreground">
                              {doc.notes}
                            </p>
                          )}
                          {doc.uploadedAt && (
                            <p className="text-[11px] text-muted-foreground">
                              Uploaded{" "}
                              {new Date(doc.uploadedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                        {doc.documentImage && (
                          <button
                            type="button"
                            className="ml-4 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary"
                            onClick={() => {
                              setSelectedDocument(doc)
                              setDocumentModalOpen(true)
                            }}
                          >
                            <img
                              src={doc.documentImage}
                              alt={doc.documentType || "Document image"}
                              className="h-20 w-20 rounded-md object-cover"
                            />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Actions</CardTitle>
                <CardDescription>Manage landlord account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Verification Status</p>
                  <Badge variant={landlord.isVerified ? "default" : "secondary"} className="gap-2">
                    {landlord.isVerified ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        Not Verified
                      </>
                    )}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account Status</p>
                  {landlord.status === "ACTIVE" ? (
                    <Badge className="gap-2 bg-green-50 text-green-700 border border-green-100 dark:bg-green-950 dark:text-green-300">
                      <UserCheck className="h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-2 bg-gray-50 text-gray-700 border border-gray-100 dark:bg-gray-950 dark:text-gray-300">
                      <UserX className="h-3 w-3" />
                      Inactive
                    </Badge>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Quick Actions</p>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSendEmailDialogOpen(true)}
                      className="gap-2 w-full"
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                      Send Email
                    </Button>
                    {!landlord.isVerified && (
                      <Button
                        type="button"
                        onClick={handleAccept}
                        disabled={isAccepting}
                        className="gap-2 w-full"
                        size="sm"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {isAccepting ? "Approving..." : "Approve"}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setRejectDialogOpen(true)}
                      disabled={isRejecting}
                      className="gap-2 w-full"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4" />
                      {landlord.isVerified ? "Unverify" : "Reject"}
                    </Button>
                    <Button
                      type="button"
                      variant={landlord.status === "ACTIVE" ? "destructive" : "default"}
                      onClick={() => {
                        if (landlord.status === "ACTIVE") {
                          setInactiveDialogOpen(true)
                        } else {
                          handleStatusChange("ACTIVE")
                        }
                      }}
                      disabled={isChangingStatus}
                      className="gap-2 w-full"
                      size="sm"
                    >
                      {isChangingStatus ? (
                        "Updating..."
                      ) : landlord.status === "ACTIVE" ? (
                        <>
                          <XCircle className="h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {landlord.rejectionReason && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-destructive">Rejection Reason:</p>
                        <p className="text-xs text-muted-foreground mt-1">{landlord.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {landlord.inactiveReason && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-destructive">Inactive Reason:</p>
                        <p className="text-xs text-muted-foreground mt-1">{landlord.inactiveReason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Landlord Creator Information */}
            {landlord.creator && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Landlord Creator
                  </CardTitle>
                  <CardDescription>User who created this landlord</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{landlord.creator.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${landlord.creator.email}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {landlord.creator.email}
                      </a>
                    </div>
                  </div>
                  {landlord.creator.role && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</p>
                      <Badge variant="outline" className="mt-1">
                        {landlord.creator.role}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Landlord Actions & Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Landlord Actions
                </CardTitle>
                <CardDescription>Timestamps and activity history</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {landlord.createdAt && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        {new Date(landlord.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {landlord.updatedAt && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last Updated</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        {new Date(landlord.updatedAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}
                {landlord.is_sent_email && landlord.is_sent_at && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email Sent</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Send className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        {new Date(landlord.is_sent_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}
                <Separator />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Properties Count</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      {landlord.properties?.length || 0} properties
                    </p>
                  </div>
                </div>
                {landlordId && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/email-logs?landlordId=${landlordId}`)}
                      className="gap-2 w-full text-xs"
                    >
                      <Mail className="h-3 w-3" />
                      View Email Logs
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verification</span>
                  </div>
                  <Badge variant={landlord.isVerified ? "default" : "secondary"} className="ml-6">
                    {landlord.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {landlord.status === "ACTIVE" ? (
                      <UserCheck className="h-3.5 w-3.5" />
                    ) : (
                      <UserX className="h-3.5 w-3.5" />
                    )}
                    <span>Status</span>
                  </div>
                  {landlord.status === "ACTIVE" ? (
                    <Badge className="ml-6 bg-green-50 text-green-700 border border-green-100 dark:bg-green-950 dark:text-green-300">
                      <UserCheck className="mr-1 h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="ml-6 bg-gray-50 text-gray-700 border border-gray-100 dark:bg-gray-950 dark:text-gray-300">
                      <UserX className="mr-1 h-3 w-3" />
                      Inactive
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Email Tracking Information */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span>Email Status</span>
                    </div>
                    {landlord.is_sent_email ? (
                      <Badge variant="default" className="gap-1.5 bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                        <Send className="h-3 w-3" />
                        Sent
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1.5">
                        <Mail className="h-3 w-3" />
                        Not Sent
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Document Preview Dialog */}
      {selectedDocument && (
        <Dialog
          open={documentModalOpen}
          onOpenChange={(open) => {
            setDocumentModalOpen(open)
            if (!open) setSelectedDocument(null)
          }}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{selectedDocument.documentType || "Document"}</DialogTitle>
              {selectedDocument.uploadedAt && (
                <DialogDescription>
                  Uploaded{" "}
                  {new Date(selectedDocument.uploadedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="space-y-3">
              {selectedDocument.documentImage && (
                <img
                  src={selectedDocument.documentImage}
                  alt={selectedDocument.documentType || "Document image"}
                  className="w-full max-h-[70vh] rounded-md object-contain border"
                />
              )}
              {selectedDocument.notes && (
                <p className="text-sm text-muted-foreground">{selectedDocument.notes}</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Landlord</DialogTitle>
            <DialogDescription>
              Rejecting this landlord will unverify their account and send them an email notification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason (Optional)</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false)
                setRejectionReason("")
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting}
            >
              {isRejecting ? "Rejecting..." : "Reject & Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inactive Dialog */}
      <Dialog open={inactiveDialogOpen} onOpenChange={setInactiveDialogOpen}>
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
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setInactiveDialogOpen(false)
                setInactiveReason("")
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleInactiveConfirm}
              disabled={isChangingStatus}
            >
              {isChangingStatus ? "Updating..." : "Set Inactive & Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      {landlordId && (
        <SendEmailDialog
          open={sendEmailDialogOpen}
          onOpenChange={setSendEmailDialogOpen}
          recipientEmail={landlord.email}
          recipientName={landlord.name}
          landlordId={landlordId}
          onSuccess={() => {
            const load = async () => {
              try {
                const data = await getLandlordById(landlordId)
                setLandlord(data)
              } catch (err) {
                console.error("Failed to reload landlord:", err)
              }
            }
            load()
            toast({
              title: "Success",
              description: "Email sent successfully!",
            })
          }}
        />
      )}
    </main>
  )
}
