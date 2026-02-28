"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Building2, ClipboardList, Users, DollarSign, ArrowDownCircle, ArrowUpCircle, TrendingUp, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProperties } from "@/lib/services/property.service";
import { getApplications } from "@/lib/services/application.service";
import { getTenants } from "@/lib/services/tenant.service";
import { getPropertyIncomes, getPropertyExpenses } from "@/lib/services/finance.service";

function fmtAmount(amount: string | number) {
  return Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DashboardPage() {
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [tenantsCount, setTenantsCount] = useState(0);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
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
      setTenantsCount(ten.length);
      setIncomeTotal(inc.reduce((s, i) => s + Number(i.amount || 0), 0));
      setExpenseTotal(exp.reduce((s, e) => s + Number(e.amount || 0), 0));
      setRecentApplications(apps.slice(0, 5).map((a) => ({ id: a.id, fullName: a.fullName, createdAt: a.createdAt, status: a.status })));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const net = incomeTotal - expenseTotal;

  return (
    <div className="p-5 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Dashboard</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Overview of your property management</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between">
          {error}
          <button onClick={() => setError("")} className="font-bold">&times;</button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Properties</CardTitle>
            <Building2 className="h-4 w-4 text-[var(--muted-foreground)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--foreground)]">{loading ? "—" : propertiesCount}</div>
            <Link href="/properties" className="text-xs text-[var(--primary)] hover:underline mt-1 inline-flex items-center gap-0.5">View <ChevronRight className="h-3 w-3" /></Link>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Applications</CardTitle>
            <ClipboardList className="h-4 w-4 text-[var(--muted-foreground)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--foreground)]">{loading ? "—" : applicationsCount}</div>
            <Link href="/applications" className="text-xs text-[var(--primary)] hover:underline mt-1 inline-flex items-center gap-0.5">View <ChevronRight className="h-3 w-3" /></Link>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Tenants</CardTitle>
            <Users className="h-4 w-4 text-[var(--muted-foreground)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--foreground)]">{loading ? "—" : tenantsCount}</div>
            <Link href="/tenants" className="text-xs text-[var(--primary)] hover:underline mt-1 inline-flex items-center gap-0.5">View <ChevronRight className="h-3 w-3" /></Link>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Total Income</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{loading ? "—" : fmtAmount(incomeTotal)}</div>
            <Link href="/finance/income" className="text-xs text-[var(--primary)] hover:underline mt-1 inline-flex items-center gap-0.5">View <ChevronRight className="h-3 w-3" /></Link>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Total Expenses</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{loading ? "—" : fmtAmount(expenseTotal)}</div>
            <Link href="/finance/expense" className="text-xs text-[var(--primary)] hover:underline mt-1 inline-flex items-center gap-0.5">View <ChevronRight className="h-3 w-3" /></Link>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Net</CardTitle>
            <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${net >= 0 ? "text-emerald-600" : "text-red-600"}`}>{loading ? "—" : fmtAmount(net)}</div>
            <Link href="/finance/report" className="text-xs text-[var(--primary)] hover:underline mt-1 inline-flex items-center gap-0.5">View report <ChevronRight className="h-3 w-3" /></Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Applications</CardTitle>
            <Link href="/applications">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">Loading...</div>
            ) : recentApplications.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">No applications yet</div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                    <div>
                      <p className="font-medium text-[var(--foreground)] text-sm">{a.fullName}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{fmtDate(a.createdAt)}</p>
                    </div>
                    <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--muted)]">{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-[var(--border)]">
          <CardHeader>
            <CardTitle className="text-base">Quick Links</CardTitle>
            <CardDescription>Jump to main sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Link href="/properties" className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors">
                <span className="font-medium text-sm">My Properties</span>
                <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </Link>
              <Link href="/applications" className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors">
                <span className="font-medium text-sm">Applications</span>
                <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </Link>
              <Link href="/tenants" className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors">
                <span className="font-medium text-sm">Tenants</span>
                <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </Link>
              <Link href="/finance/report" className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors">
                <span className="font-medium text-sm">Finance Report</span>
                <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </Link>
              <Link href="/reports/finance" className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors">
                <span className="font-medium text-sm">Reports</span>
                <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
