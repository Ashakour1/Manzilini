"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { getPropertyById, registerProperty, updateProperty } from "@/services/properties.service"
import { getLandlords } from "@/services/landlords.service"

type PropertyFormState = {
  title: string
  description: string
  property_type: string
  status: string
  price: string
  currency: string
  payment_frequency: string
  deposit_amount: string
  country: string
  city: string
  address: string
  zip_code: string
  latitude: string
  longitude: string
  bedrooms: string
  bathrooms: string
  garages: string
  size: string
  is_furnished: boolean
  floor: string
  total_floors: string
  balcony: boolean
  amenities: string
  is_featured: boolean
  landlord_id: string
}

const initialFormState: PropertyFormState = {
  title: "",
  description: "",
  property_type: "APARTMENT",
  status: "FOR_RENT",
  price: "",
  currency: "USD",
  payment_frequency: "MONTHLY",
  deposit_amount: "",
  country: "",
  city: "",
  address: "",
  zip_code: "",
  latitude: "",
  longitude: "",
  bedrooms: "",
  bathrooms: "",
  garages: "",
  size: "",
  is_furnished: false,
  floor: "",
  total_floors: "",
  balcony: false,
  amenities: "",
  is_featured: false,
  landlord_id: "",
}

type PropertyCreatePageProps = {
  propertyId?: string
}

