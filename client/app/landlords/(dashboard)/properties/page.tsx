"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getLandlordProperties, type LandlordProperty } from "@/services/landlords.service"

export default function LandlordPropertiesPage() {
  const { user, isLoggedIn } = useAuthStore()
  const [properties, setProperties] = useState<LandlordProperty[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProperties = async () => {
      if (!isLoggedIn || !user?.token) return
      setIsLoading(true)
      setError(null)

      try {
        const data = await getLandlordProperties(user.token)
        setProperties(data)
      } catch (err: any) {
        setError(err.message || "Failed to load properties")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperties()
  }, [isLoggedIn, user?.token])

  const hasProperties = properties && properties.length > 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            My Properties
          </h1>
          <p className="text-gray-600">
            Manage your property listings
          </p>
        </div>
        <Button className="bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>Properties</CardTitle>
          <CardDescription>Your property listings will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="py-8 text-center text-gray-500">
              Loading your properties...
            </div>
          )}

          {!isLoading && error && (
            <div className="py-8 text-center text-red-500 text-sm">
              {error}
            </div>
          )}

          {!isLoading && !error && !hasProperties && (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No properties yet</p>
              <p className="text-sm text-gray-400">
                Start by adding your first property
              </p>
            </div>
          )}

          {!isLoading && !error && hasProperties && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <Card key={property.id} className="border-gray-200 overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-gray-900 line-clamp-1">
                      {property.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">
                      {property.city} • {property.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                       KES {property.price.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {property.status.replace("_", " ").toLowerCase()}
                      </span>
                    </div>
                    {property.images && property.images.length > 0 && (
                      <div className="relative h-32 w-full overflow-hidden rounded-md bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={property.images[0].url}
                          alt={property.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
