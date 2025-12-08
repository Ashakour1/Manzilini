"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Download } from "lucide-react"

const monthlyRevenue = [
  { month: "Jul", revenue: 48000 },
  { month: "Aug", revenue: 52000 },
  { month: "Sep", revenue: 51000 },
  { month: "Oct", revenue: 61000 },
  { month: "Nov", revenue: 65000 },
  { month: "Dec", revenue: 68000 },
]

const propertyPerformance = [
  { name: "Apartment 101", revenue: 14400 },
  { name: "House 5B", revenue: 18000 },
  { name: "Commercial 3", revenue: 30000 },
  { name: "Apartment 202", revenue: 5600 },
]

export function ReportsPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-background p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reports</h1>
          <p className="text-muted-foreground">View detailed analytics and performance reports</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-muted-foreground text-sm font-medium">YTD Revenue</p>
                <p className="text-3xl font-bold text-foreground">$345,000</p>
                <p className="text-xs text-green-600 mt-1">+12% from last year</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Avg Occupancy</p>
              <p className="text-3xl font-bold text-foreground">87%</p>
              <p className="text-xs text-green-600 mt-1">Above target (85%)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Collection Rate</p>
              <p className="text-3xl font-bold text-foreground">94%</p>
              <p className="text-xs text-green-600 mt-1">Industry avg: 90%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue for the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "none", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Property Performance</CardTitle>
            <CardDescription>Revenue by property</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={propertyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "none", borderRadius: "8px" }} />
                <Bar dataKey="revenue" fill="#60a5fa" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Generate Custom Report</CardTitle>
          <CardDescription>Create detailed reports with custom date ranges and filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Report Type</label>
              <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                <option>Financial Report</option>
                <option>Occupancy Report</option>
                <option>Maintenance Report</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Date Range</label>
              <input
                type="text"
                placeholder="Select dates"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Generate</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