export function PropertyCreatePage({ propertyId }: PropertyCreatePageProps) {
  const router = useRouter()
  const params = useParams()
  const paramId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined
  const effectivePropertyId = propertyId ?? paramId
  const { toast } = useToast()
  const [form, setForm] = useState<PropertyFormState>(initialFormState)
  const [images, setImages] = useState<(File | null)[]>(() => Array(10).fill(null))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProperty, setIsLoadingProperty] = useState(false)
  const [landlords, setLandlords] = useState<{ id: string; name: string; email: string; phone?: string }[]>([])
  const [isLoadingLandlords, setIsLoadingLandlords] = useState(false)

  const isEdit = Boolean(effectivePropertyId)

  const amenityList = useMemo(
    () =>
      form.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [form.amenities],
  )

  const handleInputChange = (field: keyof PropertyFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleLandlordChange = (landlordId: string) => {
    handleInputChange("landlord_id", landlordId)
  }

  const handleImageChange = (index: number, file: File | null) => {
    setImages((prev) => {
      const next = [...prev]
      next[index] = file
      return next
    })
  }

  useEffect(() => {
    const loadLandlords = async () => {
      setIsLoadingLandlords(true)
      try {
        const data = await getLandlords()
        setLandlords(data || [])
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load landlords",
          variant: "destructive",
        })
      } finally {
        setIsLoadingLandlords(false)
      }
    }
    loadLandlords()
  }, [])

  useEffect(() => {
    if (!effectivePropertyId) return

    const loadProperty = async () => {
      setIsLoadingProperty(true)
      try {
        const data = await getPropertyById(effectivePropertyId)
        if (data) {
          setForm({
            title: data.title || "",
            description: data.description || "",
            property_type: data.property_type || "APARTMENT",
            status: data.status || "FOR_RENT",
            price: (data.price ?? "").toString(),
            currency: data.currency || "USD",
            payment_frequency: data.payment_frequency || "MONTHLY",
            deposit_amount: (data.deposit_amount ?? "").toString(),
            country: data.country || "",
            city: data.city || "",
            address: data.address || "",
            zip_code: data.zip_code || "",
            latitude: (data.latitude ?? "").toString(),
            longitude: (data.longitude ?? "").toString(),
            bedrooms: (data.bedrooms ?? "").toString(),
            bathrooms: (data.bathrooms ?? "").toString(),
            garages: (data.garages ?? "").toString(),
            size: (data.size ?? "").toString(),
            is_furnished: Boolean(data.is_furnished),
            floor: (data.floor ?? "").toString(),
            total_floors: (data.total_floors ?? "").toString(),
            balcony: Boolean(data.balcony),
            amenities: Array.isArray(data.amenities) ? data.amenities.join(", ") : "",
            is_featured: Boolean(data.is_featured),
            landlord_id: data.landlord_id || data.landlord?.id || "",
          })
        }
      } catch (error) {
        toast({
          title: "Unable to load property",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingProperty(false)
      }
      }

      loadProperty()
  }, [effectivePropertyId, toast])

  const buildPayload = () => {
    return {
      title: form.title,
      description: form.description,
      property_type: form.property_type,
      status: form.status,
      price: Number(form.price || 0),
      currency: form.currency,
      payment_frequency: form.payment_frequency,
      deposit_amount: Number(form.deposit_amount || 0),
      country: form.country,
      city: form.city,
      address: form.address,
      zip_code: form.zip_code,
      latitude: Number(form.latitude || 0),
      longitude: Number(form.longitude || 0),
      bedrooms: Number(form.bedrooms || 0),
      bathrooms: Number(form.bathrooms || 0),
      garages: Number(form.garages || 0),
      size: Number(form.size || 0),
      is_furnished: Boolean(form.is_furnished),
      floor: Number(form.floor || 0),
      total_floors: Number(form.total_floors || 0),
      balcony: Boolean(form.balcony),
      amenities: amenityList,
      is_featured: Boolean(form.is_featured),
      landlord_id: form.landlord_id,
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = buildPayload()

      if (isEdit && effectivePropertyId) {
        await updateProperty(effectivePropertyId, payload)
        toast({
          title: "Property updated",
          description: "Changes have been saved.",
        })
      } else {
        await registerProperty({
          ...payload,
          images: images.filter((file): file is File => Boolean(file)),
        })
        toast({
          title: "Property created",
          description: "Your property has been submitted successfully.",
        })
      }
      router.push("/properties")
    } catch (error) {
      toast({
        title: isEdit ? "Unable to update property" : "Unable to create property",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex-1 bg-transparent p-3 sm:p-4 lg:p-5">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" className="px-0 text-foreground" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>{isEdit ? "Edit property" : "Add property"}</span>
            </div>
            <h1 className="text-3xl font-semibold text-foreground">{isEdit ? "Edit property" : "New property"}</h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? "Update the property details." : "Complete the details below. Background stays transparent for focus."}
            </p>
          </div>
          <Button variant="outline" className="border-border text-foreground" onClick={() => router.push("/properties")}>
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <section className="space-y-4 rounded-3xl border border-border/80 bg-transparent p-4 shadow-none backdrop-blur-none">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Overview</h2>
              <p className="text-sm text-muted-foreground">
                {isEdit ? "Adjust the core listing information." : "Basic details about the listing."}
              </p>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Modern 2BR apartment"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property_type">Property type</Label>
                  <Select value={form.property_type} onValueChange={(value) => handleInputChange("property_type", value)}>
                    <SelectTrigger id="property_type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {["APARTMENT", "HOUSE", "STUDIO", "OFFICE", "LAND"].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replaceAll("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the property, highlight the location, finishes, and special perks."
                  rows={4}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {["FOR_RENT", "FOR_SALE", "RENTED", "SOLD"].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.replaceAll("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={form.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {["USD", "EUR", "GBP", "CAD", "AUD", "NZD", "CHF", "JPY", "CNY"].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="2500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_frequency">Payment frequency</Label>
                  <Select
                    value={form.payment_frequency}
                    onValueChange={(value) => handleInputChange("payment_frequency", value)}
                  >
                    <SelectTrigger id="payment_frequency">
                      <SelectValue placeholder="Payment frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {["MONTHLY", "YEARLY", "WEEKLY", "DAILY"].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="deposit_amount">Deposit amount</Label>
                  <Input
                    id="deposit_amount"
                    type="number"
                    min="0"
                    value={form.deposit_amount}
                    onChange={(e) => handleInputChange("deposit_amount", e.target.value)}
                    placeholder="500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    value={form.bedrooms}
                    onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                    placeholder="2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    value={form.bathrooms}
                    onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                    placeholder="2"
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-border/80 bg-transparent p-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Location</h2>
              <p className="text-sm text-muted-foreground">Exact address and coordinates.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Country"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="City"
                  required
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main St"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">Zip code</Label>
                <Input
                  id="zip_code"
                  value={form.zip_code}
                  onChange={(e) => handleInputChange("zip_code", e.target.value)}
                  placeholder="90210"
                  required
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => handleInputChange("latitude", e.target.value)}
                  placeholder="36.7783"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => handleInputChange("longitude", e.target.value)}
                  placeholder="-119.4179"
                  required
                />
              </div>
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-border/80 bg-transparent p-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Features</h2>
              <p className="text-sm text-muted-foreground">Dimensions and amenities.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="garages">Garages</Label>
                <Input
                  id="garages"
                  type="number"
                  min="0"
                  value={form.garages}
                  onChange={(e) => handleInputChange("garages", e.target.value)}
                  placeholder="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Size (sq ft)</Label>
                <Input
                  id="size"
                  type="number"
                  min="0"
                  value={form.size}
                  onChange={(e) => handleInputChange("size", e.target.value)}
                  placeholder="1200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  min="0"
                  value={form.floor}
                  onChange={(e) => handleInputChange("floor", e.target.value)}
                  placeholder="5"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="total_floors">Total floors</Label>
                <Input
                  id="total_floors"
                  type="number"
                  min="0"
                  value={form.total_floors}
                  onChange={(e) => handleInputChange("total_floors", e.target.value)}
                  placeholder="10"
                  required
                />
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-transparent px-4 py-3">
                <Checkbox
                  id="is_furnished"
                  checked={form.is_furnished}
                  onCheckedChange={(checked) => handleInputChange("is_furnished", Boolean(checked))}
                />
                <div>
                  <Label htmlFor="is_furnished" className="font-medium text-foreground">
                    Furnished
                  </Label>
                  <p className="text-xs text-muted-foreground">Include furniture and appliances.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-transparent px-4 py-3">
                <Checkbox
                  id="balcony"
                  checked={form.balcony}
                  onCheckedChange={(checked) => handleInputChange("balcony", Boolean(checked))}
                />
                <div>
                  <Label htmlFor="balcony" className="font-medium text-foreground">
                    Balcony
                  </Label>
                  <p className="text-xs text-muted-foreground">Outdoor space available.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-transparent px-4 py-3">
                <Checkbox
                  id="is_featured"
                  checked={form.is_featured}
                  onCheckedChange={(checked) => handleInputChange("is_featured", Boolean(checked))}
                />
                <div>
                  <Label htmlFor="is_featured" className="font-medium text-foreground">
                    Featured
                  </Label>
                  <p className="text-xs text-muted-foreground">Highlight this property as featured.</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities (comma separated)</Label>
              <Textarea
                id="amenities"
                value={form.amenities}
                onChange={(e) => handleInputChange("amenities", e.target.value)}
                placeholder="Pool, Gym, Parking, Elevator"
              />
              {amenityList.length > 0 && (
                <p className="text-xs text-muted-foreground">Preview: {amenityList.join(", ")}</p>
              )}
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-border/80 bg-transparent p-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Landlord</h2>
              <p className="text-sm text-muted-foreground">Select the landlord for this property. Contact information will be fetched from the landlord's details.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="landlord_id">Landlord *</Label>
                <Select 
                  value={form.landlord_id} 
                  onValueChange={handleLandlordChange}
                  disabled={isLoadingLandlords}
                >
                  <SelectTrigger id="landlord_id">
                    <SelectValue placeholder={isLoadingLandlords ? "Loading landlords..." : "Select a landlord"} />
                  </SelectTrigger>
                  <SelectContent>
                    {landlords.length === 0 && !isLoadingLandlords ? (
                      <div className="p-2 text-sm text-muted-foreground">No landlords available</div>
                    ) : (
                      landlords.map((landlord) => (
                        <SelectItem key={landlord.id} value={landlord.id}>
                          {landlord.name} ({landlord.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {landlords.length === 0 && !isLoadingLandlords && (
                  <p className="text-xs text-muted-foreground">
                    <a href="/landlords/new" className="text-primary hover:underline">Create a landlord</a> first
                  </p>
                )}
              </div>
            </div>
          </section>

          {!isEdit && (
            <section className="space-y-6 rounded-3xl border border-border/80 bg-transparent p-6">
              <div className="flex items-start gap-3">
                <ImageIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Images</h2>
                  <p className="text-sm text-muted-foreground">Provide up to 10 images. You can choose any slots.</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {images.map((file, index) => (
                  <div key={index} className="space-y-2 rounded-xl border border-dashed border-border/80 bg-transparent p-4">
                    <Label htmlFor={`image-${index}`}>Image {index + 1}</Label>
                    <Input
                      id={`image-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(index, e.target.files?.[0] || null)}
                    />
                    {file && <p className="text-xs text-muted-foreground truncate">{file.name}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-border text-foreground" onClick={() => router.push("/properties")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingProperty}>
              {isSubmitting ? (isEdit ? "Saving..." : "Submitting...") : isEdit ? "Save changes" : "Add property"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
