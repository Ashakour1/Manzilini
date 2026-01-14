"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, UserCheck } from "lucide-react"
import { API_URL } from "@/lib/api"

type AgentStats = {
  totalProperties: number
  activeTenants: number
  totalLandlords: number
  monthlyRevenue: number
}

export default function AgentDashboardPage() {
  const { user, isHydrated, isLoggedIn } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState<AgentStats>({
    totalProperties: 0,
    activeTenants: 0,
    totalLandlords: 0,
    monthlyRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isHydrated) return

    if (!isLoggedIn || user?.role?.toUpperCase() !== "AGENT") {
      router.replace("/agent-login")
      return
    }

    

    // Load agent-specific stats
    const loadStats = async () => {
      try {
        setIsLoading(true)
        const token = user?.token
        if (!token) {
          throw new Error("No authentication token")
        }

        // Fetch properties for agent
        const propertiesResponse = await fetch(`${API_URL}/properties/agent`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        // Fetch landlords for agent
        const landlordsResponse = await fetch(`${API_URL}/landlords/agent`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!propertiesResponse.ok) {
          throw new Error("Failed to load properties")
        }

        if (!landlordsResponse.ok) {
          throw new Error("Failed to load landlords")
        }

        const properties = await propertiesResponse.json()
        const landlords = await landlordsResponse.json()

        // Calculate stats from the responses
        const totalProperties = properties?.length || 0
        const totalLandlords = landlords?.length || 0
        
        // Count active tenants (properties with status RENTED)
        const activeTenants = properties?.filter((p: any) => p.status === 'RENTED').length || 0

        setStats({
          totalProperties,
          activeTenants,
          totalLandlords,
          monthlyRevenue: 0, // Not used but kept for type compatibility
        })
        setError(null)
      } catch (err) {
        console.error("Error loading agent stats:", err)
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
        // Keep existing stats, don't reset to 0
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [isHydrated, isLoggedIn, user, router])

  const headlineStats = useMemo(() => {
    return [
      {
        label: "My Properties",
        value: stats.totalProperties.toString(),
        icon: Building2,
        color: "text-[#2a6f97]",
        bgColor: "bg-[#2a6f97]/10",
      },
      {
        label: "Active Tenants",
        value: stats.activeTenants.toString(),
        icon: Users,
        color: "text-[#2a6f97]",
        bgColor: "bg-[#2a6f97]/10",
      },
      {
        label: "Landlords",
        value: stats.totalLandlords.toString(),
        icon: UserCheck,
        color: "text-[#2a6f97]",
        bgColor: "bg-[#2a6f97]/10",
      },
    ]
  }, [stats])

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const userName = user?.name?.split(' ')[0] || 'Agent'
  
  return (
    <main className="flex-1 overflow-y-auto bg-white">
      <div className="space-y-4 p-3 sm:p-4 lg:p-5">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">Agent Dashboard</h1>
          <p className="text-xs text-gray-600">Welcome back, {userName}. Here's your overview.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            {error} - Showing default values. Please contact support if this persists.
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {headlineStats.map((stat) => (
            <Card 
              key={stat.label} 
              className="group border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-gray-600">{stat.label}</p>
                    {isLoading ? (
                      <div className="h-5 w-20 animate-pulse rounded-md bg-gray-200" />
                    ) : (
                      <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                    )}
                  </div>
                  <div className={`rounded-lg ${stat.bgColor} p-1.5 ${stat.color} transition-colors group-hover:opacity-80`}>
                    <stat.icon className="h-3 w-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border border-gray-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Quick Actions</CardTitle>
              <CardDescription className="text-xs text-gray-600">Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Use the navigation menu to access your properties, landlords, and tenants.
                </p>
                <p className="text-xs text-gray-500">
                  As a field agent, you can view and manage properties assigned to you, 
                  communicate with landlords and tenants, and track your activities.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">Account Information</CardTitle>
              <CardDescription className="text-xs text-gray-600">Your agent profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">{user?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{user?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm font-medium text-gray-900">Field Agent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
