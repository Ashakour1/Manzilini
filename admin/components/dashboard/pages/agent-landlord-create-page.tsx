"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { registerLandlord } from "@/services/landlords.service"

type LandlordFormState = {
  name: string
  email: string
  phone: string
  company_name: string
  address: string
  nationality: string
  gender: "MALE" | "FEMALE" | "OTHER"
}

const initialFormState: LandlordFormState = {
  name: "",
  email: "",
  phone: "",
  company_name: "",
  address: "",
  nationality: "",
  gender: "MALE",
}

export function AgentLandlordCreatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState<LandlordFormState>(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        nationality: form.nationality.trim() || undefined,
        gender: form.gender,
      }

      await registerLandlord(landlordData)
      toast({
        title: "Success",
        description: "Landlord registered successfully",
      })

      router.push("/agent/landlords")
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to register landlord",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-3 sm:p-4 lg:p-5">
      <div className="mx-auto max-w-4xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/agent/landlords")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Landlords
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Register New Landlord
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a new landlord to the system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4 rounded-3xl border border-border/80 bg-transparent p-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Basic Information</h2>
              <p className="text-xs text-muted-foreground">Landlord contact details and profile</p>
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

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={form.nationality}
                  onChange={(e) => handleInputChange("nationality", e.target.value)}
                  placeholder="Kenyan, Canadian, ..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={form.gender}
                  onValueChange={(value: "MALE" | "FEMALE" | "OTHER") =>
                    handleInputChange("gender", value)
                  }
                >
                  <SelectTrigger id="gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="border-border text-foreground" 
              onClick={() => router.push("/agent/landlords")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register Landlord"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
