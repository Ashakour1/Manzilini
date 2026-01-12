"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { useState, FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { registerLandlord, LandlordRegistrationData } from "@/services/landlords.service"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LandlordRegisterPage() {
  const [formData, setFormData] = useState<LandlordRegistrationData>({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    address: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (submitStatus === "error") {
      setSubmitStatus("idle")
      setErrorMessage("")
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.email.trim()) {
        setErrorMessage("Name and email are required fields")
        setSubmitStatus("error")
        setIsSubmitting(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setErrorMessage("Please enter a valid email address")
        setSubmitStatus("error")
        setIsSubmitting(false)
        return
      }

      await registerLandlord({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        company_name: formData.company_name?.trim() || undefined,
        address: formData.address?.trim() || undefined,
      })

      setSubmitStatus("success")
      setFormData({ name: "", email: "", phone: "", company_name: "", address: "" })
    
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to register. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-18">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/">
            <Image src="/icon-logo.png" alt="Manzilini" width={100} height={100} />
          </Link>
        </div>

        {/* Title and Subtitle */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h1>
          <p className="text-sm text-gray-600">
            Focus on your business. Let Manzilini build your property portfolio.
          </p>
        </div>

        {submitStatus === "success" ? (
          <Card className="border-none shadow-none">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Registration Successful!
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    Thank you for registering as a landlord with Manzilini.
                  </p>
                  <p className="text-sm text-gray-600">
                    We'll review your application and contact you as soon as possible.
                  </p>
                </div>

                <div className="pt-6 space-y-4">
                  <div className="flex flex-col gap-4">
                    <Button
                      asChild
                      size="lg"
                      className="gap-2"
                    >
                      <Link href="/">
                        <ArrowRight className="w-5 h-5 rotate-180" />
                        Back to Home
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="gap-2"
                    >
                      <Link href="/properties">
                        Browse Properties
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {submitStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {/* Name Field */}
             <div className="grid gap-3 md:grid-cols-2">
             <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  disabled={isSubmitting}
                />
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-sm font-medium text-gray-700">
                  Business name
                </Label>
                <Input
                  id="company_name"
                  name="company_name"
                  type="text"
                  placeholder="Acme"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  disabled={isSubmitting}
                />
              </div>
             </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Address Field */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="123 Main Street, Nairobi, Kenya"
                    value={formData.address}
                    onChange={handleChange}
                    className="pl-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating account..." : "Create account"}
                </Button>
              </div>

              {/* Login Link */}
              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/contact" className="text-gray-900 hover:underline font-medium">
                  Contact us
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
