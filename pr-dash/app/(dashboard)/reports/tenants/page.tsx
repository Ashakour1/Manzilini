"use client";

import { useEffect, useState, useCallback } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Tenant } from "@/lib/types";
import { getTenants } from "@/lib/services/tenant.service";

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TenantsReportPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getTenants();
      setTenants(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = statusFilter ? tenants.filter((t) => t.status === statusFilter) : tenants;

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["Name", "Email", "Phone", "Status", "Property", "Rent", "Lease Start", "Lease End"],
      ...filtered.map((t) => [t.fullName, t.email ?? "—", t.phone, t.status ?? "—", t.property?.title ?? "—", t.rentAmount ?? "—", fmtDate(t.leaseStart), fmtDate(t.leaseEnd)]),
    ]), "Tenants");
    XLSX.writeFile(wb, `tenants-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Tenants Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()} · ${filtered.length} tenant(s)`, 14, 28);
    autoTable(doc, { startY: 38, head: [["Name", "Email", "Phone", "Status", "Property"]], body: filtered.map((t) => [t.fullName.slice(0, 25), (t.email ?? "—").slice(0, 20), t.phone, t.status ?? "—", (t.property?.title ?? "—").slice(0, 20)]), theme: "striped", headStyles: { fillColor: [59, 130, 246] } });
    doc.save(`tenants-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const statuses = Array.from(new Set(tenants.map((t) => t.status).filter(Boolean))) as string[];

  return (
    <div className="p-5 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Tenants Report</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Tenant overview and occupancy</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportExcel} disabled={loading}><FileSpreadsheet className="h-4 w-4 mr-1.5" />Export Excel</Button>
          <Button variant="outline" size="sm" onClick={exportPdf} disabled={loading}><FileText className="h-4 w-4 mr-1.5" />Export PDF</Button>
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between">{error}<button onClick={() => setError("")} className="font-bold">&times;</button></div>
      )}
      {statuses.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-[var(--foreground)]">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none">
            <option value="">All statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      <Card className="border-[var(--border)] overflow-hidden">
        <CardHeader className="pb-2"><CardTitle className="text-base">Tenants</CardTitle><CardDescription>{filtered.length} tenant(s)</CardDescription></CardHeader>
        <CardContent className="p-0">
          {loading ? <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">Loading...</div> : filtered.length === 0 ? <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">No tenants</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[var(--border)] bg-[var(--muted)]/50"><th className="text-left font-semibold px-4 py-3">Name</th><th className="text-left font-semibold px-4 py-3">Email</th><th className="text-left font-semibold px-4 py-3">Phone</th><th className="text-left font-semibold px-4 py-3">Status</th><th className="text-left font-semibold px-4 py-3">Property</th><th className="text-right font-semibold px-4 py-3">Rent</th><th className="text-left font-semibold px-4 py-3">Lease End</th></tr></thead>
                <tbody>{filtered.map((t) => <tr key={t.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30"><td className="px-4 py-3 font-medium">{t.fullName}</td><td className="px-4 py-3">{t.email ?? "—"}</td><td className="px-4 py-3">{t.phone}</td><td className="px-4 py-3"><span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--muted)]">{t.status ?? "—"}</span></td><td className="px-4 py-3">{t.property?.title ?? "—"}</td><td className="px-4 py-3 text-right">{t.rentAmount ?? "—"}</td><td className="px-4 py-3 whitespace-nowrap">{fmtDate(t.leaseEnd)}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
