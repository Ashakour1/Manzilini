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
  const [recentApplications, setRecentApplications] = useState<{ id: string; fullName: string; createdAt: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [props, apps, ten, inc, exp] = await Promise.all([
        getProperties(),
        getApplications(),
        getTenants(),
        getPropertyIncomes(),
        getPropertyExpenses(),
      ]);
      setPropertiesCount(props.length);
      setApplicationsCount(apps.length);
      setTenantsCount(Array.isArray(ten) ? ten.length : (ten.tenants?.length ?? 0));
      setIncomes(inc);
      setExpenses(exp);
      setIncomeTotal(inc.reduce((s, i) => s + Number(i.amount || 0), 0));
      setExpenseTotal(exp.reduce((s, e) => s + Number(e.amount || 0), 0));
      setRecentApplications(apps.slice(0, 5).map((a) => ({ id: a.id, fullName: a.fullName, createdAt: a.createdAt, status: a.status })));
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

  return (
    <div className="p-4 sm:p-5 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Welcome back{userName ? `, ${userName}` : ""}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Here&apos;s what&apos;s happening with your properties today</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between">
          {error}
          <button onClick={() => setError("")} className="font-bold">&times;</button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Link href="/properties" className="group">
          <Card className="border-[var(--border)] transition-all hover:shadow-md hover:border-[var(--primary)]/30">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Properties</CardTitle>
              <Building2 className="h-5 w-5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-[var(--foreground)]">{propertiesCount}</div>}
              <span className="text-xs text-[var(--primary)] group-hover:underline mt-1 inline-flex items-center gap-0.5">View <ChevronRight className="h-3 w-3" /></span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/applications" className="group">
          <Card className="border-[var(--border)] transition-all hover:shadow-md hover:border-[var(--primary)]/30">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Applications</CardTitle>
              <ClipboardList className="h-5 w-5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-[var(--foreground)]">{applicationsCount}</div>}
              <span className="text-xs text-[var(--primary)] group-hover:underline mt-1 inline-flex items-center gap-0.5">View <ChevronRight className="h-3 w-3" /></span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/tenants" className="group">
          <Card className="border-[var(--border)] transition-all hover:shadow-md hover:border-[var(--primary)]/30">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Tenants</CardTitle>
              <Users className="h-5 w-5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-[var(--foreground)]">{tenantsCount}</div>}
              <span className="text-xs text-[var(--primary)] group-hover:underline mt-1 inline-flex items-center gap-0.5">View <ChevronRight className="h-3 w-3" /></span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/finance/income" className="group">
          <Card className="border-[var(--border)] transition-all hover:shadow-md hover:border-emerald-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Total Income</CardTitle>
              <ArrowDownCircle className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-emerald-600">{fmtAmount(incomeTotal)}</div>}
              <span className="text-xs text-[var(--primary)] group-hover:underline mt-1 inline-flex items-center gap-0.5">View <ChevronRight className="h-3 w-3" /></span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/finance/expense" className="group">
          <Card className="border-[var(--border)] transition-all hover:shadow-md hover:border-red-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Total Expenses</CardTitle>
              <ArrowUpCircle className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-red-600">{fmtAmount(expenseTotal)}</div>}
              <span className="text-xs text-[var(--primary)] group-hover:underline mt-1 inline-flex items-center gap-0.5">View <ChevronRight className="h-3 w-3" /></span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/finance/report" className="group">
          <Card className="border-[var(--border)] transition-all hover:shadow-md hover:border-[var(--primary)]/30">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Net</CardTitle>
              <TrendingUp className={`h-5 w-5 ${net >= 0 ? "text-emerald-500" : "text-red-500"}`} />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : <div className={`text-2xl font-bold ${net >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtAmount(net)}</div>}
              <span className="text-xs text-[var(--primary)] group-hover:underline mt-1 inline-flex items-center gap-0.5">View report <ChevronRight className="h-3 w-3" /></span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[var(--border)] shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
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
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-[var(--primary)]" />
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
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-[var(--border)] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Recent Applications</CardTitle>
              <CardDescription>Latest property applications</CardDescription>
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
        <Card className="border-[var(--border)] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Quick Links</CardTitle>
            <CardDescription>Jump to main sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Link href="/properties" className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)]/30 hover:border-[var(--primary)]/20 transition-all group">
                <span className="flex items-center gap-2 font-medium text-sm">
                  <Building2 className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                  My Properties
                </span>
                <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/applications" className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)]/30 hover:border-[var(--primary)]/20 transition-all group">
                <span className="flex items-center gap-2 font-medium text-sm">
                  <ClipboardList className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                  Applications
                </span>
                <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/tenants" className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)]/30 hover:border-[var(--primary)]/20 transition-all group">
                <span className="flex items-center gap-2 font-medium text-sm">
                  <Users className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                  Tenants
                </span>
                <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/finance/report" className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)]/30 hover:border-[var(--primary)]/20 transition-all group">
                <span className="flex items-center gap-2 font-medium text-sm">
                  <Wallet className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                  Finance Report
                </span>
                <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/reports/finance" className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)]/30 hover:border-[var(--primary)]/20 transition-all group">
                <span className="flex items-center gap-2 font-medium text-sm">
                  <BarChart3 className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                  Reports
                </span>
                <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
