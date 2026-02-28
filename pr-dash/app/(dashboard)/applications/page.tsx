"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ClipboardList,
  User,
  Phone,
  Mail,
  MessageSquare,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import type { Application, Property } from "@/lib/types";
import { getApplications, approveApplication, rejectApplication } from "@/lib/services/application.service";
import { getProperties } from "@/lib/services/property.service";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONTACTED: "bg-blue-50 text-blue-700 border-blue-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [approveModal, setApproveModal] = useState<Application | null>(null);
  const [rejectModal, setRejectModal] = useState<Application | null>(null);
  const [approveForm, setApproveForm] = useState({ propertyId: "", rentAmount: "", leaseStart: "", leaseEnd: "" });
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [apps, props] = await Promise.all([
        getApplications(),
        getProperties(),
      ]);
      setApplications(apps);
      setProperties(props);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openApprove = (app: Application) => {
    setApproveModal(app);
    setApproveForm({ propertyId: app.propertyId, rentAmount: "", leaseStart: "", leaseEnd: "" });
  };

  const handleApprove = async () => {
    if (!approveModal) return;
    setSaving(true);
    try {
      await approveApplication(approveModal.id, {
        propertyId: approveForm.propertyId || undefined,
        rentAmount: approveForm.rentAmount || undefined,
        leaseStart: approveForm.leaseStart || undefined,
        leaseEnd: approveForm.leaseEnd || undefined,
      });
      setApproveModal(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Approve failed");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setSaving(true);
    try {
      await rejectApplication(rejectModal.id, rejectRemarks);
      setRejectModal(null);
      setRejectRemarks("");
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reject failed");
    } finally {
      setSaving(false);
    }
  };

  const hasApplications = applications.length > 0;

  return (
    <div className="p-5 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Property Applications</h1>
        <p className="text-sm text-gray-500">Review and manage tenant applications for your properties</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")} className="font-bold">&times;</button>
        </div>
      )}

      <Card className="border-gray-200/80 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle>Applications</CardTitle>
          <CardDescription>
            {hasApplications
              ? `${applications.length} application${applications.length !== 1 ? "s" : ""}`
              : "Applications from tenants will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="py-8 text-center text-gray-400 text-sm">Loading applications...</div>
          )}
          {!loading && !hasApplications && (
            <div className="text-center py-12 text-gray-400">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500 mb-1">No applications yet</p>
              <p className="text-xs text-gray-400">Applications from tenants will appear here</p>
            </div>
          )}
          {!loading && hasApplications && (
            <div className="space-y-3">
              {applications.map((app) => {
                const isExpanded = expandedId === app.id;
                return (
                  <div
                    key={app.id}
                    className="rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedId((id) => (id === app.id ? null : app.id))}
                      className="w-full text-left px-4 py-3 flex items-center gap-4"
                    >
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-gray-900 truncate">{app.fullName}</span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${STATUS_COLORS[app.status] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {app.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {app.property && (
                            <span className="flex items-center gap-1 truncate">
                              <Building2 className="h-3 w-3" />
                              {app.property.title}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(app.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-gray-400">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-4 space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{app.phone}</span>
                          </div>
                          {app.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{app.email}</span>
                            </div>
                          )}
                        </div>
                        {app.message && (
                          <div className="flex items-start gap-2 text-sm text-gray-700">
                            <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                            <p className="leading-relaxed">{app.message}</p>
                          </div>
                        )}
                        {(app.status === "PENDING" || app.status === "CONTACTED") && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                              size="sm"
                              className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => openApprove(app)}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => {
                                setRejectModal(app);
                                setRejectRemarks("");
                              }}
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={!!approveModal} onClose={() => setApproveModal(null)} title="Approve Application">
        <p className="text-sm text-gray-600 mb-4">
          Approving will convert <strong>{approveModal?.fullName}</strong> into an active tenant.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Property</label>
            <select
              value={approveForm.propertyId}
              onChange={(e) => setApproveForm({ ...approveForm, propertyId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
            >
              <option value="">— Select property —</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rent Amount</label>
            <input
              type="number"
              value={approveForm.rentAmount}
              onChange={(e) => setApproveForm({ ...approveForm, rentAmount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
              placeholder="e.g. 25000"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease Start</label>
              <input
                type="date"
                value={approveForm.leaseStart}
                onChange={(e) => setApproveForm({ ...approveForm, leaseStart: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease End</label>
              <input
                type="date"
                value={approveForm.leaseEnd}
                onChange={(e) => setApproveForm({ ...approveForm, leaseEnd: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setApproveModal(null)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={saving} className="bg-[#2a6f97] hover:bg-[#235d7f] text-white">
              {saving ? "Approving..." : "Approve & Create Tenant"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Application">
        <p className="text-sm text-gray-600 mb-4">
          Reject <strong>{rejectModal?.fullName}</strong>&apos;s application?
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
            <textarea
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none resize-none"
              placeholder="Provide a reason for rejection..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={saving}>
              {saving ? "Rejecting..." : "Reject Application"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
