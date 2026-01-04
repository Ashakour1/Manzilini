"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createUser } from "@/services/users.service"
import { getFieldAgents } from "@/services/field-agents.service"

type UserFormState = {
  name: string
  email: string
  password: string
  role: string
  agentId: string | null
}

const initialFormState: UserFormState = {
  name: "",
  email: "",
  password: "",
  role: "USER",
  agentId: null,
}

export function UserCreatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState<UserFormState>(initialFormState)
  const [fieldAgents, setFieldAgents] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingAgents, setIsLoadingAgents] = useState(false)

  useEffect(() => {
    loadFieldAgents()
  }, [])

  const loadFieldAgents = async () => {
    setIsLoadingAgents(true)
    try {
      const agents = await getFieldAgents()
      setFieldAgents(agents || [])
    } catch (err) {
      console.error("Failed to load field agents:", err)
    } finally {
      setIsLoadingAgents(false)
    }
  }

  const generatePassword = () => {
    const password = Math.random().toString(36).substring(2, 15);
    setForm((prev) => ({ ...prev, password }))
    toast({
      title: "Success",
      description: "Password generated successfully",
    })
  }

  const handleInputChange = (field: keyof UserFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleAgentChange = (value: string) => {
    const selectedAgentId = value === "none" ? null : value
    const selectedAgent = fieldAgents.find(a => a.id === selectedAgentId)
    setForm((prev) => ({
      ...prev,
      agentId: selectedAgentId,
      name: selectedAgent ? selectedAgent.name : prev.name,
      email: selectedAgent ? selectedAgent.email : prev.email
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        agentId: form.agentId,
      })
      toast({
        title: "Success",
        description: "User created successfully",
      })
      router.push("/users")
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create user",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background p-3 sm:p-4 lg:p-5">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/users")}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Create New User</h1>
            <p className="text-xs text-muted-foreground mt-1">Add a new user to the system with appropriate permissions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-4 rounded-3xl border border-border/80 bg-transparent p-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Basic Information</h2>
              <p className="text-xs text-muted-foreground">User account details</p>
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
                <Label htmlFor="email">Email Address *</Label>
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
             <div className="flex justify-between">
             <Label htmlFor="password">Password *</Label>
             <button type="button" className="text-xs text-muted-foreground" onClick={generatePassword}>
              Generate Password
             </button>
              </div>
              <Input
                id="password"
                type="text"
                value={form.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">Minimum 8 characters required</p>
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-border/80 bg-transparent p-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Role & Permissions</h2>
              <p className="text-xs text-muted-foreground">Assign role and field agent</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={form.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="PROPERTY_OWNER">Property Owner</SelectItem>
                    <SelectItem value="AGENT">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agentId">
                  Field Agent <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Select 
                  value={form.agentId || "none"} 
                  onValueChange={handleAgentChange}
                  disabled={isLoadingAgents}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a field agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Agent</SelectItem>
                    {fieldAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.agentId && (
                  <p className="text-xs text-muted-foreground">Name and email will be auto-filled from the selected agent</p>
                )}
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="border-border text-foreground" 
              onClick={() => router.push("/users")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#2a6f97] hover:bg-[#1f5a7a] text-white">
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}

