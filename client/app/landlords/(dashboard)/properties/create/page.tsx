"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { ArrowLeft, Image as ImageIcon, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  createProperty,
  getLandlordIdFromProperties,
  type CreatePropertyData,
} from "@/services/landlords.service"
import { useToast } from "@/components/ui/use-toast"

type PropertyFormState = {
  title: string
  description: string
  property_type: string
  status: string
  price: string
  currency: string
  payment_frequency: string
  deposit_amount: string
  deposit_type: "FIXED" | "PERCENTAGE"
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
}

const initialFormState: PropertyFormState = {
  title: "",
  description: "",
  property_type: "APARTMENT",
  status: "FOR_RENT",
  price: "",
  currency: "KES",
  payment_frequency: "MONTHLY",
  deposit_amount: "",
  deposit_type: "FIXED",
  country: "Kenya",
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
}

export default function CreatePropertyPage() {
  const router = useRouter()
  const { user, isLoggedIn } = useAuthStore()
  const { toast } = useToast()
  const [form, setForm] = useState<PropertyFormState>(initialFormState)
  const [images, setImages] = useState<(File | null)[]>(() => Array(10).fill(null))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [landlordId, setLandlordId] = useState<string | null>(null)
  const [isLoadingLandlordId, setIsLoadingLandlordId] = useState(true)

  const amenityList = useMemo(
    () =>
      form.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [form.amenities],
  )

  useEffect(() => {
    const fetchLandlordId = async () => {
      if (!isLoggedIn || !user?.token) return
      setIsLoadingLandlordId(true)
      try {
        const id = await getLandlordIdFromProperties(user.token)
        setLandlordId(id)
      } catch (err) {
        console.error("Failed to get landlord ID:", err)
      } finally {
        setIsLoadingLandlordId(false)
      }
    }
    fetchLandlordId()
  }, [isLoggedIn, user?.token])

  const handleInputChange = (field: keyof PropertyFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (index: number, file: File | null) => {
    setImages((prev) => {
      const next = [...prev]
      next[index] = file
      return next
    })
  }

  const buildPayload = (): CreatePropertyData => {
    const payload: CreatePropertyData = {
      title: form.title,
      description: form.description,
      property_type: form.property_type,
      status: form.status,
      price: form.price,
      currency: form.currency,
      payment_frequency: form.payment_frequency,
      deposit_amount: form.deposit_amount || undefined,
      deposit_type: form.deposit_type,
      country: form.country,
      city: form.city,
      address: form.address,
      zip_code: form.zip_code,
      latitude: form.latitude,
      longitude: form.longitude,
      bedrooms: form.bedrooms || undefined,
      bathrooms: form.bathrooms || undefined,
      garages: form.garages || undefined,
      size: form.size || undefined,
      is_furnished: form.is_furnished,
      floor: form.floor || undefined,
      total_floors: form.total_floors || undefined,
      balcony: form.balcony,
      amenities: amenityList.length > 0 ? amenityList : undefined,
      is_published: false, // Properties created by landlords are not published by default
      images: images.filter((file): file is File => Boolean(file)),
    }

    if (landlordId) {
      payload.landlord_id = landlordId
    }

    return payload
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user?.token) {
      toast({
        title: "Error",
        description: "You must be logged in to create a property",
        variant: "destructive",
      })
      return
    }

    if (!landlordId && !isLoadingLandlordId) {
      toast({
        title: "Error",
        description: "Unable to determine your landlord profile. Please contact support.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const payload = buildPayload()
      await createProperty(user.token, payload)
      toast({
        title: "Property created",
        description: "Your property has been submitted successfully.",
      })
      router.push("/landlords/properties")
    } catch (error) {
      toast({
        title: "Unable to create property",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-5 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Button
              variant="ghost"
              size="sm"
              className="px-0 text-gray-600 hover:text-gray-900"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back
            </Button>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span>Add property</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Create New Property</h1>
          <p className="text-sm text-gray-500">
            Complete the details below to list your property
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overview Section */}
        <Card className="border-gray-200/80 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Overview</CardTitle>
            <CardDescription className="text-xs">Basic details about the listing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs text-gray-600">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Modern 2BR apartment"
                  required
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="property_type" className="text-xs text-gray-600">
                  Property Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.property_type}
                  onValueChange={(value) => handleInputChange("property_type", value)}
                >
                  <SelectTrigger id="property_type" className="h-9 text-sm">
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
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs text-gray-600">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the property, highlight the location, finishes, and special perks."
                rows={4}
                required
                className="text-sm"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs text-gray-600">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger id="status" className="h-9 text-sm">
                    <SelectValue />
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
              <div className="space-y-1.5">
                <Label htmlFor="currency" className="text-xs text-gray-600">Currency</Label>
                <Select
                  value={form.currency}
                  onValueChange={(value) => handleInputChange("currency", value)}
                >
                  <SelectTrigger id="currency" className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["KES", "USD", "EUR", "GBP"].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs text-gray-600">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="25000"
                  required
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payment_frequency" className="text-xs text-gray-600">
                  Payment Frequency
                </Label>
                <Select
                  value={form.payment_frequency}
                  onValueChange={(value) => handleInputChange("payment_frequency", value)}
                >
                  <SelectTrigger id="payment_frequency" className="h-9 text-sm">
                    <SelectValue />
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
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="deposit_amount" className="text-xs text-gray-600">
                  Deposit Amount
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={form.deposit_type}
                    onValueChange={(value) =>
                      handleInputChange("deposit_type", value as "FIXED" | "PERCENTAGE")
                    }
                  >
                    <SelectTrigger className="w-[100px] h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIXED">Fixed</SelectItem>
                      <SelectItem value="PERCENTAGE">%</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="deposit_amount"
                    type="number"
                    min="0"
                    max={form.deposit_type === "PERCENTAGE" ? "100" : undefined}
                    value={form.deposit_amount}
                    onChange={(e) => handleInputChange("deposit_amount", e.target.value)}
                    placeholder={form.deposit_type === "PERCENTAGE" ? "10" : "5000"}
                    className="flex-1 h-9 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bedrooms" className="text-xs text-gray-600">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={(e) => handleInputChange("bedrooms", e.target.value)}
                  placeholder="2"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bathrooms" className="text-xs text-gray-600">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0"
                  value={form.bathrooms}
                  onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                  placeholder="2"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Section */}
        <Card className="border-gray-200/80 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </CardTitle>
            <CardDescription className="text-xs">Exact address and coordinates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-xs text-gray-600">
                  Country <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Kenya"
                  required
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs text-gray-600">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Nairobi"
                  required
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs text-gray-600">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main St"
                  required
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="zip_code" className="text-xs text-gray-600">
                  Zip Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="zip_code"
                  value={form.zip_code}
                  onChange={(e) => handleInputChange("zip_code", e.target.value)}
                  placeholder="00100"
                  required
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="latitude" className="text-xs text-gray-600">
                  Latitude <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => handleInputChange("latitude", e.target.value)}
                  placeholder="-1.2921"
                  required
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="longitude" className="text-xs text-gray-600">
                  Longitude <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => handleInputChange("longitude", e.target.value)}
                  placeholder="36.8219"
                  required
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card className="border-gray-200/80 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Features</CardTitle>
            <CardDescription className="text-xs">Dimensions and amenities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="garages" className="text-xs text-gray-600">Garages</Label>
                <Input
                  id="garages"
                  type="number"
                  min="0"
                  value={form.garages}
                  onChange={(e) => handleInputChange("garages", e.target.value)}
                  placeholder="1"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="size" className="text-xs text-gray-600">Size (sq ft)</Label>
                <Input
                  id="size"
                  type="number"
                  min="0"
                  value={form.size}
                  onChange={(e) => handleInputChange("size", e.target.value)}
                  placeholder="1200"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="floor" className="text-xs text-gray-600">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  min="0"
                  value={form.floor}
                  onChange={(e) => handleInputChange("floor", e.target.value)}
                  placeholder="5"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="total_floors" className="text-xs text-gray-600">Total Floors</Label>
                <Input
                  id="total_floors"
                  type="number"
                  min="0"
                  value={form.total_floors}
                  onChange={(e) => handleInputChange("total_floors", e.target.value)}
                  placeholder="10"
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5">
                <Checkbox
                  id="is_furnished"
                  checked={form.is_furnished}
                  onCheckedChange={(checked) => handleInputChange("is_furnished", Boolean(checked))}
                />
                <Label htmlFor="is_furnished" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Furnished
                </Label>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5">
                <Checkbox
                  id="balcony"
                  checked={form.balcony}
                  onCheckedChange={(checked) => handleInputChange("balcony", Boolean(checked))}
                />
                <Label htmlFor="balcony" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Balcony
                </Label>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amenities" className="text-xs text-gray-600">
                Amenities (comma separated)
              </Label>
              <Textarea
                id="amenities"
                value={form.amenities}
                onChange={(e) => handleInputChange("amenities", e.target.value)}
                placeholder="Pool, Gym, Parking, Elevator"
                rows={2}
                className="text-sm"
              />
              {amenityList.length > 0 && (
                <p className="text-xs text-gray-400">Preview: {amenityList.join(", ")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Images Section */}
        <Card className="border-gray-200/80 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Images
            </CardTitle>
            <CardDescription className="text-xs">
              Provide up to 10 images. You can choose any slots.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {images.map((file, index) => (
                <div
                  key={index}
                  className="space-y-1.5 rounded-lg border border-dashed border-gray-200 p-3"
                >
                  <Label htmlFor={`image-${index}`} className="text-xs text-gray-600">
                    Image {index + 1} (optional)
                  </Label>
                  <Input
                    id={`image-${index}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(index, e.target.files?.[0] || null)}
                    className="h-9 text-xs"
                  />
                  {file && (
                    <p className="text-xs text-gray-400 truncate">{file.name}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/landlords/properties")}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoadingLandlordId}
            className="bg-[#2a6f97] hover:bg-[#235d7f] text-white text-xs"
          >
            {isSubmitting ? "Creating..." : "Create Property"}
          </Button>
        </div>
      </form>
    </div>
  )
}
