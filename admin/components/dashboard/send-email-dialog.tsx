"use client"

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { sendManualEmail, sendEmailToLandlord, sendEmailToUser, type SendEmailRequest } from "@/services/email.service"
import { Loader2, Send, Mail } from "lucide-react"

interface SendEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipientEmail?: string
  recipientName?: string
  landlordId?: string
  userId?: string
  onSuccess?: () => void
}

export function SendEmailDialog({
  open,
  onOpenChange,
  recipientEmail: initialEmail,
  recipientName: initialName,
  landlordId,
  userId,
  onSuccess,
}: SendEmailDialogProps) {
  const { toast } = useToast()
  const [isSending, setIsSending] = useState(false)
  const [formData, setFormData] = useState({
    recipientEmail: initialEmail || "",
    recipientName: initialName || "",
    subject: "",
    message: "",
    emailType: "NOTIFICATION" as SendEmailRequest["emailType"],
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSending(true)

    try {
      if (landlordId) {
        // Send to landlord
        await sendEmailToLandlord(landlordId, {
          subject: formData.subject,
          message: formData.message,
          emailType: formData.emailType,
        })
      } else if (userId) {
        // Send to user
        await sendEmailToUser(userId, {
          subject: formData.subject,
          message: formData.message,
          emailType: formData.emailType,
        })
      } else {
        // Manual send
        await sendManualEmail({
          recipientEmail: formData.recipientEmail,
          recipientName: formData.recipientName || undefined,
          subject: formData.subject,
          message: formData.message,
          emailType: formData.emailType,
        })
      }

      toast({
        title: "Success",
        description: "Email sent successfully!",
      })

      // Reset form
      setFormData({
        recipientEmail: initialEmail || "",
        recipientName: initialName || "",
        subject: "",
        message: "",
        emailType: "NOTIFICATION",
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#2a6f97]" />
            Send Email
          </DialogTitle>
          <DialogDescription>
            {landlordId
              ? "Send an email to this landlord"
              : userId
              ? "Send an email to this user"
              : "Compose and send an email"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {!landlordId && !userId && (
            <>
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">
                  Recipient Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, recipientEmail: e.target.value }))
                  }
                  placeholder="recipient@example.com"
                  required
                  disabled={isSending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name (Optional)</Label>
                <Input
                  id="recipientName"
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, recipientName: e.target.value }))
                  }
                  placeholder="John Doe"
                  disabled={isSending}
                />
              </div>
            </>
          )}

          {landlordId && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-[#2a6f97]" />
                <span className="font-medium">Recipient:</span>
                <span className="text-muted-foreground">
                  {initialName} ({initialEmail})
                </span>
              </div>
            </div>
          )}

          {userId && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-[#2a6f97]" />
                <span className="font-medium">Recipient:</span>
                <span className="text-muted-foreground">
                  {initialName} ({initialEmail})
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subject: e.target.value }))
              }
              placeholder="Email subject"
              required
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailType">Email Type</Label>
            <Select
              value={formData.emailType}
              onValueChange={(value: SendEmailRequest["emailType"]) =>
                setFormData((prev) => ({ ...prev, emailType: value }))
              }
              disabled={isSending}
            >
              <SelectTrigger id="emailType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NOTIFICATION">Notification</SelectItem>
                <SelectItem value="WELCOME">Welcome</SelectItem>
                <SelectItem value="PASSWORD_RESET">Password Reset</SelectItem>
                <SelectItem value="VERIFICATION">Verification</SelectItem>
                <SelectItem value="LANDLORD_APPROVAL">Landlord Approval</SelectItem>
                <SelectItem value="LANDLORD_REJECTION">Landlord Rejection</SelectItem>
                <SelectItem value="LANDLORD_INACTIVE">Landlord Inactive</SelectItem>
                <SelectItem value="TENANT_REQUEST">Tenant Request</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Enter your email message (HTML supported)"
              rows={12}
              required
              disabled={isSending}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              HTML is supported. You can use HTML tags to format your email.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSending} className="gap-2">
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
