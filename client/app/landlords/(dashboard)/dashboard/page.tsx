"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, FileText, DollarSign, TrendingUp } from "lucide-react"
import { getLandlordProperties, type LandlordProperty } from "@/services/landlords.service"

export default function LandlordDashboardPage() {
  const { user, isLoggedIn } = useAuthStore()
  const [properties, setProperties] = useState<LandlordProperty[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn || !user?.token) return
      setIsLoading(true)
      setError(null)

      try {
        const data = await getLandlordProperties(user.token)
        setProperties(data)
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isLoggedIn, user?.token])

  const { totalProperties, activeListings } = useMemo(() => {
    const total = properties.length
    // Treat FOR_RENT (and optionally ACTIVE) as active listings
    const active = properties.filter(
      (p) => p.status === "FOR_RENT" || p.status === "ACTIVE"
    ).length
    return { totalProperties: total, activeListings: active }
  }, [properties])

  const stats = [
    {
      title: "Total Properties",
      value: totalProperties.toString(),
      description: "Properties you own",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Listings",
      value: activeListings.toString(),
      description: "Currently listed",
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Revenue",
      value: "KES 0",
      description: "This month (coming soon)",
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Growth Rate",
      value: "0%",
      description: "Compared to last month (coming soon)",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || "Landlord"}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your property portfolio.
        </p>
        {isLoading && (
          <p className="text-xs text-gray-400 mt-1">
            Loading your latest stats...
          </p>
        )}
        {!isLoading && error && (
          <p className="text-xs text-red-500 mt-1">
            {error}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Recent Properties</CardTitle>
            <CardDescription>Your latest property listings</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="text-center py-8 text-gray-500 text-sm">
                Loading recent properties...
              </div>
            )}

            {!isLoading && !properties.length && !error && (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm">No properties yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Start by adding your first property
                </p>
              </div>
            )}

            {!isLoading && !!properties.length && (
              <div className="space-y-3">
                {properties.slice(0, 5).map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {property.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {property.city} • {property.address}
                      </p>
                    </div>
                    <span className="ml-2 inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium bg-gray-100 text-gray-700 capitalize">
                      {property.status.replace("_", " ").toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Add New Property</div>
                <div className="text-sm text-gray-500">List a new property for rent</div>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">View Documents</div>
                <div className="text-sm text-gray-500">Manage your property documents</div>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Account Settings</div>
                <div className="text-sm text-gray-500">Update your profile information</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
