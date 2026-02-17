"use client"

import { FormEvent, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTenant, type CreateTenantData } from "@/services/tenants.service"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

type TenantFormState = {
  fullName: string
  email: string
  phone: string
  status: "NEW" | "ACTIVE" | "INACTIVE" | "BLOCKED"
}

const initialFormState: TenantFormState = {
  fullName: "",
  email: "",
  phone: "",
  status: "NEW",
}

export default function CreateTenantPage() {
  const router = useRouter()
  const { user, isLoggedIn } = useAuthStore()
  const { toast } = useToast()
  const [form, setForm] = useState<TenantFormState>(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof TenantFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn || !user?.token) {
      toast({
        title: "Error",
        description: "You must be logged in to create a tenant",
        variant: "destructive",
      })
      return
    }

    if (!form.fullName.trim() || !form.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name and phone are required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const tenantData: CreateTenantData = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        status: form.status,
        // landlordId is optional - backend will automatically get it from user's email
      }

      await createTenant(tenantData, user.token)

      toast({
        title: "Success",
        description: "Tenant created successfully",
      })

      router.push("/landlords/tenants")
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create tenant",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoggedIn) {
    router.push("/")
    return null
  }

  return (
    <div className="p-5 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/landlords/tenants">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Add New Tenant
          </h1>
          <p className="text-sm text-gray-500">
            Create a new tenant profile
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="border-gray-200/80 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Tenant Information</CardTitle>
            <CardDescription className="text-xs">
              Enter the tenant's basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs text-gray-600">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter full name"
                value={form.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
                className="h-9 text-sm"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs text-gray-600">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                className="h-9 text-sm"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-gray-600">
                Email Address (optional)
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs text-gray-600">Status</Label>
              <Select value={form.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger id="status" className="h-9 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#2a6f97] hover:bg-[#235d7f] text-white shadow-sm text-xs"
              >
                {isSubmitting ? "Creating..." : "Create Tenant"}
              </Button>
              <Link href="/landlords/tenants">
                <Button type="button" variant="outline" className="text-xs">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
