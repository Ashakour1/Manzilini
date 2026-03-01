"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, FileSpreadsheet, FileText, Pencil } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Property } from "@/lib/types";
import { getProperties } from "@/lib/services/property.service";
import { getPropertyIncomes, getPropertyExpenses, type PropertyIncome, type PropertyExpense } from "@/lib/services/finance.service";
import { useLoad } from "@/lib/hooks/useLoad";

function fmtAmount(amount: string | number) {
  return Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const INCOME_SOURCES = ["", "Rent", "Deposit", "Commission", "Other"];
const EXPENSE_CATEGORIES = ["", "Maintenance", "Utilities", "Security", "Cleaning", "Other"];

export default function ReportPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [incomes, setIncomes] = useState<PropertyIncome[]>([]);
  const [expenses, setExpenses] = useState<PropertyExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [propertyFilter, setPropertyFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const propId = propertyFilter || undefined;
      const from = dateFrom || undefined;
      const to = dateTo || undefined;
      const cat = categoryFilter || undefined;
      const [props, inc, exp] = await Promise.all([
        getProperties(),
        getPropertyIncomes(propId, from, to),
        getPropertyExpenses(propId, cat, from, to),
      ]);
      setProperties(props);
      setIncomes(inc);
      setExpenses(exp);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [propertyFilter, dateFrom, dateTo, categoryFilter]);

  useLoad(load);

  const filteredIncomes = sourceFilter ? incomes.filter((i) => i.source === sourceFilter) : incomes;
  const incomeTotal = filteredIncomes.reduce((s, i) => s + Number(i.amount || 0), 0);
  const expenseTotal = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const net = incomeTotal - expenseTotal;

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const summary = [
      ["Finance Report Summary"],
      [],
      ["Metric", "Value"],
      ["Total Income", incomeTotal],
      ["Total Expenses", expenseTotal],
      ["Net", net],
      [],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Summary");
    const incomeData = [
      ["Date", "Property", "Source", "Payment", "Amount"],
      ...filteredIncomes.map((i) => [
        fmtDate(i.incomeDate),
        i.property?.title ?? "—",
        i.source,
        i.paymentMethod ?? "—",
        Number(i.amount || 0),
      ]),
      ["", "", "", "Total", incomeTotal],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(incomeData), "Income");
    const expenseData = [
      ["Date", "Property", "Category", "Vendor", "Amount"],
      ...expenses.map((e) => [
        fmtDate(e.expenseDate),
        e.property?.title ?? "—",
        e.category,
        e.vendorName ?? "—",
        Number(e.amount || 0),
      ]),
      ["", "", "", "Total", expenseTotal],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(expenseData), "Expenses");
    const name = `finance-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, name);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Finance Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    doc.setFontSize(12);
    doc.text("Summary", 14, 40);
    autoTable(doc, {
      startY: 45,
      head: [["Metric", "Value"]],
      body: [
        ["Total Income", fmtAmount(incomeTotal)],
        ["Total Expenses", fmtAmount(expenseTotal)],
        ["Net", fmtAmount(net)],
      ],
      theme: "plain",
      headStyles: { fillColor: [100, 100, 100] },
    });

    let finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 70;
    doc.setFontSize(12);
    doc.text("Income", 14, finalY + 15);
    autoTable(doc, {
      startY: finalY + 20,
      head: [["Date", "Property", "Source", "Payment", "Amount"]],
      body: filteredIncomes.map((i) => [
        fmtDate(i.incomeDate),
        i.property?.title ?? "—",
        i.source,
        i.paymentMethod ?? "—",
        fmtAmount(i.amount),
      ]).concat(filteredIncomes.length ? [["", "", "", "Total", fmtAmount(incomeTotal)]] : []),
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
    });

    finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? finalY;
    doc.setFontSize(12);
    doc.text("Expenses", 14, finalY + 15);
    autoTable(doc, {
      startY: finalY + 20,
      head: [["Date", "Property", "Category", "Vendor", "Amount"]],
      body: expenses.map((e) => [
        fmtDate(e.expenseDate),
        e.property?.title ?? "—",
        e.category,
        e.vendorName ?? "—",
        fmtAmount(e.amount),
      ]).concat(expenses.length ? [["", "", "", "Total", fmtAmount(expenseTotal)]] : []),
      theme: "striped",
      headStyles: { fillColor: [239, 68, 68] },
    });

    doc.save(`finance-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="p-5 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Finance Report</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Overview of income and expenses by property</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportExcel} disabled={loading}>
            <FileSpreadsheet className="h-4 w-4 mr-1.5" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportPdf} disabled={loading}>
            <FileText className="h-4 w-4 mr-1.5" />
            Export PDF
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")} className="font-bold">&times;</button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Property</label>
          <select value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none">
            <option value="">All properties</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[var(--foreground)]">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[var(--foreground)]">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Income Source</label>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none">
            {INCOME_SOURCES.map((s) => <option key={s} value={s}>{s || "All"}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Expense Category</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none">
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c || "All"}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Total Income</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-600">{fmtAmount(incomeTotal)}</div>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{filteredIncomes.length} record(s)</p>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Total Expenses</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">{fmtAmount(expenseTotal)}</div>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{expenses.length} record(s)</p>
          </CardContent>
        </Card>
        <Card className="border-[var(--border)]">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">Net</CardTitle>
            <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold ${net >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {fmtAmount(net)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-[var(--border)] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Income</CardTitle>
            <CardDescription>All income records</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading && <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">Loading...</div>}
            {!loading && filteredIncomes.length === 0 && (
              <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">No income records</div>
            )}
            {!loading && filteredIncomes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                      <th className="text-left font-semibold text-[var(--foreground)] px-4 py-3">Date</th>
                      <th className="text-left font-semibold text-[var(--foreground)] px-4 py-3">Property</th>
                      <th className="text-left font-semibold text-[var(--foreground)] px-4 py-3">Source</th>
                      <th className="text-left font-semibold text-[var(--foreground)] px-4 py-3">Payment</th>
                      <th className="text-right font-semibold text-[var(--foreground)] px-4 py-3">Amount</th>
                      <th className="w-10 px-2 py-3" aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncomes.map((i) => (
                      <tr key={i.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors">
                        <td className="px-4 py-3 text-[var(--foreground)] whitespace-nowrap">{fmtDate(i.incomeDate)}</td>
                        <td className="px-4 py-3 text-[var(--foreground)]">{i.property?.title ?? "—"}</td>
                        <td className="px-4 py-3 text-[var(--foreground)]">{i.source}</td>
                        <td className="px-4 py-3 text-[var(--muted-foreground)]">{i.paymentMethod ?? "—"}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-600">{fmtAmount(i.amount)}</td>
                        <td className="px-2 py-3">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/finance/income?edit=${i.id}`)} className="h-8 w-8 p-0" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[var(--border)] bg-[var(--muted)]/30 font-semibold">
                      <td colSpan={4} className="px-4 py-3 text-right text-[var(--foreground)]">Total</td>
                      <td className="px-4 py-3 text-right text-emerald-600">{fmtAmount(incomeTotal)}</td>
                      <td className="px-2 py-3" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Expenses</CardTitle>
            <CardDescription>All expense records</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading && <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">Loading...</div>}
            {!loading && expenses.length === 0 && (
              <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">No expense records</div>
            )}
            {!loading && expenses.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                      <th className="text-left font-semibold text-[var(--foreground)] px-4 py-3">Date</th>
                      <th className="text-left font-semibold text-[var(--foreground)] px-4 py-3">Property</th>
                      <th className="text-left font-semibold text-[var(--foreground)] px-4 py-3">Category</th>
                      <th className="text-left font-semibold text-[var(--foreground)] px-4 py-3">Vendor</th>
                      <th className="text-right font-semibold text-[var(--foreground)] px-4 py-3">Amount</th>
                      <th className="w-10 px-2 py-3" aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((e) => (
                      <tr key={e.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors">
                        <td className="px-4 py-3 text-[var(--foreground)] whitespace-nowrap">{fmtDate(e.expenseDate)}</td>
                        <td className="px-4 py-3 text-[var(--foreground)]">{e.property?.title ?? "—"}</td>
                        <td className="px-4 py-3 text-[var(--foreground)]">{e.category}</td>
                        <td className="px-4 py-3 text-[var(--muted-foreground)]">{e.vendorName ?? "—"}</td>
                        <td className="px-4 py-3 text-right font-semibold text-red-600">{fmtAmount(e.amount)}</td>
                        <td className="px-2 py-3">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/finance/expense?edit=${e.id}`)} className="h-8 w-8 p-0" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[var(--border)] bg-[var(--muted)]/30 font-semibold">
                      <td colSpan={4} className="px-4 py-3 text-right text-[var(--foreground)]">Total</td>
                      <td className="px-4 py-3 text-right text-red-600">{fmtAmount(expenseTotal)}</td>
                      <td className="px-2 py-3" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
