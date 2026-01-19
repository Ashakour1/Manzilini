"use client"

import { FormEvent, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Mail, Clock, Send, ExternalLink, User } from "lucide-react"
import { SendEmailDialog } from "@/components/dashboard/send-email-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { getLandlordById, registerLandlord, updateLandlord, verifyLandlord, updateLandlordStatus } from "@/services/landlords.service"

type LandlordFormState = {
  name: string
  email: string
  phone: string
  company_name: string
  address: string
}

const initialFormState: LandlordFormState = {
  name: "",
  email: "",
  phone: "",
  company_name: "",
  address: "",
}

type LandlordCreatePageProps = {
  landlordId?: string
}

export function LandlordCreatePage({ landlordId }: LandlordCreatePageProps) {
  const router = useRouter()
  const params = useParams()
  const paramId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined
  const effectiveLandlordId = landlordId ?? paramId
  const { toast } = useToast()
  const [form, setForm] = useState<LandlordFormState>(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingLandlord, setIsLoadingLandlord] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE")
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [inactiveReason, setInactiveReason] = useState("")
  const [existingRejectionReason, setExistingRejectionReason] = useState<string | null>(null)
  const [existingInactiveReason, setExistingInactiveReason] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [inactiveDialogOpen, setInactiveDialogOpen] = useState(false)
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false)
  const [isSentEmail, setIsSentEmail] = useState(false)
  const [isSentAt, setIsSentAt] = useState<string | null>(null)
  const [creator, setCreator] = useState<{
    id: string
    name: string
    email: string
    role?: string
    image?: string
  } | null>(null)

  const isEdit = Boolean(effectiveLandlordId)

  useEffect(() => {
    if (isEdit && effectiveLandlordId) {
      loadLandlord()
    }
  }, [isEdit, effectiveLandlordId])

  const loadLandlord = async () => {
    if (!effectiveLandlordId) return
    setIsLoadingLandlord(true)
    try {
      const landlord = await getLandlordById(effectiveLandlordId)
      setForm({
        name: landlord.name || "",
        email: landlord.email || "",
        phone: landlord.phone || "",
        company_name: landlord.company_name || "",
        address: landlord.address || "",
      })
      setIsVerified(landlord.isVerified || false)
      setStatus(landlord.status || "ACTIVE")
      setExistingRejectionReason(landlord.rejectionReason || null)
      setExistingInactiveReason(landlord.inactiveReason || null)
      setIsSentEmail(landlord.is_sent_email || false)
      setIsSentAt(landlord.is_sent_at || null)
      setCreator(landlord.creator || null)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load landlord",
        variant: "destructive",
      })
      router.push("/landlords")
    } finally {
      setIsLoadingLandlord(false)
    }
  }

  const handleAccept = async () => {
    if (!effectiveLandlordId) return
    setIsAccepting(true)
    try {
      await verifyLandlord(effectiveLandlordId, true, undefined, password || undefined)
      setIsVerified(true)
      setPassword("")
      setExistingRejectionReason(null)
      toast({
        title: "Success",
        description: "Landlord verified successfully. Email sent!",
      })
      await loadLandlord()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to verify landlord",
        variant: "destructive",
      })
    } finally {
      setIsAccepting(false)
    }
  }

  const handleReject = async () => {
    if (!effectiveLandlordId) return
    setIsRejecting(true)
    try {
      await verifyLandlord(effectiveLandlordId, false, rejectionReason || undefined)
      setIsVerified(false)
      setRejectionReason("")
      setRejectDialogOpen(false)
      toast({
        title: "Success",
        description: "Landlord rejected successfully. Email sent!",
      })
      await loadLandlord()
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
    if (!effectiveLandlordId) return
    
    if (newStatus === "INACTIVE" && status === "ACTIVE") {
      setInactiveDialogOpen(true)
      return
    }

    setIsChangingStatus(true)
    try {
      await updateLandlordStatus(effectiveLandlordId, newStatus, newStatus === "INACTIVE" ? inactiveReason || undefined : undefined)
      setStatus(newStatus)
      setInactiveReason("")
      if (newStatus === "INACTIVE") {
        toast({
          title: "Success",
          description: "Landlord set to inactive. Email sent!",
        })
      } else {
        toast({
          title: "Success",
          description: "Landlord status updated successfully",
        })
      }
      await loadLandlord()
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
    if (!effectiveLandlordId) return
    setIsChangingStatus(true)
    try {
      await updateLandlordStatus(effectiveLandlordId, "INACTIVE", inactiveReason || undefined)
      setStatus("INACTIVE")
      setInactiveReason("")
      setInactiveDialogOpen(false)
      toast({
        title: "Success",
        description: "Landlord set to inactive. Email sent!",
      })
      await loadLandlord()
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

  const handleInputChange = (field: keyof LandlordFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const landlordData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        company_name: form.company_name.trim() || undefined,
        address: form.address.trim() || undefined,
      }

      if (isEdit && effectiveLandlordId) {
        await updateLandlord(effectiveLandlordId, landlordData)
        toast({
          title: "Success",
          description: "Landlord updated successfully",
        })
      } else {
        await registerLandlord(landlordData)
        toast({
          title: "Success",
          description: "Landlord registered successfully",
        })
      }

      router.push("/landlords")
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save landlord",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingLandlord) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Loading landlord...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-3 sm:p-4 lg:p-5">
      <div className="mx-auto max-w-4xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/landlords")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Landlords
        </Button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEdit ? "Edit Landlord" : "Register New Landlord"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isEdit
                ? "Update landlord information"
                : "Add a new landlord to the system"}
            </p>
          </div>
          {isEdit && (
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSendEmailDialogOpen(true)}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Send Email
              </Button>
              <Badge variant={isVerified ? "default" : "secondary"} className="gap-2">
                {isVerified ? (
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
              <Badge variant={status === "ACTIVE" ? "default" : "destructive"} className="gap-2">
                {status === "ACTIVE" ? "Active" : "Inactive"}
              </Badge>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4 rounded-3xl border border-border/80 bg-transparent p-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Basic Information</h2>
              <p className="text-xs text-muted-foreground">Landlord contact details</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={form.company_name}
                onChange={(e) => handleInputChange("company_name", e.target.value)}
                placeholder="ABC Real Estate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Main St, City, State, ZIP"
                rows={3}
              />
            </div>
          </section>

          {isEdit && (
            <>
              <section className="space-y-4 rounded-3xl border border-border/80 bg-transparent p-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Account Status</h2>
                  <p className="text-xs text-muted-foreground">Manage landlord verification and status</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="status">Account Status</Label>
                    <Select value={status} onValueChange={(value: "ACTIVE" | "INACTIVE") => handleStatusChange(value)} disabled={isChangingStatus}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification">Verification Status</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant={isVerified ? "default" : "secondary"} className="gap-2 flex-1 justify-center">
                        {isVerified ? (
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
                  </div>
                </div>

                {!isVerified && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">Temporary Password (Optional)</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Leave empty if not needed"
                      />
                      <p className="text-xs text-muted-foreground">Will be included in the approval email</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleAccept}
                        disabled={isAccepting}
                        className="gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {isAccepting ? "Accepting..." : "Approve & Send Email"}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setRejectDialogOpen(true)}
                        disabled={isRejecting}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {isVerified && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setRejectDialogOpen(true)}
                      disabled={isRejecting}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Unverify (Reject)
                    </Button>
                  </div>
                )}

                {existingRejectionReason && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                        <p className="text-sm text-muted-foreground mt-1">{existingRejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {existingInactiveReason && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive">Inactive Reason:</p>
                        <p className="text-sm text-muted-foreground mt-1">{existingInactiveReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Landlord Creator Information */}
                {isEdit && creator && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Landlord Creator</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{creator.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`mailto:${creator.email}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {creator.email}
                          </a>
                        </div>
                      </div>
                      {creator.role && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</p>
                          <Badge variant="outline" className="mt-1">
                            {creator.role}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Email Tracking Information */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">Email Tracking</h3>
                    {effectiveLandlordId && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/email-logs?landlordId=${effectiveLandlordId}`)}
                        className="gap-2 text-xs"
                      >
                        <Mail className="h-3 w-3" />
                        View Email Logs
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Email Status:</span>
                      </div>
                      {isSentEmail ? (
                        <Badge variant="default" className="gap-1.5 bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                          <Send className="h-3 w-3" />
                          Email Sent
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1.5">
                          <Mail className="h-3 w-3" />
                          Not Sent
                        </Badge>
                      )}
                    </div>
                    {isSentEmail && isSentAt && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Sent At:</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {new Date(isSentAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-border text-foreground" onClick={() => router.push("/landlords")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingLandlord}>
              {isSubmitting ? (isEdit ? "Saving..." : "Registering...") : isEdit ? "Save changes" : "Register Landlord"}
            </Button>
          </div>
        </form>

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
                <p className="text-xs text-muted-foreground">
                  This reason will be included in the email sent to the landlord.
                </p>
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
                <p className="text-xs text-muted-foreground">
                  This reason will be included in the email sent to the landlord.
                </p>
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
        {isEdit && effectiveLandlordId && (
          <SendEmailDialog
            open={sendEmailDialogOpen}
            onOpenChange={setSendEmailDialogOpen}
            recipientEmail={form.email}
            recipientName={form.name}
            landlordId={effectiveLandlordId}
            onSuccess={() => {
              loadLandlord()
              toast({
                title: "Success",
                description: "Email sent successfully!",
              })
            }}
          />
        )}
      </div>
    </main>
  )
}
