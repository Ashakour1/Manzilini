"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  ClipboardList,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon,
  Wallet,
  Plus,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Wrench,
  Activity,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { getProperties } from "@/lib/services/property.service";
import { getApplications } from "@/lib/services/application.service";
import { getTenants } from "@/lib/services/tenant.service";
import { getPropertyIncomes, getPropertyExpenses } from "@/lib/services/finance.service";
import type { PropertyIncome, PropertyExpense } from "@/lib/services/finance.service";
import { getMaintenanceRequests } from "@/lib/services/maintenance.service";
import type { Tenant, MaintenanceRequest } from "@/lib/types";
import { useLoad } from "@/lib/hooks/useLoad";
import { useAuthStore } from "@/lib/store/auth.store";

function fmtAmount(amount: string | number) {
  return Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONTACTED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  CLOSED: "bg-slate-100 text-slate-600",
};

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "bg-red-100 text-red-700 ring-red-200",
  HIGH: "bg-orange-100 text-orange-700 ring-orange-200",
  MEDIUM: "bg-amber-100 text-amber-700 ring-amber-200",
  LOW: "bg-slate-100 text-slate-600 ring-slate-200",
};

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  const now = new Date();
  const d = new Date(dateStr);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-[var(--muted)] ${className}`} />;
}

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-[200px] w-full" />
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const userName = user?.name ?? user?.email ?? "User";
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [tenantsCount, setTenantsCount] = useState(0);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [incomes, setIncomes] = useState<PropertyIncome[]>([]);
  const [expenses, setExpenses] = useState<PropertyExpense[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [recentApplications, setRecentApplications] = useState<{ id: string; fullName: string; createdAt: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [props, apps, ten, inc, exp, maint] = await Promise.all([
        getProperties(),
        getApplications(),
        getTenants(),
        getPropertyIncomes(),
        getPropertyExpenses(),
        getMaintenanceRequests().catch(() => ({ requests: [], properties: [] })),
      ]);
      setPropertiesCount(props.length);
      setApplicationsCount(apps.length);
      const tenantList: Tenant[] = Array.isArray(ten) ? ten : (ten.tenants ?? []);
      setTenants(tenantList);
      setTenantsCount(tenantList.length);
      setIncomes(inc);
      setExpenses(exp);
      setIncomeTotal(inc.reduce((s, i) => s + Number(i.amount || 0), 0));
      setExpenseTotal(exp.reduce((s, e) => s + Number(e.amount || 0), 0));
      setRecentApplications(apps.slice(0, 5).map((a) => ({ id: a.id, fullName: a.fullName, createdAt: a.createdAt, status: a.status })));
      setMaintenanceRequests(Array.isArray(maint) ? maint : (maint?.requests ?? []));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useLoad(load);

  const net = incomeTotal - expenseTotal;

  const { monthlyData, expenseByCategory, incomeVsExpense } = useMemo(() => {
    const months = 6;
    const now = new Date();
    const monthlyData: { month: string; income: number; expense: number }[] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const income = incomes
        .filter((i) => i.incomeDate?.startsWith(key))
        .reduce((s, i) => s + Number(i.amount || 0), 0);
      const expense = expenses
        .filter((e) => e.expenseDate?.startsWith(key))
        .reduce((s, e) => s + Number(e.amount || 0), 0);
      monthlyData.push({
        month: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,
        income,
        expense,
      });
    }

    const categoryMap: Record<string, number> = {};
    expenses.forEach((e) => {
      const c = e.category || "Other";
      categoryMap[c] = (categoryMap[c] || 0) + Number(e.amount || 0);
    });
    const expenseByCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    const incomeVsExpense = [
      { name: "Income", value: incomeTotal, color: "#10b981" },
      { name: "Expense", value: expenseTotal, color: "#ef4444" },
    ].filter((d) => d.value > 0);

    return { monthlyData, expenseByCategory, incomeVsExpense };
  }, [incomes, expenses, incomeTotal, expenseTotal]);

  const { upcomingLeases, openMaintenance, recentActivity, topProperties } = useMemo(() => {
    const now = new Date();
    const in60Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 60);

    const upcomingLeases = tenants
      .filter((t) => {
        if (!t.leaseEnd) return false;
        const d = new Date(t.leaseEnd);
        return d >= now && d <= in60Days;
      })
      .sort((a, b) => new Date(a.leaseEnd!).getTime() - new Date(b.leaseEnd!).getTime())
      .slice(0, 5);

    const openMaintenance = maintenanceRequests
      .filter((m) => {
        const s = (m.statusEnum || m.status || "").toUpperCase();
        return s !== "RESOLVED" && s !== "CLOSED" && s !== "COMPLETED";
      })
      .sort((a, b) => {
        const order = ["URGENT", "HIGH", "MEDIUM", "LOW"];
        const pa = order.indexOf((a.priorityEnum || a.priority || "").toUpperCase());
        const pb = order.indexOf((b.priorityEnum || b.priority || "").toUpperCase());
        return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
      })
      .slice(0, 5);

    type ActivityItem = {
      id: string;
      kind: "income" | "expense";
      title: string;
      property: string;
      date: string;
      amount: number;
    };
    const activityItems: ActivityItem[] = [
      ...incomes.map((i) => ({
        id: `in-${i.id}`,
        kind: "income" as const,
        title: i.source || "Income",
        property: i.property?.title ?? "—",
        date: i.incomeDate,
        amount: Number(i.amount || 0),
      })),
      ...expenses.map((e) => ({
        id: `ex-${e.id}`,
        kind: "expense" as const,
        title: e.category || "Expense",
        property: e.property?.title ?? "—",
        date: e.expenseDate,
        amount: Number(e.amount || 0),
      })),
    ];
    const recentActivity = activityItems
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);

    const byProperty: Record<string, { id: string; title: string; income: number }> = {};
    incomes.forEach((i) => {
      const pid = i.propertyId;
      if (!byProperty[pid]) {
        byProperty[pid] = {
          id: pid,
          title: i.property?.title ?? "Property",
          income: 0,
        };
      }
      byProperty[pid].income += Number(i.amount || 0);
    });
    const topProperties = Object.values(byProperty)
      .sort((a, b) => b.income - a.income)
      .slice(0, 5);

    return { upcomingLeases, openMaintenance, recentActivity, topProperties };
  }, [tenants, maintenanceRequests, incomes, expenses]);

  const now = new Date();
  const today = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const greetingTime =
    now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const firstName = userName.split(" ")[0];

  const pendingApplications = recentApplications.filter((a) => a.status === "PENDING").length;
  const heroSubtitle =
    pendingApplications > 0
      ? `You have ${pendingApplications} application${pendingApplications === 1 ? "" : "s"} waiting for your review.`
      : net > 0
      ? "Your portfolio is in the green this month — nice work."
      : "Here's a snapshot of everything happening today.";

  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const monthIncome = currentMonth?.income ?? 0;
  const monthNet = (currentMonth?.income ?? 0) - (currentMonth?.expense ?? 0);
  const prevMonthIncome = previousMonth?.income ?? 0;
  const incomeDeltaPct =
    prevMonthIncome > 0 ? ((monthIncome - prevMonthIncome) / prevMonthIncome) * 100 : 0;

  const stats: {
    label: string;
    value: string;
    href: string;
    icon: React.ReactNode;
    accent: string;
    valueClass?: string;
    isCurrency?: boolean;
  }[] = [
    {
      label: "Properties",
      value: String(propertiesCount),
      href: "/properties",
      icon: <Building2 className="h-5 w-5" />,
      accent: "text-sky-600",
    },
    {
      label: "Applications",
      value: String(applicationsCount),
      href: "/applications",
      icon: <ClipboardList className="h-5 w-5" />,
      accent: "text-violet-600",
    },
    {
      label: "Tenants",
      value: String(tenantsCount),
      href: "/tenants",
      icon: <Users className="h-5 w-5" />,
      accent: "text-amber-600",
    },
    {
      label: "Total Income",
      value: fmtAmount(incomeTotal),
      href: "/finance/income",
      icon: <ArrowDownCircle className="h-5 w-5" />,
      accent: "text-emerald-600",
      valueClass: "text-emerald-600",
      isCurrency: true,
    },
    {
      label: "Total Expenses",
      value: fmtAmount(expenseTotal),
      href: "/finance/expense",
      icon: <ArrowUpCircle className="h-5 w-5" />,
      accent: "text-rose-600",
      valueClass: "text-rose-600",
      isCurrency: true,
    },
    {
      label: "Net",
      value: fmtAmount(net),
      href: "/finance/report",
      icon: <TrendingUp className="h-5 w-5" />,
      accent: net >= 0 ? "text-emerald-600" : "text-rose-600",
      valueClass: net >= 0 ? "text-emerald-600" : "text-rose-600",
      isCurrency: true,
    },
  ];

  return (
    <div className="p-4 sm:p-5 md:p-6 space-y-6">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-gradient-to-br from-[var(--primary)] via-[#235d7f] to-[#0f1e2e] text-white shadow-sm">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.10] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          aria-hidden
          className="absolute -top-28 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute right-10 top-10 hidden lg:block pointer-events-none"
        >
          <div className="h-16 w-16 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-sm rotate-12" />
        </div>

        <div className="relative p-5 sm:p-6 md:p-7">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/10">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  Welcome back
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/85 bg-white/[0.06] backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/10">
                  <CalendarDays className="h-3 w-3" aria-hidden />
                  {today}
                </span>
              </div>
              <h1 className="mt-4 text-2xl sm:text-[30px] font-semibold tracking-tight leading-[1.15]">
                {greetingTime}, <span className="text-white">{firstName}</span>.
        </h1>
              <p className="mt-2 text-sm sm:text-[15px] text-white/80 max-w-xl leading-relaxed">
                {heroSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 md:pt-1">
              <Link
                href="/properties/new"
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-white text-[var(--primary)] text-sm font-medium shadow-sm hover:bg-white/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add property
              </Link>
              <Link
                href="/finance/income"
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-medium transition-colors"
              >
                <ArrowDownCircle className="h-4 w-4" />
                Record income
              </Link>
            </div>
          </div>

          {/* Inline snapshot strip */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-md p-3 sm:p-4">
            <div className="px-2">
              <p className="text-[10px] uppercase tracking-wider text-white/60">Net this month</p>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                {loading ? (
                  <span className="inline-block h-5 w-20 rounded bg-white/10 animate-pulse" />
                ) : (
                  <>
                    <span className="text-base sm:text-lg font-semibold text-white tabular-nums">
                      {fmtAmount(monthNet)}
                    </span>
                    {monthNet !== 0 && (
                      <span
                        className={`inline-flex items-center text-[11px] font-medium ${
                          monthNet >= 0 ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {monthNet >= 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="px-2 sm:border-l sm:border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-white/60">Income trend</p>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                {loading ? (
                  <span className="inline-block h-5 w-16 rounded bg-white/10 animate-pulse" />
                ) : (
                  <>
                    <span className="text-base sm:text-lg font-semibold text-white tabular-nums">
                      {incomeDeltaPct === 0 ? "—" : `${incomeDeltaPct > 0 ? "+" : ""}${incomeDeltaPct.toFixed(1)}%`}
                    </span>
                    <span className="text-[11px] text-white/60">vs last mo.</span>
                  </>
                )}
              </div>
            </div>

            <div className="px-2 sm:border-l sm:border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-white/60">Pending apps</p>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                {loading ? (
                  <span className="inline-block h-5 w-10 rounded bg-white/10 animate-pulse" />
                ) : (
                  <>
                    <span className="text-base sm:text-lg font-semibold text-white tabular-nums">
                      {pendingApplications}
                    </span>
                    <span className="text-[11px] text-white/60">to review</span>
                  </>
                )}
              </div>
            </div>

            <div className="px-2 sm:border-l sm:border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-white/60">Properties</p>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                {loading ? (
                  <span className="inline-block h-5 w-10 rounded bg-white/10 animate-pulse" />
                ) : (
                  <>
                    <span className="text-base sm:text-lg font-semibold text-white tabular-nums">
                      {propertiesCount}
                    </span>
                    <span className="text-[11px] text-white/60">
                      {tenantsCount} {tenantsCount === 1 ? "tenant" : "tenants"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between">
          {error}
          <button onClick={() => setError("")} className="font-bold">&times;</button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group">
            <Card className="border-[var(--border)] h-full transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--primary)]/30">
              <div className="px-5 pt-5 pb-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center justify-center ${s.accent}`}>
                    {s.icon}
                  </span>
                  <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[var(--muted-foreground)] tracking-wide uppercase">
                    {s.label}
                  </p>
                  {loading ? (
                    <Skeleton className="h-7 w-20" />
                  ) : (
                    <div className={`text-[22px] font-semibold tracking-tight ${s.valueClass ?? "text-[var(--foreground)]"}`}>
                      {s.value}
                    </div>
                  )}
                </div>
              </div>
          </Card>
        </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="border-[var(--border)] shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center text-[var(--primary)]">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-base">Income vs Expense</CardTitle>
                <CardDescription>Monthly trend (last 6 months)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <ChartSkeleton />
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))} axisLine={false} tickLine={false} width={36} />
                    <Tooltip
                      content={({ active, payload, label }) =>
                        active && payload?.length ? (
                          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 shadow-lg text-sm">
                            <p className="font-medium text-[var(--foreground)] mb-2">{label}</p>
                            <div className="space-y-1">
                              <p className="text-emerald-600">Income: {fmtAmount(payload[0]?.value ?? 0)}</p>
                              <p className="text-red-600">Expense: {fmtAmount(payload[1]?.value ?? 0)}</p>
                            </div>
                          </div>
                        ) : null
                      }
                    />
                    <Legend wrapperStyle={{ paddingTop: 8 }} formatter={(v) => <span className="text-sm text-[var(--muted-foreground)]">{v}</span>} />
                    <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGradient)" />
                    <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-[var(--border)] shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center text-emerald-600">
                <PieChartIcon className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-base">Income vs Expense</CardTitle>
                <CardDescription>Total breakdown</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <ChartSkeleton />
              </div>
            ) : incomeVsExpense.length === 0 ? (
              <div className="h-[300px] flex flex-col items-center justify-center gap-3 text-[var(--muted-foreground)]">
                <Wallet className="h-12 w-12 opacity-50" />
                <p className="text-sm font-medium">No financial data yet</p>
                <p className="text-xs text-center max-w-[200px]">Add income and expenses to see your totals here</p>
                <Link href="/finance/income">
                  <Button variant="outline" size="sm">Add income</Button>
                </Link>
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeVsExpense}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent ?? 0 * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {incomeVsExpense.map((_, i) => (
                        <Cell key={i} fill={incomeVsExpense[i].color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.[0] ? (
                          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 shadow-lg text-sm">
                            <p className="font-medium text-[var(--foreground)]">{payload[0].name}</p>
                            <p className="text-[var(--muted-foreground)]">{fmtAmount(payload[0].value)}</p>
                          </div>
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-[var(--border)] shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center text-rose-600">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-base">Expense by Category</CardTitle>
                <CardDescription>Breakdown of spending by category</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[280px] flex items-center justify-center">
                <ChartSkeleton />
              </div>
            ) : expenseByCategory.length === 0 ? (
              <div className="h-[280px] flex flex-col items-center justify-center gap-3 text-[var(--muted-foreground)]">
                <Wallet className="h-12 w-12 opacity-50" />
                <p className="text-sm font-medium">No expenses yet</p>
                <p className="text-xs text-center max-w-[240px]">Add expenses to see a breakdown by category</p>
                <Link href="/finance/expense">
                  <Button variant="outline" size="sm">Add expense</Button>
                </Link>
              </div>
            ) : (
              <div className="h-[280px] w-full flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-1 h-[200px] sm:h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {expenseByCategory.map((_, i) => (
                          <Cell
                            key={i}
                            fill={["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#64748b"][i % 8]}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) =>
                          active && payload?.[0] ? (
                            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 shadow-lg text-sm">
                              <p className="font-medium text-[var(--foreground)]">{payload[0].name}</p>
                              <p className="text-red-600 font-medium">{fmtAmount(payload[0].value)}</p>
                            </div>
                          ) : null
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-col sm:flex-nowrap sm:justify-center">
                  {expenseByCategory.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#64748b"][i % 8] }}
                      />
                      <span className="text-[var(--foreground)] truncate">{item.name}</span>
                      <span className="text-[var(--muted-foreground)] font-medium ml-auto">{fmtAmount(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card className="border-[var(--border)] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center text-violet-600">
                <ClipboardList className="h-5 w-5" />
              </span>
            <div>
              <CardTitle className="text-base">Recent Applications</CardTitle>
              <CardDescription>Latest property applications</CardDescription>
              </div>
            </div>
            <Link href="/applications">
              <Button variant="ghost" size="sm" className="text-[var(--primary)] hover:text-[var(--primary-hover)]">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="py-12 text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-[var(--muted-foreground)] opacity-50 mb-3" />
                <p className="text-sm font-medium text-[var(--foreground)]">No applications yet</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">Applications will appear here when tenants apply</p>
                <Link href="/applications">
                  <Button variant="outline" size="sm" className="mt-4">View applications</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {recentApplications.map((a) => (
                  <Link
                    key={a.id}
                    href="/applications"
                    className="flex items-center justify-between py-3 px-2 -mx-2 rounded-lg border border-transparent hover:border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0 text-[var(--primary)] font-semibold text-sm">
                        {a.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--foreground)] text-sm truncate">{a.fullName}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{fmtDate(a.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium shrink-0 ${STATUS_COLORS[a.status] ?? "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                      {a.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Open maintenance */}
        <Card className="border-[var(--border)] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center text-orange-600">
                <Wrench className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-base">Open Maintenance</CardTitle>
                <CardDescription>Requests needing attention</CardDescription>
              </div>
            </div>
            <Link href="/maintenance">
              <Button variant="ghost" size="sm" className="text-[var(--primary)] hover:text-[var(--primary-hover)]">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : openMaintenance.length === 0 ? (
              <div className="py-12 text-center">
                <Wrench className="h-12 w-12 mx-auto text-[var(--muted-foreground)] opacity-50 mb-3" />
                <p className="text-sm font-medium text-[var(--foreground)]">All caught up</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">No open maintenance requests right now</p>
                <Link href="/maintenance">
                  <Button variant="outline" size="sm" className="mt-4">Open maintenance</Button>
              </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {openMaintenance.map((m) => {
                  const priority = (m.priorityEnum || m.priority || "MEDIUM").toUpperCase();
                  return (
                    <Link
                      key={m.id}
                      href="/maintenance"
                      className="flex items-center justify-between gap-3 py-3 px-2 -mx-2 rounded-lg border border-transparent hover:border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`shrink-0 ${
                            priority === "URGENT"
                              ? "text-red-600"
                              : priority === "HIGH"
                              ? "text-orange-600"
                              : priority === "MEDIUM"
                              ? "text-amber-600"
                              : "text-slate-500"
                          }`}
                        >
                          {priority === "URGENT" ? <AlertTriangle className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--foreground)] text-sm truncate">{m.issue || "Maintenance request"}</p>
                          <p className="text-xs text-[var(--muted-foreground)] truncate">
                            {m.property?.title ?? "Property"} · {fmtDate(m.reportedDate)}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium shrink-0 ring-1 ${PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.MEDIUM}`}>
                        {priority}
                </span>
              </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lease endings + Top properties */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card className="border-[var(--border)] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center text-amber-600">
                <CalendarClock className="h-5 w-5" />
                </span>
              <div>
                <CardTitle className="text-base">Upcoming Lease Endings</CardTitle>
                <CardDescription>Next 60 days</CardDescription>
              </div>
            </div>
            <Link href="/tenants">
              <Button variant="ghost" size="sm" className="text-[var(--primary)] hover:text-[var(--primary-hover)]">View all</Button>
              </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                ))}
              </div>
            ) : upcomingLeases.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarClock className="h-12 w-12 mx-auto text-[var(--muted-foreground)] opacity-50 mb-3" />
                <p className="text-sm font-medium text-[var(--foreground)]">No lease endings soon</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">Leases ending in the next 60 days will show here</p>
              </div>
            ) : (
              <div className="space-y-1">
                {upcomingLeases.map((t) => {
                  const days = daysUntil(t.leaseEnd);
                  const isUrgent = days !== null && days <= 14;
                  return (
                    <Link
                      key={t.id}
                      href="/tenants"
                      className="flex items-center justify-between gap-3 py-3 px-2 -mx-2 rounded-lg border border-transparent hover:border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0 text-[var(--primary)] font-semibold text-sm">
                          {t.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--foreground)] text-sm truncate">{t.fullName}</p>
                          <p className="text-xs text-[var(--muted-foreground)] truncate">
                            {t.property?.title ?? "Property"} · ends {fmtDate(t.leaseEnd)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium shrink-0 ring-1 ${
                          isUrgent
                            ? "bg-rose-50 text-rose-700 ring-rose-200"
                            : "bg-amber-50 text-amber-700 ring-amber-200"
                        }`}
                      >
                        {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                </span>
              </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center text-emerald-600">
                <Building2 className="h-5 w-5" />
                </span>
              <div>
                <CardTitle className="text-base">Top Properties</CardTitle>
                <CardDescription>By total income</CardDescription>
              </div>
            </div>
            <Link href="/properties">
              <Button variant="ghost" size="sm" className="text-[var(--primary)] hover:text-[var(--primary-hover)]">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2 py-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : topProperties.length === 0 ? (
              <div className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-[var(--muted-foreground)] opacity-50 mb-3" />
                <p className="text-sm font-medium text-[var(--foreground)]">No income recorded yet</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">Add income entries to see top earners</p>
                <Link href="/finance/income">
                  <Button variant="outline" size="sm" className="mt-4">Record income</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {topProperties.map((p, i) => {
                  const max = topProperties[0]?.income || 1;
                  const pct = Math.max(4, Math.round((p.income / max) * 100));
                  return (
                    <Link key={p.id} href={`/properties/${p.id}`} className="block group">
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs font-semibold text-[var(--muted-foreground)] w-4 shrink-0">
                            #{i + 1}
                          </span>
                          <p className="font-medium text-[var(--foreground)] text-sm truncate group-hover:text-[var(--primary)] transition-colors">
                            {p.title}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-emerald-600 tabular-nums shrink-0">
                          {fmtAmount(p.income)}
                        </p>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[var(--muted)] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="border-[var(--border)] shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center text-[var(--primary)]">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription>Latest income and expense entries</CardDescription>
            </div>
          </div>
          <Link href="/finance/report">
            <Button variant="ghost" size="sm" className="text-[var(--primary)] hover:text-[var(--primary-hover)]">View report</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="py-12 text-center">
              <Activity className="h-12 w-12 mx-auto text-[var(--muted-foreground)] opacity-50 mb-3" />
              <p className="text-sm font-medium text-[var(--foreground)]">No activity yet</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Income and expense entries will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`shrink-0 ${
                        item.kind === "income" ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {item.kind === "income" ? (
                        <ArrowDownCircle className="h-5 w-5" />
                      ) : (
                        <ArrowUpCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--foreground)] text-sm truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">
                        {item.property} · {fmtDate(item.date)}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-sm font-semibold tabular-nums shrink-0 ${
                      item.kind === "income" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {item.kind === "income" ? "+" : "−"}
                    {fmtAmount(item.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
