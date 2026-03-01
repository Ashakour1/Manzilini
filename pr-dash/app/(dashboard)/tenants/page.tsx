"use client";

import { useState, useCallback } from "react";
import { Users, Plus, Mail, Phone, Calendar, FileText, Pencil, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import type { Tenant, Property } from "@/lib/types";
import { getTenants, createTenant, updateTenant, deleteTenant } from "@/lib/services/tenant.service";
import { useLoad } from "@/lib/hooks/useLoad";

const STATUSES = ["NEW", "ACTIVE", "INACTIVE", "BLOCKED"];
const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-gray-50 text-gray-700 border-gray-200",
  BLOCKED: "bg-red-50 text-red-700 border-red-200",
};

const emptyForm = {
  fullName: "",
  phone: "",
  email: "",
  propertyId: "",
  rentAmount: "",
  leaseStart: "",
  leaseEnd: "",
  status: "ACTIVE",
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewTenant, setViewTenant] = useState<Tenant | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTenants();
      setTenants(data.tenants ?? []);
      setProperties(data.properties ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useLoad(load);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (t: Tenant) => {
    setEditingId(t.id);
    setForm({
      fullName: t.fullName,
      phone: t.phone,
      email: t.email || "",
      propertyId: t.propertyId || "",
      rentAmount: t.rentAmount?.toString() || "",
      leaseStart: t.leaseStart ? t.leaseStart.split("T")[0] : "",
      leaseEnd: t.leaseEnd ? t.leaseEnd.split("T")[0] : "",
      status: t.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || undefined,
        propertyId: form.propertyId || null,
        rentAmount: form.rentAmount ? parseFloat(form.rentAmount) : null,
        leaseStart: form.leaseStart || null,
        leaseEnd: form.leaseEnd || null,
        status: form.status,
      };
      if (editingId) await updateTenant(editingId, payload);
      else await createTenant(payload);
      setShowModal(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTenant(deleteId);
      setDeleteId(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const hasTenants = tenants.length > 0;

  return (
    <div className="p-5 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Tenants</h1>
          <p className="text-sm text-gray-500">Manage your tenant information</p>
        </div>
        <Button onClick={openAdd} className="bg-[#2a6f97] hover:bg-[#235d7f] text-white text-xs gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Tenant
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")} className="font-bold">&times;</button>
        </div>
      )}

      <Card className="border-gray-200/80 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle>Tenants</CardTitle>
          <CardDescription>
            {hasTenants
              ? `${tenants.length} tenant${tenants.length !== 1 ? "s" : ""}`
              : "Your tenants will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="py-8 text-center text-gray-400 text-sm">Loading your tenants...</div>
          )}
          {!loading && !hasTenants && (
            <div className="text-center py-12 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500 mb-1">No tenants yet</p>
              <p className="text-xs text-gray-400">Start by adding your first tenant or approve an application</p>
            </div>
          )}
          {!loading && hasTenants && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tenants.map((t) => (
                <div
                  key={t.id}
                  className="group rounded-xl border border-gray-200/80 overflow-hidden hover:border-gray-300/80 transition-all duration-200 bg-white"
                >
                  <div className="p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1">{t.fullName}</h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ml-2 ${STATUS_STYLES[t.status] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-600">
                      {t.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{t.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span>{t.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span>{t.property?.title ?? "—"}</span>
                      </div>
                      {(t.rentAmount != null || t.leaseStart) && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span>
                            {t.rentAmount != null ? `${t.rentAmount.toLocaleString()} · ` : ""}
                            {fmtDate(t.leaseStart)} – {fmtDate(t.leaseEnd)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 pt-1 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-gray-500 hover:text-[#2a6f97]"
                        onClick={() => setViewTenant(t)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-gray-500 hover:text-[#2a6f97]"
                        onClick={() => openEdit(t)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-gray-500 hover:text-red-600"
                        onClick={() => setDeleteId(t.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Tenant" : "Add Tenant"} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Property</label>
            <select
              value={form.propertyId}
              onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
            >
              <option value="">— None —</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rent Amount</label>
            <input
              type="number"
              value={form.rentAmount}
              onChange={(e) => setForm({ ...form, rentAmount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
              placeholder="e.g. 25000"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease Start</label>
              <input
                type="date"
                value={form.leaseStart}
                onChange={(e) => setForm({ ...form, leaseStart: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease End</label>
              <input
                type="date"
                value={form.leaseEnd}
                onChange={(e) => setForm({ ...form, leaseEnd: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.fullName || !form.phone}
              className="bg-[#2a6f97] hover:bg-[#235d7f] text-white"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!viewTenant} onClose={() => setViewTenant(null)} title="Tenant Details">
        {viewTenant && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500">Name:</span> <span className="font-medium">{viewTenant.fullName}</span>
              </div>
              <div>
                <span className="text-gray-500">Phone:</span> <span className="font-medium">{viewTenant.phone}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span> <span className="font-medium">{viewTenant.email || "—"}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>{" "}
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[viewTenant.status]}`}>
                  {viewTenant.status}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Property:</span> <span className="font-medium">{viewTenant.property?.title || "—"}</span>
              </div>
              <div>
                <span className="text-gray-500">Rent:</span>{" "}
                <span className="font-medium">{viewTenant.rentAmount != null ? viewTenant.rentAmount.toLocaleString() : "—"}</span>
              </div>
              <div>
                <span className="text-gray-500">Lease Start:</span> <span className="font-medium">{fmtDate(viewTenant.leaseStart)}</span>
              </div>
              <div>
                <span className="text-gray-500">Lease End:</span> <span className="font-medium">{fmtDate(viewTenant.leaseEnd)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Tenant">
        <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this tenant? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
