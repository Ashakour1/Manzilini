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
} from "recharts"
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Flame, ShieldCheck, Signal, TrendingUp } from "lucide-react"
import { use, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"

const headlineStats = [
  { label: "Total earnings", value: "$320,123", change: "+11%", color: "text-emerald-600", bg: "bg-emerald-50", icon: Signal },
  { label: "Properties", value: "250", change: "-11%", color: "text-rose-600", bg: "bg-rose-50", icon: Building2 },
  { label: "Tenants", value: "2,263", change: "+11%", color: "text-emerald-600", bg: "bg-emerald-50", icon: ShieldCheck },
  { label: "Landlords", value: "259", change: "-11%", color: "text-rose-600", bg: "bg-rose-50", icon: TrendingUp },
]

const cashflow = [
  { month: "Jan", collected: 48000, target: 52000 },
  { month: "Feb", collected: 51000, target: 52000 },
  { month: "Mar", collected: 49500, target: 53000 },
  { month: "Apr", collected: 56000, target: 53500 },
  { month: "May", collected: 54000, target: 54000 },
  { month: "Jun", collected: 59000, target: 54500 },
  { month: "Jul", collected: 60500, target: 55000 },
  { month: "Aug", collected: 63000, target: 55500 },
  { month: "Sep", collected: 65000, target: 56000 },
  { month: "Oct", collected: 67000, target: 56500 },
  { month: "Nov", collected: 68000, target: 57000 },
  { month: "Dec", collected: 72000, target: 58000 },
]

const leasingPace = [
  { label: "Tour requests", value: 38 },
  { label: "Applications", value: 26 },
  { label: "Approvals", value: 18 },
  { label: "Move-ins", value: 12 },
]

  

const utilization = [
  { name: "Stabilized", value: 68, color: "#22c55e" },
  { name: "Lease-up", value: 22, color: "#38bdf8" },
  { name: "Renovation", value: 10, color: "#f59e0b" },
]

const watchlist = [
  { title: "Unit 5C | HVAC", note: "Vendor ETA today 4pm", status: "In progress" },
  { title: "Invoice #1482", note: "Overdue 7 days — send reminder", status: "Action" },
  { title: "Lease renewal | Apt 210", note: "Tenant asked for 18-month term", status: "Review" },
]

const tenants = [
  { name: "Riya Ahmed", property: "Parkside 204", status: "Available" },
  { name: "Miguel Torres", property: "Harborview 12B", status: "Pending" },
  { name: "Nina Patel", property: "Townhome 8", status: "Unavailable" },
]

const toneMap: Record<string, string> = {
  emerald: "from-emerald-500/90 to-emerald-600/70 text-emerald-900 dark:text-emerald-50",
  sky: "from-sky-500/90 to-sky-600/70 text-sky-900 dark:text-sky-50",
  violet: "from-indigo-500/90 to-violet-500/70 text-indigo-900 dark:text-indigo-50",
  amber: "from-amber-500/90 to-amber-600/70 text-amber-900 dark:text-amber-50",
}

const kpis = [
  { label: "Portfolio value", value: "$42.8M", delta: "+3.2%", icon: TrendingUp, tone: "emerald" },
  { label: "Occupancy", value: "91%", delta: "+2.1%", icon: Building2, tone: "sky" },
  { label: "On-time payments", value: "88%", delta: "+5.4%", icon: ShieldCheck, tone: "violet" },
  { label: "Open maintenance", value: "12", delta: "-3 vs last week", icon: Flame, tone: "amber" },
]

export function DashboardContent() {

  const router = useRouter()
  const {user, isLoggedIn, isHydrated} = useAuthStore()

  useEffect(() => {
    if(!isHydrated) return

    if(!isLoggedIn){
      router.replace("/")
      return
    }

    


  },[isHydrated,isLoggedIn,router])
  if(!isHydrated){
      return <h1>
        loading
      </h1>
    }

    // if(isLoggedIn) return <h1>
    //   loading
    // </h1>

    // if()
  // const {name,email} = useAuthStore();

// console.log("Authenticated user:", name);
  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background via-background to-muted/50">
      <div className="space-y-8 p-6 md:p-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dashboard</p>
              <h2 className="text-2xl font-semibold text-foreground">Good morning, Riyad</h2>
            </div>
            <Button variant="outline" size="sm">
              Customize
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {headlineStats.map((stat) => (
              <Card key={stat.label} className="border-border shadow-sm hover:shadow-md transition">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${stat.bg} ${stat.color}`}>
                          <span className={stat.color}>{stat.change.startsWith("-") ? "↓" : "↑"}</span>
                          <span className={stat.color}>{stat.change}</span>
                        </span>
                        <span>Last week</span>
                      </div>
                    </div>
                    <div className="rounded-full bg-muted/60 p-2 text-muted-foreground">
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

       

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((item) => (
            <Card key={item.label} className="border-none shadow-none">
              <CardContent className="p-0">
                <div className={`rounded-2xl bg-gradient-to-br ${toneMap[item.tone]} p-4 shadow-lg ring-1 ring-white/10`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/80">{item.label}</p>
                      <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
                      <p className="text-xs text-white/80">{item.delta}</p>
                    </div>
                    <div className="rounded-xl bg-white/20 p-2 text-white">
                      <item.icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
          <Card className="border border-border/70 shadow-md">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Cashflow vs target</CardTitle>
                <CardDescription>Monthly collections and targets</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Last 12 months
                </Button>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={cashflow}>
                  <defs>
                    <linearGradient id="cash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", color: "#fff", borderRadius: 12, border: "none" }} />
                  <Area type="monotone" dataKey="collected" stroke="#06b6d4" strokeWidth={3} fill="url(#cash)" />
                  <Line type="monotone" dataKey="target" stroke="#a855f7" strokeWidth={2} dot={{ r: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-border/70 shadow-md">
            <CardHeader>
              <CardTitle>Portfolio mix</CardTitle>
              <CardDescription>Current utilization by state</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={utilization} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                    {utilization.map((entry, index) => (
                      <Cell key={entry.name + index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {utilization.map((item) => (
                  <div key={item.name} className="rounded-lg border border-border/70 p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <p className="font-semibold text-foreground">{item.name}</p>
                    </div>
                    <p className="text-muted-foreground mt-1">{item.value}% of units</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
          <Card className="border border-border/70 shadow-md">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Leasing funnel</CardTitle>
                <CardDescription>Movement from tours to move-ins</CardDescription>
              </div>
              <Badge variant="outline" className="gap-2">
                <Signal className="h-4 w-4" />
                Strong pace
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {leasingPace.map((item) => (
                  <div key={item.label} className="rounded-xl border border-border/80 bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={leasingPace}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-border/70 shadow-md">
            <CardHeader>
              <CardTitle>Tenant signals</CardTitle>
              <CardDescription>Quick scan of tenant health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tenants.map((tenant) => (
                <div key={tenant.name} className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/40 p-3">
                  <div>
                    <p className="font-semibold text-foreground">{tenant.name}</p>
                    <p className="text-xs text-muted-foreground">{tenant.property}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      tenant.status === "Available"
                        ? "border-emerald-200/60 bg-emerald-50 text-emerald-700"
                        : tenant.status === "Pending"
                          ? "border-amber-200/60 bg-amber-50 text-amber-700"
                          : "border-red-200/60 bg-red-50 text-red-700"
                    }
                  >
                    {tenant.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border border-border/70 shadow-md">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Momentum board</CardTitle>
              <CardDescription>What changed in the last 24 hours</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              View audit log
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={cashflow.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Line type="monotone" dataKey="collected" stroke="#22c55e" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="target" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
