"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandlordDocumentsPage() {
  return (
    <div className="p-5 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Documents
          </h1>
          <p className="text-sm text-gray-500">
            Manage your property documents
          </p>
        </div>
        <Button className="bg-[#2a6f97] hover:bg-[#235d7f] text-white shadow-sm text-xs gap-1.5">
          <Upload className="h-3.5 w-3.5" />
          Upload Document
        </Button>
      </div>

      <Card className="border-gray-200/80 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Documents</CardTitle>
          <CardDescription className="text-xs">Your documents will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500 mb-1">No documents yet</p>
            <p className="text-xs text-gray-400">
              Upload your first document to get started
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
