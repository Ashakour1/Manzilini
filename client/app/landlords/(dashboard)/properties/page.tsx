"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Plus, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getLandlordProperties, type LandlordProperty } from "@/services/landlords.service"

function getStatusStyle(status: string) {
  switch (status) {
    case "FOR_RENT":
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700"
    case "RENTED":
      return "bg-blue-50 text-blue-700"
    case "MAINTENANCE":
      return "bg-amber-50 text-amber-700"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

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
    <div className="p-5 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            My Properties
          </h1>
          <p className="text-sm text-gray-500">
            Manage your property listings
          </p>
        </div>
        <Button className="bg-[#2a6f97] hover:bg-[#235d7f] text-white shadow-sm text-xs gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Property
        </Button>
      </div>

      <Card className="border-gray-200/80 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Properties</CardTitle>
          <CardDescription className="text-xs">
            {hasProperties
              ? `${properties.length} property listings`
              : "Your property listings will appear here"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="py-8 text-center text-gray-400 text-sm">
              Loading your properties...
            </div>
          )}

          {!isLoading && error && (
            <div className="py-8 text-center text-red-500 text-sm">
              {error}
            </div>
          )}

          {!isLoading && !error && !hasProperties && (
            <div className="text-center py-12 text-gray-400">
              <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500 mb-1">No properties yet</p>
              <p className="text-xs text-gray-400">
                Start by adding your first property
              </p>
            </div>
          )}

          {!isLoading && !error && hasProperties && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="group rounded-xl border border-gray-200/80 overflow-hidden hover:shadow-md hover:border-gray-300/80 transition-all duration-200 bg-white"
                >
                  {/* Image */}
                  {property.images && property.images.length > 0 ? (
                    <div className="relative h-36 w-full overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={property.images[0].url}
                        alt={property.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span
                        className={`absolute top-2 right-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${getStatusStyle(property.status)}`}
                      >
                        {property.status.replace("_", " ").toLowerCase()}
                      </span>
                    </div>
                  ) : (
                    <div className="relative h-36 w-full bg-gray-50 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-gray-300" />
                      <span
                        className={`absolute top-2 right-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${getStatusStyle(property.status)}`}
                      >
                        {property.status.replace("_", " ").toLowerCase()}
                      </span>
                    </div>
                  )}

                  {/* Details */}
                  <div className="p-3.5 space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{property.city} &bull; {property.address}</span>
                    </div>
                    <div className="pt-1 border-t border-gray-100">
                      <span className="text-sm font-bold text-gray-900">
                        KES {property.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">/mo</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
