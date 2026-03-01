"use client";

import { useState, useCallback } from "react";
import { UserCog, Plus, Pencil, Trash2, Home } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import type { Staff, Property } from "@/lib/types";
import { getStaff, createStaff, updateStaff, deleteStaff } from "@/lib/services/staff.service";
import { useLoad } from "@/lib/hooks/useLoad";

const ROLES = ["MANAGER", "CARETAKER", "ACCOUNTANT", "CLEANER", "SECURITY", "ELECTRICIAN", "PLUMBER", "MAINTENANCE_TECHNICIAN", "GARDENER", "RECEPTIONIST"];
const ROLE_STYLES: Record<string, string> = {
  MANAGER: "bg-purple-50 text-purple-700 border-purple-200",
  CARETAKER: "bg-teal-50 text-teal-700 border-teal-200",
  ACCOUNTANT: "bg-amber-50 text-amber-700 border-amber-200",
  CLEANER: "bg-green-50 text-green-700 border-green-200",
  SECURITY: "bg-red-50 text-red-700 border-red-200",
  ELECTRICIAN: "bg-blue-50 text-blue-700 border-blue-200",
  PLUMBER: "bg-yellow-50 text-yellow-700 border-yellow-200",
  MAINTENANCE_TECHNICIAN: "bg-gray-50 text-gray-700 border-gray-200",
  GARDENER: "bg-orange-50 text-orange-700 border-orange-200",
  RECEPTIONIST: "bg-pink-50 text-pink-700 border-pink-200",
};

const ASSIGNMENT_TYPES = [
  { value: "ALL_PROPERTIES", label: "All properties" },
  { value: "SPECIFIC_PROPERTIES", label: "Specific properties" },
];

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "CARETAKER",
  assgnmentType: "ALL_PROPERTIES" as "ALL_PROPERTIES" | "SPECIFIC_PROPERTIES",
  assignedPropertyIds: [] as string[],
  status: "ACTIVE",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getStaff();
      setStaff(data?.staff ?? []);
      setProperties(data?.properties ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useLoad(load);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (s: Staff) => {
    setEditingId(s.id);
    const ids = s.assignedProperties?.map((p) => p.id) ?? [];
    const first = s.firstName ?? (s.name ? s.name.split(/\s+/)[0] : "");
    const last = s.lastName ?? (s.name ? s.name.split(/\s+/).slice(1).join(" ") : "");
    setForm({
      firstName: first,
      lastName: last,
      email: s.email,
      phone: s.phone || "",
      role: s.role,
      assgnmentType: (s.assgnmentType === "SPECIFIC_PROPERTIES" ? "SPECIFIC_PROPERTIES" : "ALL_PROPERTIES") as "ALL_PROPERTIES" | "SPECIFIC_PROPERTIES",
      assignedPropertyIds: ids,
      status: s.status,
    });
    setShowModal(true);
  };

  const toggleProperty = (id: string) => {
    setForm((prev) => {
      const ids = prev.assignedPropertyIds.includes(id)
        ? prev.assignedPropertyIds.filter((x) => x !== id)
        : [...prev.assignedPropertyIds, id];
      return { ...prev, assignedPropertyIds: ids };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || null,
        role: form.role,
        assgnmentType: form.assgnmentType,
        status: form.status,
      };
      if (form.assgnmentType === "SPECIFIC_PROPERTIES") {
        payload.assignedPropertyIds = form.assignedPropertyIds;
      } else {
        payload.assignedPropertyIds = [];
      }
      if (editingId) await updateStaff(editingId, payload as Partial<Staff>);
      else await createStaff(payload as Partial<Staff>);
      setShowModal(false);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const getFullName = (s: Staff) => {
    const first = s.firstName ?? (s.name ? s.name.split(/\s+/)[0] : "");
    const last = s.lastName ?? (s.name ? s.name.split(/\s+/).slice(1).join(" ") : "");
    return [first, last].filter(Boolean).join(" ") || s.name || "—";
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteStaff(deleteId);
      setDeleteId(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const hasStaff = staff.length > 0;

  const getAssignmentLabel = (s: Staff) => {
    if (s.assgnmentType === "SPECIFIC_PROPERTIES" && s.assignedProperties?.length) {
      return s.assignedProperties.map((p) => p.title).join(", ");
    }
    return "All properties";
  };

  return (
    <div className="p-5 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Staff</h1>
          <p className="text-sm text-gray-500">Manage your property staff members</p>
        </div>
        <Button onClick={openAdd} className="bg-[#2a6f97] hover:bg-[#235d7f] text-white text-xs gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Staff
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
          <CardTitle>Staff</CardTitle>
          <CardDescription>
            {hasStaff
              ? `${staff.length} staff member${staff.length !== 1 ? "s" : ""}`
              : "Add managers, caretakers, or accountants for your properties"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="py-8 text-center text-gray-400 text-sm">Loading staff...</div>
          )}
          {!loading && !hasStaff && (
            <div className="text-center py-12 text-gray-400">
              <UserCog className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500 mb-1">No staff members</p>
              <p className="text-xs text-gray-400">Add managers, caretakers, or accountants for your properties</p>
            </div>
          )}
          {!loading && hasStaff && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="text-left font-semibold text-gray-900 px-4 py-3">Name</th>
                    <th className="text-left font-semibold text-gray-900 px-4 py-3">Email</th>
                    <th className="text-left font-semibold text-gray-900 px-4 py-3">Phone</th>
                    <th className="text-left font-semibold text-gray-900 px-4 py-3">Role</th>
                    <th className="text-left font-semibold text-gray-900 px-4 py-3">Assignment</th>
                    <th className="text-left font-semibold text-gray-900 px-4 py-3">Status</th>
                    <th className="w-20 px-4 py-3" aria-label="Actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{getFullName(s)}</td>
                      <td className="px-4 py-3 text-gray-600">{s.email}</td>
                      <td className="px-4 py-3 text-gray-600">{s.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ${ROLE_STYLES[s.role] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {s.role.charAt(0) + s.role.slice(1).toLowerCase().replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate" title={getAssignmentLabel(s)}>
                        {getAssignmentLabel(s)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            s.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-[#2a6f97]"
                            onClick={() => openEdit(s)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                            onClick={() => setDeleteId(s.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Staff" : "Add Staff"} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
                placeholder="Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment type *</label>
            <div className="flex gap-3">
              {ASSIGNMENT_TYPES.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="assgnmentType"
                    value={opt.value}
                    checked={form.assgnmentType === opt.value}
                    onChange={() => setForm({ ...form, assgnmentType: opt.value as "ALL_PROPERTIES" | "SPECIFIC_PROPERTIES" })}
                    className="text-[#2a6f97] focus:ring-[#2a6f97]"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          {form.assgnmentType === "SPECIFIC_PROPERTIES" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select properties</label>
              {properties.length === 0 ? (
                <p className="text-sm text-gray-500">No properties available. Create a property first.</p>
              ) : (
                <div className="grid gap-2 grid-cols-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {properties.map((p) => {
                    const selected = form.assignedPropertyIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleProperty(p.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-colors ${
                          selected
                            ? "border-[#2a6f97] bg-[#2a6f97]/10 text-[#2a6f97]"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <Home className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{p.title}</span>
                        {selected && (
                          <span className="ml-auto text-[10px] font-semibold">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.firstName || !form.lastName || !form.email || !form.role}
              className="bg-[#2a6f97] hover:bg-[#235d7f] text-white"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Staff Member">
        <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this staff member? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
