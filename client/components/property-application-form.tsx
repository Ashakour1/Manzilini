"use client"

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
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
  onSuccess 
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
      // Validate required fields
      if (!formData.fullName.trim() || !formData.phone.trim()) {
        setErrorMessage("Full name and phone number are required")
        setSubmitStatus("error")
        setIsSubmitting(false)
        return
      }

      // Validate phone format (basic validation)
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
      if (!phoneRegex.test(formData.phone.trim())) {
        setErrorMessage("Please enter a valid phone number")
        setSubmitStatus("error")
        setIsSubmitting(false)
        return
      }

      // Validate email format if provided
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

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000)
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit inquiry. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 p-6 shadow-none">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Inquire about this Property</h3>
        {propertyTitle && (
          <p className="text-sm text-gray-600">{propertyTitle}</p>
        )}
      </div>

      {submitStatus === "success" ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Inquiry Submitted!</h4>
          <p className="text-sm text-gray-600">
            Your inquiry has been submitted successfully. The landlord will review it and get back to you soon.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitStatus === "error" && errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="+254 700 000 000"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Tell the landlord why you're interested in this property..."
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-blue-700 text-white py-3 text-base font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Inquiry"
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By submitting, you agree to be contacted by the landlord regarding this property.
          </p>
        </form>
      )}
    </div>
  )
}
