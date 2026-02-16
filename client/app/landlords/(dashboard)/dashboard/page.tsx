"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, FileText, DollarSign, TrendingUp, ClipboardList, Plus, ArrowRight, Settings } from "lucide-react"
import Link from "next/link"
import {
  getLandlordProperties,
  getLandlordApplications,
  type LandlordProperty,
  type LandlordApplication,
} from "@/services/landlords.service"

export default function LandlordDashboardPage() {
  const { user, isLoggedIn } = useAuthStore()
  const [properties, setProperties] = useState<LandlordProperty[]>([])
  const [applications, setApplications] = useState<LandlordApplication[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!isLoggedIn || !user?.token || !user?._id) return
    setIsLoading(true)
    setError(null)

    try {
      const [propsData, appsData] = await Promise.all([
        getLandlordProperties(user.token),
        getLandlordApplications(user._id, user.token).catch(() => []),
      ])
      setProperties(propsData)
      setApplications(appsData)
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, user?.token, user?._id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const { totalProperties, activeListings, pendingApplications, totalApplications } = useMemo(() => {
    const total = properties.length
    const active = properties.filter(
      (p) => p.status === "FOR_RENT" || p.status === "ACTIVE"
    ).length
    const pending = applications.filter((a) => a.status === "PENDING").length
    return {
      totalProperties: total,
      activeListings: active,
      pendingApplications: pending,
      totalApplications: applications.length,
    }
  }, [properties, applications])

  const stats = [
    {
      title: "Total Properties",
      value: totalProperties.toString(),
      description: "Properties you own",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      title: "Active Listings",
      value: activeListings.toString(),
      description: "Currently listed",
      icon: FileText,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    {
      title: "Applications",
      value: totalApplications.toString(),
      description: `${pendingApplications} pending`,
      icon: ClipboardList,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
    },
    {
      title: "Total Revenue",
      value: "KES 0",
      description: "Coming soon",
      icon: DollarSign,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      borderColor: "border-violet-100",
    },
  ]

  const quickActions = [
    {
      icon: Plus,
      title: "Add New Property",
      description: "List a new property for rent",
      href: "/landlords/properties",
    },
    {
      icon: ClipboardList,
      title: "View Applications",
      description: "Review tenant applications",
      href: "/landlords/applications",
    },
    {
      icon: FileText,
      title: "View Documents",
      description: "Manage your property documents",
      href: "/landlords/documents",
    },
    {
      icon: Settings,
      title: "Account Settings",
      description: "Update your profile information",
      href: "/landlords/settings",
    },
  ]

  return (
    <div className="p-5 md:p-6 space-y-6">
      {/* Welcome Section */}
      <div className="rounded-xl bg-gradient-to-r from-[#2a6f97]/5 to-transparent border border-[#2a6f97]/10 p-5">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          Welcome back, {user?.name || "Landlord"}
        </h1>
        <p className="text-sm text-gray-500">
          Here&apos;s an overview of your property portfolio.
        </p>
        {isLoading && (
          <p className="text-xs text-gray-400 mt-2">
            Loading your latest stats...
          </p>
        )}
        {!isLoading && error && (
          <p className="text-xs text-red-500 mt-2">
            {error}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className={`border ${stat.borderColor} shadow-none hover:shadow-sm transition-shadow`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Properties */}
        <Card className="border-gray-200/80 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Recent Properties</CardTitle>
                <CardDescription className="text-xs">Your latest property listings</CardDescription>
              </div>
              {properties.length > 0 && (
                <Link
                  href="/landlords/properties"
                  className="text-xs text-[#2a6f97] hover:underline flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Loading recent properties...
              </div>
            )}

            {!isLoading && !properties.length && !error && (
              <div className="text-center py-8 text-gray-400">
                <Building2 className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">No properties yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Start by adding your first property
                </p>
              </div>
            )}

            {!isLoading && !!properties.length && (
              <div className="space-y-2">
                {properties.slice(0, 5).map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5 hover:bg-gray-50/50 transition-colors"
                  >
                    {property.images && property.images.length > 0 ? (
                      <div className="h-9 w-9 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={property.images[0].url}
                          alt={property.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-9 w-9 flex-shrink-0 rounded-md bg-gray-100 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {property.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {property.city} &bull; {property.address}
                      </p>
                    </div>
                    <span className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 capitalize whitespace-nowrap">
                      {property.status.replace("_", " ").toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-gray-200/80 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            <CardDescription className="text-xs">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-50/80 hover:border-gray-200 transition-all group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-[#2a6f97]/5 transition-colors">
                      <Icon className="h-4 w-4 text-gray-400 group-hover:text-[#2a6f97] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{action.title}</div>
                      <div className="text-xs text-gray-400">{action.description}</div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
