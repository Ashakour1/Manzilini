"use client";

import { useState, useCallback } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Property } from "@/lib/types";
import { getProperties } from "@/lib/services/property.service";
import { useLoad } from "@/lib/hooks/useLoad";
import { getPropertyIncomes, getPropertyExpenses } from "@/lib/services/finance.service";

function fmtAmount(amount: string | number) {
  return Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface PropertyFinance {
  property: Property;
  incomeTotal: number;
  expenseTotal: number;
  net: number;
  incomeCount: number;
  expenseCount: number;
}

export default function PropertyWithFinanceReportPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [incomes, setIncomes] = useState<Awaited<ReturnType<typeof getPropertyIncomes>>>([]);
  const [expenses, setExpenses] = useState<Awaited<ReturnType<typeof getPropertyExpenses>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [props, inc, exp] = await Promise.all([
        getProperties(),
        getPropertyIncomes(),
        getPropertyExpenses(),
      ]);
      setProperties(props);
      setIncomes(inc);
      setExpenses(exp);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useLoad(load);

  const propertyFinance: PropertyFinance[] = properties.map((p) => {
    const propIncomes = incomes.filter((i) => i.propertyId === p.id);
    const propExpenses = expenses.filter((e) => e.propertyId === p.id);
    const incomeTotal = propIncomes.reduce((s, i) => s + Number(i.amount || 0), 0);
    const expenseTotal = propExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    return {
      property: p,
      incomeTotal,
      expenseTotal,
      net: incomeTotal - expenseTotal,
      incomeCount: propIncomes.length,
      expenseCount: propExpenses.length,
    };
  });

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["Property", "Title", "City", "Price", "Income Total", "Expense Total", "Net", "Income Count", "Expense Count"],
      ...propertyFinance.map((pf) => [
        pf.property.title,
        pf.property.title,
        pf.property.city ?? "—",
        pf.property.price ?? "—",
        pf.incomeTotal,
        pf.expenseTotal,
        pf.net,
        pf.incomeCount,
        pf.expenseCount,
      ]),
    ]), "Properties with Finance");
    XLSX.writeFile(wb, `property-with-finance-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Property with Finance Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    autoTable(doc, {
      startY: 38,
      head: [["Property", "City", "Income", "Expenses", "Net"]],
      body: propertyFinance.map((pf) => [
        pf.property.title.slice(0, 30),
        pf.property.city ?? "—",
        fmtAmount(pf.incomeTotal),
        fmtAmount(pf.expenseTotal),
        fmtAmount(pf.net),
      ]),
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
    });
    doc.save(`property-with-finance-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="p-5 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Property with Finance</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Properties with income and expense totals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportExcel} disabled={loading}><FileSpreadsheet className="h-4 w-4 mr-1.5" />Export Excel</Button>
          <Button variant="outline" size="sm" onClick={exportPdf} disabled={loading}><FileText className="h-4 w-4 mr-1.5" />Export PDF</Button>
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between">{error}<button onClick={() => setError("")} className="font-bold">&times;</button></div>
      )}
      <Card className="border-[var(--border)] overflow-hidden">
        <CardHeader className="pb-2"><CardTitle className="text-base">Properties with Finance</CardTitle><CardDescription>{propertyFinance.length} property(ies)</CardDescription></CardHeader>
        <CardContent className="p-0">
          {loading ? <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">Loading...</div> : propertyFinance.length === 0 ? <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">No properties</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                    <th className="text-left font-semibold px-4 py-3">Property</th>
                    <th className="text-left font-semibold px-4 py-3">City</th>
                    <th className="text-right font-semibold px-4 py-3">Price</th>
                    <th className="text-right font-semibold px-4 py-3">Income</th>
                    <th className="text-right font-semibold px-4 py-3">Expenses</th>
                    <th className="text-right font-semibold px-4 py-3">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyFinance.map((pf) => (
                    <tr key={pf.property.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30">
                      <td className="px-4 py-3 font-medium">{pf.property.title}</td>
                      <td className="px-4 py-3">{pf.property.city ?? "—"}</td>
                      <td className="px-4 py-3 text-right">{pf.property.price ? `${pf.property.currency ?? ""} ${pf.property.price}` : "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600">{fmtAmount(pf.incomeTotal)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-red-600">{fmtAmount(pf.expenseTotal)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${pf.net >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtAmount(pf.net)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[var(--border)] bg-[var(--muted)]/30 font-semibold">
                    <td colSpan={3} className="px-4 py-3 text-right">Total</td>
                    <td className="px-4 py-3 text-right text-emerald-600">{fmtAmount(propertyFinance.reduce((s, pf) => s + pf.incomeTotal, 0))}</td>
                    <td className="px-4 py-3 text-right text-red-600">{fmtAmount(propertyFinance.reduce((s, pf) => s + pf.expenseTotal, 0))}</td>
                    <td className="px-4 py-3 text-right">{fmtAmount(propertyFinance.reduce((s, pf) => s + pf.net, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
