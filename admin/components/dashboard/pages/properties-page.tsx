"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Download, Home, MapPin, Plus, Search, ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from "lucide-react"
import { getProperties } from "@/services/properties.service"
import { deleteProperty } from "@/services/properties.service"

type Property = {
  id: string
  title: string
  address: string
  city: string
  country: string
  property_type: string
  status: string
  price: number | string
  currency: string
  payment_frequency?: string
  createdAt?: string
}

export function PropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getProperties()
        setProperties(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load properties")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const filteredProperties = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    return properties.filter((property) => {
      const title = property.title?.toLowerCase() ?? ""
      const address = property.address?.toLowerCase() ?? ""
      const city = property.city?.toLowerCase() ?? ""
      const country = property.country?.toLowerCase() ?? ""

      const matchesSearch =
        !term || title.includes(term) || address.includes(term) || city.includes(term) || country.includes(term)
      const matchesType = typeFilter === "All" || property.property_type === typeFilter
      const matchesStatus = statusFilter === "All" || property.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [properties, searchTerm, statusFilter, typeFilter])

  const statusTone = (status: string) => {
    const tones: Record<string, string> = {
      FOR_RENT: "bg-amber-50 text-amber-700 border border-amber-100",
      FOR_SALE: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      RENTED: "bg-blue-50 text-blue-700 border border-blue-100",
      SOLD: "bg-gray-200 text-gray-800 border border-gray-300",
    }
    return tones[status] ?? "bg-muted text-foreground"
  }

  const propertyCode = (id: string) => `PROP-${id.slice(0, 6).toUpperCase()}`

  const totalEntries = properties.length
  const typeOptions = ["All", "APARTMENT", "HOUSE", "STUDIO", "OFFICE", "LAND"]
  const statusOptions = ["All", "FOR_RENT", "FOR_SALE", "RENTED", "SOLD"]

  const formatPrice = (price: number | string, currency: string, frequency?: string) => {
    const amount = Number(price) || 0
    const formatted = amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    return `${currency} ${formatted}${frequency ? ` / ${frequency.toLowerCase()}` : ""}`
  }

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Delete this property?")
    if (!confirm) return
    try {
      setDeletingId(id)
      await deleteProperty(id)
      setProperties((prev) => prev.filter((prop) => prop.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete property")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-foreground">Properties</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Last update a minute ago
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-">
          <Button variant="outline" className="border-border text-foreground">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => router.push("/properties/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add property
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-none bg-transparent p-0 px-0">
        <CardHeader className="gap-4 border-b border-border/80 px-0 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Home className="h-4 w-4" />
              </span>
              <div>
                <CardTitle className="text-xl font-semibold leading-tight text-foreground">Portfolio overview</CardTitle>
                <CardDescription>Quick view of availability, rents, and tenants</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="border-border text-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Date: All
              </Button>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search property"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-1">
                <MapPin className="h-4 w-4" />
                Sorted by location
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/60 px-3 py-1">
                <Home className="h-4 w-4" />
                {filteredProperties.length} shown
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox aria-label="Select all properties" />
                  </TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  Loading properties...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && error && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-destructive">
                  {error}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !error && filteredProperties.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                  No properties found.
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
                  !error &&
                  filteredProperties.map((property) => (
                    <TableRow key={property.id} className="hover:bg-muted/40">
                      <TableCell>
                        <Checkbox aria-label={`Select ${property.title}`} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm font-semibold text-foreground">
                        {propertyCode(property.id)}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">{property.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {property.address ? `${property.address}, ` : ""}
                        {property.city}, {property.country}
                      </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{property.property_type}</TableCell>
                    <TableCell className="text-sm font-semibold text-foreground">
                      {formatPrice(property.price, property.currency, property.payment_frequency)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusTone(property.status)}>{property.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground"
                          onClick={() => router.push(`/properties/${property.id}`)}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 border-border"
                          onClick={() => router.push(`/properties/${property.id}/edit`)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive"
                          disabled={deletingId === property.id}
                          onClick={() => handleDelete(property.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
          <div className="flex flex-col gap-3 border-t border-border/80 px-0 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <div>Showing {filteredProperties.length} of {totalEntries} entries</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="border-border text-foreground">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <div className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-foreground">
                <span className="font-semibold">1</span>
                <span className="text-muted-foreground">/ 1</span>
              </div>
              <Button size="sm" variant="outline" className="border-border text-foreground">
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
