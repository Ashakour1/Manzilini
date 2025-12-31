"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts"
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, Calendar, DollarSign, FileText, MapPin, Clock, CheckCircle, XCircle } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { useAuthStore } from "@/store/authStore"
import {
  getDashboardStats,
  getRevenueData,
  getOccupancyData,
  getPropertyTypes,
  getPaymentStatus,
  getRecentActivity,
  type DashboardStats,
  type RevenueData,
  type OccupancyData,
  type PropertyTypeData,
  type PaymentStatusData,
  type RecentActivity,
} from "@/services/dashboard.service"
import { getMyPropertyApplications, type PropertyApplication } from "@/services/property-applications.service"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-gray-600" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? `$${entry.value.toLocaleString()}` : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function DashboardContent() {
  const router = useRouter()
  const { user, isLoggedIn, isHydrated } = useAuthStore()
  
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([])
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeData[]>([])
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusData[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [applications, setApplications] = useState<PropertyApplication[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  // Only used for initial auth gate; dashboard widgets load progressively.
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is admin
  const isAdmin = useMemo(() => {
    const role = user?.role?.toUpperCase()
    return role === "SUPER_ADMIN" || role === "ADMIN"
  }, [user?.role])

  // Dashboard requests can be slow (large lists). Don't block the whole UI:
  // render immediately and load each widget in parallel with placeholders.
  useEffect(() => {
    if (!isHydrated) return

    if (!isLoggedIn) {
      router.replace("/")
      return
    }

    let cancelled = false
    setIsLoading(false) // stop full-screen loading once auth is ready
    setError(null)

    const safe = <T,>(setter: (v: T) => void, value: T) => {
      if (cancelled) return
      setter(value)
    }

    ;(async () => {
      try {
        const v = await getDashboardStats()
        safe(setStats, v)
      } catch (err) {
        console.error("Error loading dashboard stats:", err)
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load dashboard stats")
      }
    })()

    ;(async () => {
      try {
        const v = await getRevenueData()
        safe(setRevenueData, v)
      } catch (err) {
        console.error("Error loading revenue data:", err)
      }
    })()

    ;(async () => {
      try {
        const v = await getOccupancyData()
        safe(setOccupancyData, v)
      } catch (err) {
        console.error("Error loading occupancy data:", err)
      }
    })()

    ;(async () => {
      try {
        const v = await getPropertyTypes()
        safe(setPropertyTypes, v)
      } catch (err) {
        console.error("Error loading property types:", err)
      }
    })()

    ;(async () => {
      try {
        const v = await getPaymentStatus()
        safe(setPaymentStatus, v)
      } catch (err) {
        console.error("Error loading payment status:", err)
      }
    })()

    ;(async () => {
      try {
        const v = await getRecentActivity()
        safe(setRecentActivity, v)
      } catch (err) {
        console.error("Error loading recent activity:", err)
      }
    })()

    // Load property applications for non-admin users
    if (!isAdmin) {
      ;(async () => {
        try {
          setApplicationsLoading(true)
          const v = await getMyPropertyApplications()
          if (!cancelled) {
            setApplications(v)
          }
        } catch (err) {
          console.error("Error loading property applications:", err)
        } finally {
          if (!cancelled) {
            setApplicationsLoading(false)
          }
        }
      })()
    }

    return () => {
      cancelled = true
    }
  }, [isHydrated, isLoggedIn, router, isAdmin])

  const headlineStats = useMemo(() => {
    if (!stats) return []
    
    return [
      {
        label: "Total Earnings",
        value: `$${stats.totalEarnings.toLocaleString()}`,
        change: stats.revenueChange ? `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange.toFixed(1)}%` : "+0%",
        isPositive: (stats.revenueChange || 0) >= 0,
        icon: DollarSign,
      },
      {
        label: "Properties",
        value: stats.totalProperties.toString(),
        change: stats.propertiesChange ? `${stats.propertiesChange > 0 ? '+' : ''}${stats.propertiesChange.toFixed(1)}%` : "+0%",
        isPositive: (stats.propertiesChange || 0) >= 0,
        icon: Building2,
      },
      {
        label: "Active Tenants",
        value: stats.activeTenants.toString(),
        change: stats.tenantsChange ? `${stats.tenantsChange > 0 ? '+' : ''}${stats.tenantsChange.toFixed(1)}%` : "+0%",
        isPositive: (stats.tenantsChange || 0) >= 0,
        icon: Users,
      },
      {
        label: "Monthly Revenue",
        value: `$${stats.monthlyRevenue.toLocaleString()}`,
        change: stats.revenueChange ? `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange.toFixed(1)}%` : "+0%",
        isPositive: (stats.revenueChange || 0) >= 0,
        icon: TrendingUp,
      },
    ]
  }, [stats])

  const headlineStatsFallback = useMemo(() => {
    return [
      { label: "Total Earnings", icon: DollarSign },
      { label: "Properties", icon: Building2 },
      { label: "Active Tenants", icon: Users },
      { label: "Monthly Revenue", icon: TrendingUp },
    ]
  }, [])

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  const userName = user?.name?.split(' ')[0] || 'User'

  // Render property applications view for non-admin users
  if (!isAdmin) {
    return (
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="space-y-4 p-3 sm:p-4 lg:p-5">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">My Property Applications</h1>
            <p className="text-xs text-gray-600">View and manage your property applications</p>
          </div>

          {applicationsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border border-gray-200">
                  <CardContent className="p-6">
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <Card className="border border-gray-200">
              <CardContent className="p-12">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>No Applications Yet</EmptyTitle>
                    <EmptyDescription>
                      You haven't applied to any properties yet. Browse properties to get started.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {applications.map((application) => {
                const statusColors = {
                  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
                  APPROVED: "bg-green-100 text-green-800 border-green-200",
                  REJECTED: "bg-red-100 text-red-800 border-red-200",
                }
                const statusIcons = {
                  PENDING: Clock,
                  APPROVED: CheckCircle,
                  REJECTED: XCircle,
                }
                const StatusIcon = statusIcons[application.status]

                return (
                  <Card key={application.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      {application.property.images && application.property.images.length > 0 ? (
                        <img
                          src={application.property.images[0].url}
                          alt={application.property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Building2 className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <Badge
                        className={`absolute top-3 right-3 ${statusColors[application.status]}`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {application.status}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <CardTitle className="text-lg mb-2 line-clamp-1">
                        {application.property.title}
                      </CardTitle>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="line-clamp-1">{application.property.address}, {application.property.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            ${Number(application.property.price).toLocaleString()}
                            {application.property.property_type && ` / ${application.property.property_type}`}
                          </span>
                        </div>
                      </div>
                      {application.message && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {application.message}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
                        <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/properties/${application.property.id}`)}
                        >
                          View Property
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    )
  }

  // Render full dashboard for admin users
  return (
    <main className="flex-1 overflow-y-auto bg-white">
      <div className="space-y-4 p-3 sm:p-4 lg:p-5">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-600">Welcome back, {userName}. Here's your overview.</p>
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(headlineStats.length ? headlineStats : headlineStatsFallback).map((stat: any) => (
            <Card 
              key={stat.label} 
              className="group border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                    {headlineStats.length ? (
                      <>
                        <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          {stat.isPositive ? (
                            <ArrowUpRight className="h-3 w-3 text-[#2a6f97]" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-gray-600" />
                          )}
                          <span className="text-gray-600">{stat.change} from last month</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-6 w-24 animate-pulse rounded-md bg-gray-200" />
                        <div className="h-3 w-32 animate-pulse rounded-md bg-gray-100" />
                      </>
                    )}
                  </div>
                  <div className="rounded-lg bg-[#2a6f97]/10 p-2 text-[#2a6f97] transition-colors group-hover:bg-[#2a6f97]/20">
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          {/* Revenue Chart */}
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Revenue & Expenses</CardTitle>
              <CardDescription className="text-xs text-gray-600">Monthly financial overview</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2a6f97" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2a6f97" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3a7fa7" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3a7fa7" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2a6f97" 
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    name="Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#3a7fa7" 
                    strokeWidth={2}
                    fill="url(#expensesGradient)"
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Property Types Pie Chart */}
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Property Distribution</CardTitle>
              <CardDescription className="text-xs text-gray-600">Portfolio composition</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={propertyTypes as any}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {propertyTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {propertyTypes.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-lg bg-gray-50/50 p-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Occupancy & Payments */}
        <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
          {/* Occupancy Chart */}
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Occupancy Rate</CardTitle>
              <CardDescription className="text-xs text-gray-600">Monthly occupancy trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={occupancyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2a6f97" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2a6f97" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    domain={[70, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="occupancy" 
                    stroke="#2a6f97" 
                    strokeWidth={3}
                    fill="url(#occupancyGradient)"
                    name="Occupancy"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Payment Status</CardTitle>
              <CardDescription className="text-xs text-gray-600">Current payment overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentStatus.map((item) => (
                  <div key={item.status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{item.status}</span>
                      <span className="text-sm font-semibold text-gray-900">{item.count} payments</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-[#2a6f97] transition-all duration-500"
                        style={{ 
                          width: `${(item.count / paymentStatus.reduce((acc, curr) => acc + curr.count, 0)) * 100}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">${item.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">Recent Activity</CardTitle>
            <CardDescription className="text-xs text-gray-600">Latest transactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center justify-between rounded-lg bg-gray-50/50 p-4 transition-colors hover:bg-gray-100/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-[#2a6f97]/10 p-2">
                      {activity.type === "Payment" && <CreditCard className="h-4 w-4 text-[#2a6f97]" />}
                      {activity.type === "Lease" && <Building2 className="h-4 w-4 text-[#2a6f97]" />}
                      {activity.type === "Maintenance" && <Calendar className="h-4 w-4 text-[#2a6f97]" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-600">{activity.time}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${
                    activity.amount.startsWith('-') ? 'text-gray-600' : 'text-gray-900'
                  }`}>
                    {activity.amount}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}