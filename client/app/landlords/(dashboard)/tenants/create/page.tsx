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
import { getLandlordIdFromProperties } from "@/services/landlords.service"
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
  const [landlordId, setLandlordId] = useState<string | null>(null)
  const [isLoadingLandlordId, setIsLoadingLandlordId] = useState(true)

  useEffect(() => {
    const fetchLandlordId = async () => {
      if (!isLoggedIn || !user?.token) return
      setIsLoadingLandlordId(true)
      try {
        const id = await getLandlordIdFromProperties(user.token)
        setLandlordId(id)
      } catch (err) {
        console.error("Failed to get landlord ID:", err)
      } finally {
        setIsLoadingLandlordId(false)
      }
    }
    fetchLandlordId()
  }, [isLoggedIn, user?.token])

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

    if (!landlordId) {
      toast({
        title: "Error",
        description: "Unable to identify your landlord profile",
        variant: "destructive",
      })
      return
    }

    try {
      const tenantData: CreateTenantData = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        status: form.status,
        landlordId: landlordId,
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
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/landlords/tenants">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Tenant</h1>
            <p className="text-sm text-gray-500 mt-1">Create a new tenant profile</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Tenant Information</CardTitle>
              <CardDescription>Enter the tenant's basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter full name"
                  value={form.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger id="status">
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
                  disabled={isSubmitting || isLoadingLandlordId || !landlordId}
                  className="flex-1 sm:flex-none"
                >
                  {isSubmitting ? "Creating..." : isLoadingLandlordId ? "Loading..." : "Create Tenant"}
                </Button>
                <Link href="/landlords/tenants">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
