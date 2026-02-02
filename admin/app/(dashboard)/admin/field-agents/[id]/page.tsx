"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  User,
  Calendar,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getFieldAgentById } from "@/services/field-agents.service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type AgentDocument = {
  id: string
  documentType?: string | null
  documentImage?: string | null
  url?: string | null
  notes?: string | null
  uploadedAt?: string
}

type FieldAgent = {
  id: string
  name: string
  email: string
  phone?: string
  image?: string
  document_image?: string
  createdAt?: string
  updatedAt?: string
  documents?: AgentDocument[]
}

export default function AdminFieldAgentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const agentId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined

  const [agent, setAgent] = useState<FieldAgent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<AgentDocument | null>(null)
  const [documentModalOpen, setDocumentModalOpen] = useState(false)

  useEffect(() => {
    if (!agentId) return

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getFieldAgentById(agentId)
        setAgent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load field agent")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [agentId])

  if (isLoading) {
    return (
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Skeleton className="h-10 w-32" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/field-agents")} className="px-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      </main>
    )
  }

  if (!agent) {
    return null
  }

  return (
    <main className="flex-1 p-3 sm:p-4 lg:p-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/field-agents")} className="px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{agent.name}</h1>
              <p className="text-sm text-muted-foreground">Field agent details and information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push(`/admin/field-agents/${agent.id}/edit`)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>Field agent contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  {agent.image ? (
                    <Avatar className="h-24 w-24 border-2 border-primary">
                      <AvatarImage src={agent.image} alt={agent.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                        {agent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-24 w-24 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">{agent.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">Field Agent</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${agent.email}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {agent.email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {agent.phone ? (
                        <a
                          href={`tel:${agent.phone}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {agent.phone}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-muted-foreground">N/A</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
                <CardDescription>Summary information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {agent.createdAt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Created</span>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-6">
                      {new Date(agent.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
