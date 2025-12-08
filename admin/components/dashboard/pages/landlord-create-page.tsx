"use client"

import { FormEvent, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { getLandlordById, registerLandlord, updateLandlord } from "@/services/landlords.service"

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
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/landlords")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Landlords
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {isEdit ? "Edit Landlord" : "Register New Landlord"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isEdit
              ? "Update landlord information"
              : "Add a new landlord to the system"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-6 rounded-3xl border border-border/80 bg-transparent p-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
              <p className="text-sm text-muted-foreground">Landlord contact details</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-border text-foreground" onClick={() => router.push("/landlords")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingLandlord}>
              {isSubmitting ? (isEdit ? "Saving..." : "Registering...") : isEdit ? "Save changes" : "Register Landlord"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
