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
  Clock,
  Hash,
  ExternalLink,
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

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-4">Contact Information</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Agent ID</p>
                          <p className="text-sm font-mono text-foreground mt-1 break-all">{agent.id}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email Address</p>
                          <a
                            href={`mailto:${agent.email}`}
                            className="text-sm font-medium text-primary hover:underline mt-1 block"
                          >
                            {agent.email}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone Number</p>
                          {agent.phone ? (
                            <a
                              href={`tel:${agent.phone}`}
                              className="text-sm font-medium text-primary hover:underline mt-1 block"
                            >
                              {agent.phone}
                            </a>
                          ) : (
                            <p className="text-sm font-medium text-muted-foreground mt-1">N/A</p>
                          )}
                        </div>
                      </div>
                      {agent.document_image && (
                        <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 sm:col-span-2">
                          <ImageIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Document Image</p>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-primary hover:underline mt-1"
                              onClick={() => {
                                setSelectedDocument({
                                  id: 'main-doc',
                                  documentType: 'Main Document',
                                  url: agent.document_image,
                                  documentImage: agent.document_image,
                                } as AgentDocument)
                                setDocumentModalOpen(true)
                              }}
                            >
                              View Document
                              <ExternalLink className="h-3 w-3 inline ml-1" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {agent.documents && agent.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents ({agent.documents.length})
                  </CardTitle>
                  <CardDescription>Uploaded documents and files</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agent.documents.map((doc) => (
                      <div key={doc.id} className="flex items-start justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-3 flex-1">
                          <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{doc.documentType || "Document"}</p>
                            {doc.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{doc.notes}</p>
                            )}
                            {doc.uploadedAt && (
                              <div className="flex items-center gap-1 mt-2">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">
                                  Uploaded: {new Date(doc.uploadedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2"
                          onClick={() => {
                            setSelectedDocument(doc)
                            setDocumentModalOpen(true)
                          }}
                        >
                          <span className="text-xs">View</span>
                          <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>Account creation and updates</CardDescription>
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
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
                {agent.updatedAt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Last Updated</span>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-6">
                      {new Date(agent.updatedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Hash className="h-3.5 w-3.5" />
                    <span>Agent ID</span>
                  </div>
                  <p className="text-sm font-mono text-foreground pl-6 break-all">{agent.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Document View Modal */}
      <Dialog open={documentModalOpen} onOpenChange={setDocumentModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.documentType || "Document"}</DialogTitle>
            <DialogDescription>
              {selectedDocument?.notes || "View document details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDocument?.documentImage && (
              <div className="w-full">
                <img
                  src={selectedDocument.documentImage}
                  alt={selectedDocument.documentType || "Document"}
                  className="w-full h-auto rounded-lg border"
                />
              </div>
            )}
            {selectedDocument?.url && !selectedDocument?.documentImage && (
              <div className="w-full">
                <iframe
                  src={selectedDocument.url}
                  className="w-full h-[600px] rounded-lg border"
                  title={selectedDocument.documentType || "Document"}
                />
              </div>
            )}
            {selectedDocument?.uploadedAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Uploaded: {new Date(selectedDocument.uploadedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            {selectedDocument?.url && (
              <div className="flex justify-end">
                <Button variant="outline" asChild>
                  <a href={selectedDocument.url} target="_blank" rel="noopener noreferrer">
                    Open in New Tab
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
