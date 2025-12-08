"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, Trash2 } from "lucide-react"

type DocumentItem = {
  id: number
  name: string
  property: string
  tenant: string
  type: string
  uploadDate: string
  fileSize: string
}

const initialDocuments: DocumentItem[] = [
  {
    id: 1,
    name: "Lease Agreement - Apartment 101",
    property: "Apartment 101",
    tenant: "John Doe",
    type: "Lease Agreement",
    uploadDate: "2024-01-15",
    fileSize: "2.5 MB",
  },
  {
    id: 2,
    name: "Maintenance Log - House 5B",
    property: "House 5B",
    tenant: "Jane Smith",
    type: "Maintenance Log",
    uploadDate: "2024-11-20",
    fileSize: "1.2 MB",
  },
  {
    id: 3,
    name: "Insurance Certificate",
    property: "Commercial 3",
    tenant: "ABC Corp",
    type: "Insurance",
    uploadDate: "2024-11-01",
    fileSize: "3.8 MB",
  },
  {
    id: 4,
    name: "Property Inspection Report",
    property: "Apartment 202",
    tenant: "Management",
    type: "Inspection Report",
    uploadDate: "2024-11-10",
    fileSize: "4.1 MB",
  },
]

export function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments)

  const handleDelete = (id: number) => {
    if (!window.confirm("Remove this document?")) return
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Documents</h1>
          <p className="text-muted-foreground">Store and manage important documents</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/documents/new">Upload Document</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {documents.map((doc) => (
          <Card key={doc.id} className="border-border shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{doc.name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Property</p>
                        <p className="text-sm font-medium text-foreground">{doc.property}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="text-sm font-medium text-foreground">{doc.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Upload Date</p>
                        <p className="text-sm font-medium text-foreground">{doc.uploadDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">File Size</p>
                        <p className="text-sm font-medium text-foreground">{doc.fileSize}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2 text-destructive" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
