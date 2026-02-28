"use client";

import { useEffect, useState, useCallback } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Application, Property } from "@/lib/types";
import { getApplications } from "@/lib/services/application.service";
import { getProperties } from "@/lib/services/property.service";

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONTACTED: "Contacted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CLOSED: "Closed",
};

export default function ApplicationsReportPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [propertyFilter, setPropertyFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [apps, props] = await Promise.all([
        getApplications(statusFilter || undefined),
        getProperties(),
      ]);
      setApplications(apps);
      setProperties(props);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = propertyFilter ? applications.filter((a) => a.propertyId === propertyFilter) : applications;

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["Date", "Applicant", "Email", "Phone", "Property", "Status", "Message"],
      ...filtered.map((a) => [fmtDate(a.createdAt), a.fullName, a.email ?? "—", a.phone, properties.find((p) => p.id === a.propertyId)?.title ?? "—", STATUS_LABELS[a.status] ?? a.status, (a.message ?? "").slice(0, 100)]),
    ]), "Applications");
    XLSX.writeFile(wb, `applications-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Applications Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()} · ${filtered.length} application(s)`, 14, 28);
    autoTable(doc, { startY: 38, head: [["Date", "Applicant", "Email", "Phone", "Property", "Status"]], body: filtered.map((a) => [fmtDate(a.createdAt), a.fullName, a.email ?? "—", a.phone, properties.find((p) => p.id === a.propertyId)?.title ?? "—", STATUS_LABELS[a.status] ?? a.status]), theme: "striped", headStyles: { fillColor: [59, 130, 246] } });
    doc.save(`applications-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="p-5 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Applications Report</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Application inquiries by property and status</p>
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
          <label className="text-sm font-medium text-[var(--foreground)]">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none">
            <option value="">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      <Card className="border-[var(--border)] overflow-hidden">
        <CardHeader className="pb-2"><CardTitle className="text-base">Applications</CardTitle><CardDescription>{filtered.length} application(s)</CardDescription></CardHeader>
        <CardContent className="p-0">
          {loading ? <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">Loading...</div> : filtered.length === 0 ? <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">No applications</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[var(--border)] bg-[var(--muted)]/50"><th className="text-left font-semibold px-4 py-3">Date</th><th className="text-left font-semibold px-4 py-3">Applicant</th><th className="text-left font-semibold px-4 py-3">Email</th><th className="text-left font-semibold px-4 py-3">Phone</th><th className="text-left font-semibold px-4 py-3">Property</th><th className="text-left font-semibold px-4 py-3">Status</th></tr></thead>
                <tbody>{filtered.map((a) => <tr key={a.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30"><td className="px-4 py-3 whitespace-nowrap">{fmtDate(a.createdAt)}</td><td className="px-4 py-3 font-medium">{a.fullName}</td><td className="px-4 py-3">{a.email ?? "—"}</td><td className="px-4 py-3">{a.phone}</td><td className="px-4 py-3">{a.property?.title ?? properties.find((p) => p.id === a.propertyId)?.title ?? "—"}</td><td className="px-4 py-3"><span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--muted)]">{STATUS_LABELS[a.status] ?? a.status}</span></td></tr>)}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
