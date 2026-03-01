"use client";

import { useState, useCallback } from "react";
import { Wrench, Plus, Pencil, Trash2, Home, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import type { MaintenanceRequest, Property } from "@/lib/types";
import {
  getMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
} from "@/lib/services/maintenance.service";
import { useLoad } from "@/lib/hooks/useLoad";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  "In Progress": "bg-sky-50 text-sky-700 border-sky-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const PRIORITY_STYLES: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-rose-50 text-rose-700 border-rose-200",
};

const emptyForm = {
  propertyId: "",
  issue: "",
  reportedBy: "",
  reportedDate: new Date().toISOString().slice(0, 10),
  status: "pending",
  priority: "medium",
  assignedTo: "",
  notes: "",
};

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMaintenanceRequests();
      setRequests(data?.requests ?? []);
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
    setForm({
      ...emptyForm,
      reportedDate: new Date().toISOString().slice(0, 10),
    });
    setShowModal(true);
  };

  const openEdit = (r: MaintenanceRequest) => {
    setEditingId(r.id);
    setForm({
      propertyId: r.propertyId,
      issue: r.issue,
      reportedBy: r.reportedBy,
      reportedDate: r.reportedDate ? r.reportedDate.slice(0, 10) : "",
      status: (r.statusEnum || r.status || "pending").toLowerCase().replace(/ /g, "_"),
      priority: (r.priorityEnum || r.priority || "medium").toLowerCase(),
      assignedTo: r.assignedTo || "",
      notes: r.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.propertyId || !form.issue.trim() || !form.reportedBy.trim()) {
      setError("Property, issue, and reported by are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        propertyId: form.propertyId,
        issue: form.issue.trim(),
        reportedBy: form.reportedBy.trim(),
        reportedDate: form.reportedDate || new Date().toISOString().slice(0, 10),
        status: form.status,
        priority: form.priority,
        assignedTo: form.assignedTo.trim() || "Not Assigned",
        notes: form.notes.trim() || undefined,
      };
      if (editingId) {
        await updateMaintenanceRequest(editingId, payload);
      } else {
        await createMaintenanceRequest(payload);
      }
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
      await deleteMaintenanceRequest(deleteId);
      setDeleteId(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const openCount = requests.filter((r) => r.status !== "Completed").length;
  const highPriorityCount = requests.filter((r) => r.priority === "High").length;
  const filteredRequests = requests.filter((r) => {
    const matchesStatus = !statusFilter || r.status.toLowerCase().replace(/ /g, "_") === statusFilter;
    const matchesPriority = !priorityFilter || r.priority.toLowerCase() === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPropertyTitle = (r: MaintenanceRequest) =>
    r.property?.title || properties.find((p) => p.id === r.propertyId)?.title || r.propertyId;

  return (
    <div className="p-5 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Maintenance</h1>
          <p className="text-sm text-gray-500">Track and manage maintenance requests for your properties</p>
        </div>
        <Button onClick={openAdd} className="bg-[#2a6f97] hover:bg-[#235d7f] text-white text-xs gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New Request
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Maintenance Board
              </CardTitle>
              <CardDescription>
                Track requests, assignments, and prioritize by urgency
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2a6f97] outline-none"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2a6f97] outline-none"
              >
                <option value="">All priorities</option>
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs">
                <AlertCircle className="h-3.5 w-3.5" />
                Open: {openCount}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs">
                <Wrench className="h-3.5 w-3.5" />
                High priority: {highPriorityCount}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="py-8 text-center text-gray-400 text-sm">Loading maintenance requests...</div>
          )}
          {!loading && filteredRequests.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500 mb-1">No maintenance requests</p>
              <p className="text-xs text-gray-400">Create a request to track repairs and upkeep</p>
            </div>
          )}
          {!loading && filteredRequests.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="text-left font-semibold text-gray-900 px-4 py-3">Request</th>
                    <th className="text-left font-semibold text-gray-900 px-4 py-3">Property</th>
                    <th className="text-left font-semibold text-gray-900 px-4 py-3">Priority</th>
                    <th className="text-left font-semibold text-gray-900 px-4 py-3">Status</th>
                    <th className="text-left font-semibold text-gray-900 px-4 py-3">Assigned</th>
                    <th className="text-left font-semibold text-gray-900 px-4 py-3">Reported</th>
                    <th className="w-20 px-4 py-3" aria-label="Actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{r.id}</p>
                          <p className="text-gray-600 line-clamp-1">{r.issue}</p>
                          <p className="text-xs text-gray-400">By {r.reportedBy}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <span className="flex items-center gap-1">
                          <Home className="h-3.5 w-3.5 flex-shrink-0" />
                          {getPropertyTitle(r)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium border ${PRIORITY_STYLES[r.priority] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {r.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium border ${STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.assignedTo || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(r.reportedDate)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-[#2a6f97]"
                            onClick={() => openEdit(r)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                            onClick={() => setDeleteId(r.id)}
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

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Request" : "New Request"}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
            <select
              value={form.propertyId}
              onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
              required
            >
              <option value="">Select property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue *</label>
            <textarea
              value={form.issue}
              onChange={(e) => setForm({ ...form, issue: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
              rows={3}
              placeholder="Describe the maintenance request"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reported by *</label>
              <input
                value={form.reportedBy}
                onChange={(e) => setForm({ ...form, reportedBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
                placeholder="Tenant or staff name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reported date *</label>
              <input
                type="date"
                value={form.reportedDate}
                onChange={(e) => setForm({ ...form, reportedDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned to</label>
              <input
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
                placeholder="Vendor or team"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#2a6f97] outline-none"
              rows={2}
              placeholder="Additional notes"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.propertyId || !form.issue.trim() || !form.reportedBy.trim()}
              className="bg-[#2a6f97] hover:bg-[#235d7f] text-white"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Request">
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this maintenance request? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
