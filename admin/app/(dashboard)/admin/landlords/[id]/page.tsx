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
  FileText,
  Shield,
  Hash,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Landlord = {
  id: string
  name: string
  email: string
  phone?: string
  company_name?: string
  address?: string
  nationality?: string | null
  remarks?: string | null
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

export default function AdminLandlordDetailsPage() {
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

  if (error || !landlord) {
    return (
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/landlords")} className="px-0">
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/landlords")} className="px-0">
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
            <Button variant="outline" onClick={() => router.push(`/admin/landlords/${landlord.id}/edit`)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
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
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Company</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{landlord.company_name || "N/A"}</p>
                  </div>
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
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {landlord.phone ? (
                        <a
                          href={`tel:${landlord.phone}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {landlord.phone}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-muted-foreground">N/A</p>
                      )}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Address</p>
                    <div className="mt-1 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">{landlord.address || "N/A"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Nationality</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{landlord.nationality || "N/A"}</p>
                  </div>
                  {landlord.remarks && (
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Remarks</p>
                      <p className="mt-1 text-sm font-medium text-foreground">{landlord.remarks}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verification & Status
                </CardTitle>
                <CardDescription>Landlord verification and account status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Verification Status</p>
                    <Badge 
                      variant={landlord.isVerified ? "default" : "secondary"} 
                      className={landlord.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                    >
                      {landlord.isVerified ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Not Verified
                        </span>
                      )}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Account Status</p>
                    <Badge 
                      variant={landlord.status === "ACTIVE" ? "default" : "secondary"} 
                      className={landlord.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {landlord.status === "ACTIVE" ? (
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <UserX className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </Badge>
                  </div>
                </div>
                {landlord.rejectionReason && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Rejection Reason</p>
                    <p className="text-sm text-foreground bg-red-50 border border-red-200 rounded-md p-3">{landlord.rejectionReason}</p>
                  </div>
                )}
                {landlord.inactiveReason && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Inactive Reason</p>
                    <p className="text-sm text-foreground bg-yellow-50 border border-yellow-200 rounded-md p-3">{landlord.inactiveReason}</p>
                  </div>
                )}
                {landlord.is_sent_email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Send className="h-4 w-4" />
                    <span>Email sent {landlord.is_sent_at ? new Date(landlord.is_sent_at).toLocaleDateString() : ""}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {landlord.documents && landlord.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
                  </CardTitle>
                  <CardDescription>Uploaded documents and files</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {landlord.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{doc.documentType || "Document"}</p>
                            {doc.notes && (
                              <p className="text-xs text-muted-foreground">{doc.notes}</p>
                            )}
                            {doc.uploadedAt && (
                              <p className="text-xs text-muted-foreground">
                                Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedDocument(doc)
                            setDocumentModalOpen(true)
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {landlord.creator && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Created By
                  </CardTitle>
                  <CardDescription>User who created this landlord record</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    {landlord.creator.image ? (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={landlord.creator.image} alt={landlord.creator.name} />
                        <AvatarFallback>{landlord.creator.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{landlord.creator.name}</p>
                      <p className="text-sm text-muted-foreground">{landlord.creator.email}</p>
                      {landlord.creator.role && (
                        <Badge variant="outline" className="mt-1 text-xs">{landlord.creator.role}</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>Properties managed by this landlord</CardDescription>
              </CardHeader>
              <CardContent>
                {landlord.properties && landlord.properties.length > 0 ? (
                  <div className="space-y-3">
                    {landlord.properties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/properties/${property.id}`)}
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
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No properties found</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>Account creation and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {landlord.createdAt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Created</span>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-6">
                      {new Date(landlord.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
                {landlord.updatedAt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Last Updated</span>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-6">
                      {new Date(landlord.updatedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Hash className="h-3.5 w-3.5" />
                    <span>Landlord ID</span>
                  </div>
                  <p className="text-sm font-mono text-foreground pl-6 break-all">{landlord.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Document View Modal */}
      <Dialog open={documentModalOpen} onOpenChange={setDocumentModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.documentType || "Document"}</DialogTitle>
            <DialogDescription>
              {selectedDocument?.notes || "View document details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDocument?.documentImage && (
              <div className="w-full">
                <img
                  src={selectedDocument.documentImage}
                  alt={selectedDocument.documentType || "Document"}
                  className="w-full h-auto rounded-lg border"
                />
              </div>
            )}
            {selectedDocument?.url && !selectedDocument?.documentImage && (
              <div className="w-full">
                <iframe
                  src={selectedDocument.url}
                  className="w-full h-[600px] rounded-lg border"
                  title={selectedDocument.documentType || "Document"}
                />
              </div>
            )}
            {selectedDocument?.uploadedAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Uploaded: {new Date(selectedDocument.uploadedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            {selectedDocument?.url && (
              <div className="flex justify-end">
                <Button variant="outline" asChild>
                  <a href={selectedDocument.url} target="_blank" rel="noopener noreferrer">
                    Open in New Tab
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
