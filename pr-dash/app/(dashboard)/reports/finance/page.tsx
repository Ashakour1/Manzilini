"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Property } from "@/lib/types";
import { getProperties } from "@/lib/services/property.service";
import { getPropertyIncomes, getPropertyExpenses, type PropertyIncome, type PropertyExpense } from "@/lib/services/finance.service";

function fmtAmount(amount: string | number) {
  return Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const INCOME_SOURCES = ["", "Rent", "Deposit", "Commission", "Other"];
const EXPENSE_CATEGORIES = ["", "Maintenance", "Utilities", "Security", "Cleaning", "Other"];

export default function FinanceReportPage() {
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

  const filteredIncomes = sourceFilter ? incomes.filter((i) => i.source === sourceFilter) : incomes;
  const incomeTotal = filteredIncomes.reduce((s, i) => s + Number(i.amount || 0), 0);

  useEffect(() => {
    load();
  }, [load]);

  const expenseTotal = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const net = incomeTotal - expenseTotal;

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["Finance Report"], [], ["Metric", "Value"], ["Total Income", incomeTotal], ["Total Expenses", expenseTotal], ["Net", net], [],
    ]), "Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["Date", "Property", "Source", "Payment", "Amount"],
      ...filteredIncomes.map((i) => [fmtDate(i.incomeDate), i.property?.title ?? "—", i.source, i.paymentMethod ?? "—", Number(i.amount || 0)]),
      ["", "", "", "Total", incomeTotal],
    ]), "Income");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["Date", "Property", "Category", "Vendor", "Amount"],
      ...expenses.map((e) => [fmtDate(e.expenseDate), e.property?.title ?? "—", e.category, e.vendorName ?? "—", Number(e.amount || 0)]),
      ["", "", "", "Total", expenseTotal],
    ]), "Expenses");
    XLSX.writeFile(wb, `finance-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Finance Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    autoTable(doc, { startY: 38, head: [["Metric", "Value"]], body: [["Total Income", fmtAmount(incomeTotal)], ["Total Expenses", fmtAmount(expenseTotal)], ["Net", fmtAmount(net)]], theme: "plain", headStyles: { fillColor: [100, 100, 100] } });
    let fy = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 70;
    doc.setFontSize(12);
    doc.text("Income", 14, fy + 15);
    autoTable(doc, { startY: fy + 20, head: [["Date", "Property", "Source", "Amount"]], body: filteredIncomes.map((i) => [fmtDate(i.incomeDate), i.property?.title ?? "—", i.source, fmtAmount(i.amount)]), theme: "striped", headStyles: { fillColor: [34, 197, 94] } });
    fy = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? fy;
    doc.text("Expenses", 14, fy + 15);
    autoTable(doc, { startY: fy + 20, head: [["Date", "Property", "Category", "Amount"]], body: expenses.map((e) => [fmtDate(e.expenseDate), e.property?.title ?? "—", e.category, fmtAmount(e.amount)]), theme: "striped", headStyles: { fillColor: [239, 68, 68] } });
    doc.save(`finance-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="p-5 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Finance Report</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Income and expenses by property</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportExcel} disabled={loading}><FileSpreadsheet className="h-4 w-4 mr-1.5" />Export Excel</Button>
          <Button variant="outline" size="sm" onClick={exportPdf} disabled={loading}><FileText className="h-4 w-4 mr-1.5" />Export PDF</Button>
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between">{error}<button onClick={() => setError("")} className="font-bold">&times;</button></div>
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
            {INCOME_SOURCES.map((s) => <option key={s === "" ? "all-src" : s} value={s}>{s || "All"}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Expense Category</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none">
            {EXPENSE_CATEGORIES.map((c) => <option key={c === "" ? "all-cat" : c} value={c}>{c || "All"}</option>)}
          </select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[var(--border)]"><CardHeader className="pb-1"><CardTitle className="text-sm text-[var(--muted-foreground)]">Total Income</CardTitle></CardHeader><CardContent><div className="text-xl font-bold text-emerald-600">{fmtAmount(incomeTotal)}</div><p className="text-xs text-[var(--muted-foreground)] mt-1">{filteredIncomes.length} record(s)</p></CardContent></Card>
        <Card className="border-[var(--border)]"><CardHeader className="pb-1"><CardTitle className="text-sm text-[var(--muted-foreground)]">Total Expenses</CardTitle></CardHeader><CardContent><div className="text-xl font-bold text-red-600">{fmtAmount(expenseTotal)}</div><p className="text-xs text-[var(--muted-foreground)] mt-1">{expenses.length} record(s)</p></CardContent></Card>
        <Card className="border-[var(--border)]"><CardHeader className="pb-1"><CardTitle className="text-sm text-[var(--muted-foreground)]">Net</CardTitle></CardHeader><CardContent><div className={`text-xl font-bold ${net >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtAmount(net)}</div></CardContent></Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-[var(--border)] overflow-hidden">
          <CardHeader className="pb-2"><CardTitle className="text-base">Income</CardTitle><CardDescription>{filteredIncomes.length} record(s) · Total: {fmtAmount(incomeTotal)}</CardDescription></CardHeader>
          <CardContent className="p-0">
            {loading ? <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">Loading...</div> : filteredIncomes.length === 0 ? <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">No income records</div> : (
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-[var(--border)] bg-[var(--muted)]/50"><th className="text-left font-semibold px-4 py-3">Date</th><th className="text-left font-semibold px-4 py-3">Property</th><th className="text-left font-semibold px-4 py-3">Source</th><th className="text-right font-semibold px-4 py-3">Amount</th></tr></thead>
                  <tbody>{filteredIncomes.map((i) => <tr key={i.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30"><td className="px-4 py-3 whitespace-nowrap">{fmtDate(i.incomeDate)}</td><td className="px-4 py-3">{i.property?.title ?? "—"}</td><td className="px-4 py-3">{i.source}</td><td className="px-4 py-3 text-right font-semibold text-emerald-600">{fmtAmount(i.amount)}</td></tr>)}</tbody>
                  <tfoot><tr className="border-t-2 border-[var(--border)] bg-[var(--muted)]/30 font-semibold"><td colSpan={3} className="px-4 py-3 text-right">Total</td><td className="px-4 py-3 text-right text-emerald-600">{fmtAmount(incomeTotal)}</td></tr></tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-[var(--border)] overflow-hidden">
          <CardHeader className="pb-2"><CardTitle className="text-base">Expenses</CardTitle><CardDescription>{expenses.length} record(s) · Total: {fmtAmount(expenseTotal)}</CardDescription></CardHeader>
          <CardContent className="p-0">
            {loading ? <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">Loading...</div> : expenses.length === 0 ? <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">No expense records</div> : (
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-[var(--border)] bg-[var(--muted)]/50"><th className="text-left font-semibold px-4 py-3">Date</th><th className="text-left font-semibold px-4 py-3">Property</th><th className="text-left font-semibold px-4 py-3">Category</th><th className="text-right font-semibold px-4 py-3">Amount</th></tr></thead>
                  <tbody>{expenses.map((e) => <tr key={e.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30"><td className="px-4 py-3 whitespace-nowrap">{fmtDate(e.expenseDate)}</td><td className="px-4 py-3">{e.property?.title ?? "—"}</td><td className="px-4 py-3">{e.category}</td><td className="px-4 py-3 text-right font-semibold text-red-600">{fmtAmount(e.amount)}</td></tr>)}</tbody>
                  <tfoot><tr className="border-t-2 border-[var(--border)] bg-[var(--muted)]/30 font-semibold"><td colSpan={3} className="px-4 py-3 text-right">Total</td><td className="px-4 py-3 text-right text-red-600">{fmtAmount(expenseTotal)}</td></tr></tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
