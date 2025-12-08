"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, FilePlus2 } from "lucide-react"
import Link from "next/link"

export default function NewDocumentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    property: "",
    tenant: "",
    type: "Lease Agreement",
    uploadDate: "",
    fileSize: "",
    notes: "",
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // Normally you would persist to an API; here we simply route back to the list.
    router.push("/documents")
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background p-8">
      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/documents">
            <ArrowLeft className="h-4 w-4" />
            Back to documents
          </Link>
        </Button>
        <span className="text-muted-foreground text-sm">Create a new document record</span>
      </div>

      <Card className="border-border shadow-sm max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilePlus2 className="h-5 w-5 text-primary" />
            Upload Document
          </CardTitle>
          <CardDescription>Capture the details we need before uploading or sharing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Document name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Lease Agreement - Unit 101"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lease Agreement">Lease Agreement</SelectItem>
                    <SelectItem value="Maintenance Log">Maintenance Log</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Inspection Report">Inspection Report</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property">Property</Label>
                <Input
                  id="property"
                  value={formData.property}
                  onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                  placeholder="Apartment 101"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tenant">Tenant / Owner</Label>
                <Input
                  id="tenant"
                  value={formData.tenant}
                  onChange={(e) => setFormData({ ...formData, tenant: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="uploadDate">Upload date</Label>
                <Input
                  id="uploadDate"
                  type="date"
                  value={formData.uploadDate}
                  onChange={(e) => setFormData({ ...formData, uploadDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fileSize">File size</Label>
                <Input
                  id="fileSize"
                  value={formData.fileSize}
                  onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                  placeholder="e.g. 2.5 MB"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add context or instructions for this document"
                rows={4}
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" asChild>
                <Link href="/documents">Cancel</Link>
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Save & return
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
