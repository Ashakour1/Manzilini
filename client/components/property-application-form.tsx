"use client"

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, User, MessageSquare, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface PropertyApplicationFormProps {
  propertyId: string
  landlordId: string
  propertyTitle?: string
  onSuccess?: () => void
}

export default function PropertyApplicationForm({
  propertyId,
  landlordId,
  propertyTitle,
  onSuccess,
}: PropertyApplicationFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      if (!formData.fullName.trim() || !formData.phone.trim()) {
        setErrorMessage("Full name and phone number are required")
        setSubmitStatus("error")
        setIsSubmitting(false)
        return
      }

      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
      if (!phoneRegex.test(formData.phone.trim())) {
        setErrorMessage("Please enter a valid phone number")
        setSubmitStatus("error")
        setIsSubmitting(false)
        return
      }

      if (formData.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email.trim())) {
          setErrorMessage("Please enter a valid email address")
          setSubmitStatus("error")
          setIsSubmitting(false)
          return
        }
      }

      const { createPropertyApplication } = await import("@/services/property-applications.service")

      await createPropertyApplication({
        propertyId,
        landlordId,
        fullName: formData.fullName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        message: formData.message.trim() || undefined,
      })

      setSubmitStatus("success")
      setFormData({ fullName: "", email: "", phone: "", message: "" })

      if (onSuccess) {
        onSuccess()
      }

      setTimeout(() => setSubmitStatus("idle"), 5000)
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit inquiry. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border-none bg-card p-4 shadow-none shadow-primary/5">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Contact About This Property
        </h3>
        {propertyTitle && <p className="text-sm text-muted-foreground line-clamp-1">{propertyTitle}</p>}
      </div>

      {submitStatus === "success" ? (
        <div className="text-center py-8">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h4 className="text-base font-semibold text-foreground mb-2">Inquiry Submitted!</h4>
          <p className="text-sm text-muted-foreground">
            The landlord will review your inquiry and get back to you soon.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitStatus === "error" && errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="h-11 pl-10 rounded-lg"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="h-11 pl-10 rounded-lg"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="h-11 pl-10 rounded-lg"
                placeholder="+254 700 000 000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                className="min-h-[80px] pl-10 rounded-lg resize-none"
                placeholder="I'm interested in this property..."
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 font-medium shadow-md transition-all hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Inquiry"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By submitting, you agree to be contacted regarding this property.
          </p>
        </form>
      )}
    </div>
  )
}
