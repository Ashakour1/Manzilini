"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, TrendingUp, Users, AlertCircle, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

const dashboardStats = [
  {
    icon: Building2,
    label: "Total Properties",
    value: "24",
    change: "+2.5%",
  },
  {
    icon: TrendingUp,
    label: "Occupancy Rate",
    value: "87%",
    change: "+5.2%",
  },
  {
    icon: Users,
    label: "Active Tenants",
    value: "156",
    change: "+12",
  },
  {
    icon: AlertCircle,
    label: "Pending Requests",
    value: "8",
    change: "-1",
  },
]

const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 67000 },
]

const occupancyData = [
  { month: "Jan", occupancy: 78 },
  { month: "Feb", occupancy: 82 },
  { month: "Mar", occupancy: 85 },
  { month: "Apr", occupancy: 87 },
  { month: "May", occupancy: 86 },
  { month: "Jun", occupancy: 89 },
]

const propertyTypes = [
  { name: "Apartment", value: 12 },
  { name: "House", value: 8 },
  { name: "Commercial", value: 4 },
]

const propertyColors = ["#3b82f6", "#60a5fa", "#93c5fd"]

const recentPayments = [
  { id: 1, tenant: "John Doe", property: "Apartment 101", amount: "$1,200", date: "2024-11-25", status: "Completed" },
  { id: 2, tenant: "Jane Smith", property: "House 5B", amount: "$1,500", date: "2024-11-24", status: "Completed" },
  { id: 3, tenant: "Mike Johnson", property: "Commercial 3", amount: "$2,500", date: "2024-11-23", status: "Pending" },
]

const expiringLeases = [
  { id: 1, tenant: "Sarah Wilson", property: "Apartment 202", expiryDate: "2024-12-15", daysLeft: 18 },
  { id: 2, tenant: "Tom Brown", property: "House 7A", expiryDate: "2024-12-28", daysLeft: 31 },
]

export function DashboardContent() {
  return (
    <main className="flex-1 overflow-y-auto bg-background p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your property overview.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-2">{stat.change} from last month</p>
                </div>
                <stat.icon className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Revenue</CardTitle>
            <CardDescription>Revenue trends over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "none", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Property Types Pie Chart */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Property Types</CardTitle>
            <CardDescription>Distribution by type</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={propertyTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {propertyTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={propertyColors[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "none", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Occupancy Rate Chart */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Occupancy Rate Trend</CardTitle>
            <CardDescription>Monthly occupancy percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "none", borderRadius: "8px" }} />
                <Bar dataKey="occupancy" fill="#60a5fa" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Map Section Placeholder */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Property Locations
            </CardTitle>
            <CardDescription>24 properties mapped</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Map integration available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Payments</CardTitle>
            <CardDescription>Latest 3 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{payment.tenant}</p>
                    <p className="text-xs text-muted-foreground">{payment.property}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground text-sm">{payment.amount}</p>
                    <p className={`text-xs ${payment.status === "Completed" ? "text-green-600" : "text-yellow-600"}`}>
                      {payment.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Leases */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expiring Leases
            </CardTitle>
            <CardDescription>Leases expiring soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expiringLeases.map((lease) => (
                <div
                  key={lease.id}
                  className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{lease.tenant}</p>
                    <p className="text-xs text-muted-foreground">{lease.property}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground text-sm">{lease.daysLeft} days</p>
                    <p className="text-xs text-muted-foreground">{lease.expiryDate}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View All Leases
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
