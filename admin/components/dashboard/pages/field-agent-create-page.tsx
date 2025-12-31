"use client"

import { FormEvent, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { getFieldAgentById, createFieldAgent, updateFieldAgent } from "@/services/field-agents.service"

type FieldAgentFormState = {
  name: string
  email: string
  phone: string
}

const initialFormState: FieldAgentFormState = {
  name: "",
  email: "",
  phone: "",
}

type FieldAgentCreatePageProps = {
  agentId?: string
}

export function FieldAgentCreatePage({ agentId }: FieldAgentCreatePageProps) {
  const router = useRouter()
  const params = useParams()
  const paramId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined
  const effectiveAgentId = agentId ?? paramId
  const { toast } = useToast()
  const [form, setForm] = useState<FieldAgentFormState>(initialFormState)
  const [image, setImage] = useState<File | null>(null)
  const [documentImage, setDocumentImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [documentPreview, setDocumentPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingAgent, setIsLoadingAgent] = useState(false)

  const isEdit = Boolean(effectiveAgentId)

  useEffect(() => {
    if (isEdit && effectiveAgentId) {
      loadAgent()
    }
  }, [isEdit, effectiveAgentId])

  const loadAgent = async () => {
    if (!effectiveAgentId) return
    setIsLoadingAgent(true)
    try {
      const agent = await getFieldAgentById(effectiveAgentId)
      setForm({
        name: agent.name || "",
        email: agent.email || "",
        phone: agent.phone || "",
      })
      if (agent.image) {
        setImagePreview(agent.image)
      }
      if (agent.document_image) {
        setDocumentPreview(agent.document_image)
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load field agent",
        variant: "destructive",
      })
      router.push("/field-agents")
    } finally {
      setIsLoadingAgent(false)
    }
  }

  const handleInputChange = (field: keyof FieldAgentFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImage(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleDocumentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setDocumentImage(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setDocumentPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setDocumentPreview(null)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const removeDocumentImage = () => {
    setDocumentImage(null)
    setDocumentPreview(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (isEdit && effectiveAgentId) {
        const agentData = {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          image: image || undefined,
          document_image: documentImage || undefined,
        }
        await updateFieldAgent(effectiveAgentId, agentData)
        toast({
          title: "Success",
          description: "Field agent updated successfully",
        })
      } else {
        const agentData = {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          image: image || undefined,
          document_image: documentImage || undefined,
        }
        await createFieldAgent(agentData)
        toast({
          title: "Success",
          description: "Field agent created successfully",
        })
      }

      router.push("/field-agents")
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save field agent",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingAgent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Loading field agent...</p>
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
          onClick={() => router.push("/field-agents")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Field Agents
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {isEdit ? "Edit Field Agent" : "Add New Field Agent"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isEdit
              ? "Update field agent information"
              : "Add a new field agent to the system"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4 rounded-3xl border border-border/80 bg-transparent p-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Basic Information</h2>
              <p className="text-xs text-muted-foreground">Field agent contact details</p>
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
          </section>

          <section className="space-y-4 rounded-3xl border border-border/80 bg-transparent p-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Profile Image</h2>
              <p className="text-xs text-muted-foreground">Upload a profile picture for the field agent</p>
            </div>

            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="h-32 w-32 rounded-full object-cover border-2 border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 w-32 rounded-full border-2 border-dashed border-border bg-muted/50">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="image">Profile Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, max 10MB
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-border/80 bg-transparent p-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Document Image</h2>
              <p className="text-xs text-muted-foreground">Upload a document image (ID, license, etc.)</p>
            </div>

            <div className="space-y-4">
              {documentPreview ? (
                <div className="relative inline-block">
                  <img
                    src={documentPreview}
                    alt="Document preview"
                    className="h-48 w-full max-w-md rounded-lg object-contain border-2 border-border bg-muted/50"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeDocumentImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 w-full max-w-md rounded-lg border-2 border-dashed border-border bg-muted/50">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="document_image">Document Image</Label>
                <Input
                  id="document_image"
                  type="file"
                  accept="image/*"
                  onChange={handleDocumentImageChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Upload a document image (ID card, license, etc.), max 10MB
                </p>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="border-border text-foreground" 
              onClick={() => router.push("/field-agents")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingAgent}>
              {isSubmitting 
                ? (isEdit ? "Saving..." : "Creating...") 
                : isEdit 
                ? "Save changes" 
                : "Create Field Agent"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}

