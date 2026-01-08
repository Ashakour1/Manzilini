"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp, Download, Users, Building2, FileText, DollarSign, UserCheck, AlertCircle, Loader2 } from "lucide-react"
import { getReports, type ReportsData } from "@/services/reports.service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"

const COLORS = ['#2a6f97', '#60a5fa', '#93c5fd', '#dbeafe', '#3b82f6', '#1e40af'];

export function ReportsPage() {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // Generate month options (last 12 months + current month)
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Add "All Time" option
    options.push({ value: "", label: "All Time" });
    
    // Add last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      options.push({ value: `${year}-${month}`, label: monthName });
    }
    
    return options;
  };

  const monthOptions = generateMonthOptions();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const data = await getReports(selectedMonth || undefined);
        setReports(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError(err instanceof Error ? err.message : "Failed to load reports");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [selectedMonth]);

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto bg-background p-3 sm:p-4 lg:p-5">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-[#2a6f97]" />
        </div>
      </main>
    );
  }

  if (error || !reports) {
    return (
      <main className="flex-1 overflow-y-auto bg-background p-3 sm:p-4 lg:p-5">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error || "Failed to load reports"}</p>
          </div>
        </div>
      </main>
    );
  }

  const { overall, properties, payments, users } = reports;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate occupancy rate (rented properties / total properties)
  const rentedCount = properties?.byStatus?.find(p => p.status === 'RENTED')?.count || 0;
  const occupancyRate = overall.totalProperties > 0 
    ? Math.round((rentedCount / overall.totalProperties) * 100) 
    : 0;

  // Calculate collection rate (completed payments / total payments)
  const completedPayments = payments?.byStatus?.find(p => p.status === 'COMPLETED')?.count || 0;
  const collectionRate = overall.totalPayments > 0
    ? Math.round((completedPayments / overall.totalPayments) * 100)
    : 0;

  return (
    <main className="flex-1 overflow-y-auto bg-background p-3 sm:p-4 lg:p-5">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Reports & Analytics</h1>
          <p className="text-xs text-muted-foreground">Comprehensive statistics and user performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#2a6f97]/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-[#2a6f97]" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">Total Revenue</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(overall.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">Total Properties</p>
                <p className="text-xl font-bold text-foreground">{overall.totalProperties}</p>
                <p className="text-xs text-green-600 mt-1">+{overall.recentActivity.propertiesCreated} this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">Total Users</p>
                <p className="text-xl font-bold text-foreground">{overall.totalUsers}</p>
                <p className="text-xs text-muted-foreground mt-1">{overall.totalLandlords} landlords</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-[#2a6f97]" />
              <div>
                <p className="text-muted-foreground text-sm font-medium">Occupancy Rate</p>
                <p className="text-2xl font-bold text-foreground">{occupancyRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">{rentedCount} of {overall.totalProperties} rented</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Collection Rate</p>
              <p className="text-2xl font-bold text-foreground">{collectionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">{completedPayments} of {overall.totalPayments} completed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Field Agents</p>
              <p className="text-2xl font-bold text-foreground">{overall.totalFieldAgents}</p>
              <p className="text-xs text-muted-foreground mt-1">Active agents</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Properties by Status</CardTitle>
            <CardDescription>Distribution of properties by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={properties?.byStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.status}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(properties?.byStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Properties by Type</CardTitle>
            <CardDescription>Distribution of properties by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={properties?.byType || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="type" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "none", borderRadius: "8px" }} />
                <Bar dataKey="count" fill="#2a6f97" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Payments by Status</CardTitle>
            <CardDescription>Distribution of payment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={payments?.byStatus || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="status" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "none", borderRadius: "8px" }} />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Statistics Table */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {selectedMonth 
              ? `List of all users and their properties created in ${monthOptions.find(opt => opt.value === selectedMonth)?.label || selectedMonth}`
              : "List of all users in the system with their property counts"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Properties Created</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!users || users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-[#2a6f97]/10 flex items-center justify-center">
                              <UserCheck className="h-4 w-4 text-[#2a6f97]" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-medium">
                          <Building2 className="mr-1 h-3 w-3 inline" />
                          {user.propertiesCount || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </main>
  )
}
