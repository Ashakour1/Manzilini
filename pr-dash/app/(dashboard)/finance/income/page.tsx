"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { DollarSign, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import type { Property } from "@/lib/types";
import { getProperties } from "@/lib/services/property.service";
import {
  getPropertyIncomes,
  createPropertyIncome,
  updatePropertyIncome,
  deletePropertyIncome,
  type PropertyIncome,
} from "@/lib/services/finance.service";

const emptyIncomeForm = {
  propertyId: "",
  tenantId: "",
  incomeDate: new Date().toISOString().split("T")[0],
  amount: "",
  source: "Rent",
  paymentMethod: "CASH",
  reference: "",
  description: "",
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtAmount(amount: string | number) {
  return Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function IncomePage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [incomes, setIncomes] = useState<PropertyIncome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [propertyFilter, setPropertyFilter] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<PropertyIncome | null>(null);
  const [incomeForm, setIncomeForm] = useState(emptyIncomeForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const propId = propertyFilter || undefined;
      const [props, inc] = await Promise.all([getProperties(), getPropertyIncomes(propId)]);
      setProperties(props);
      setIncomes(inc);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [propertyFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId && incomes.length > 0) {
      const income = incomes.find((i) => i.id === editId);
      if (income) {
        setEditingIncome(income);
        setIncomeForm({
          propertyId: income.propertyId,
          tenantId: income.tenantId || "",
          incomeDate: income.incomeDate ? new Date(income.incomeDate).toISOString().split("T")[0] : "",
          amount: String(income.amount),
          source: income.source || "Rent",
          paymentMethod: income.paymentMethod || "CASH",
          reference: income.reference || "",
          description: income.description || "",
        });
        setShowModal(true);
      }
    }
  }, [searchParams, incomes]);

  const openAddIncome = () => {
    setEditingIncome(null);
    setIncomeForm({
      ...emptyIncomeForm,
      incomeDate: new Date().toISOString().split("T")[0],
      propertyId: propertyFilter || "",
    });
    setShowModal(true);
  };

  const openEditIncome = (i: PropertyIncome) => {
    setEditingIncome(i);
    setIncomeForm({
      propertyId: i.propertyId,
      tenantId: i.tenantId || "",
      incomeDate: i.incomeDate ? new Date(i.incomeDate).toISOString().split("T")[0] : "",
      amount: String(i.amount),
      source: i.source || "Rent",
      paymentMethod: i.paymentMethod || "CASH",
      reference: i.reference || "",
      description: i.description || "",
    });
    setShowModal(true);
  };

  const handleSaveIncome = async () => {
    setSaving(true);
    try {
      const payload = {
        propertyId: incomeForm.propertyId,
        tenantId: incomeForm.tenantId || null,
        incomeDate: incomeForm.incomeDate,
        amount: parseFloat(incomeForm.amount),
        source: incomeForm.source,
        paymentMethod: incomeForm.paymentMethod,
        reference: incomeForm.reference || null,
        description: incomeForm.description || null,
      };
      if (editingIncome) {
        await updatePropertyIncome(editingIncome.id, payload);
      } else {
        await createPropertyIncome(payload);
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
      await deletePropertyIncome(deleteId);
      setDeleteId(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount || 0), 0);

  return (
    <div className="p-5 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Income</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Record and manage income by property</p>
        </div>
        <Button onClick={openAddIncome} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white gap-1.5">
          <Plus className="h-4 w-4" />
          Add Income
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")} className="font-bold">&times;</button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-[var(--foreground)]">Property</label>
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
        >
          <option value="">All properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <Card className="border-[var(--border)]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Income</CardTitle>
            <CardDescription>
              {incomes.length} record(s) · Total: {fmtAmount(totalIncome)}
            </CardDescription>
          </div>
          {/* <Button onClick={openAddIncome} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white gap-1.5">
            <Plus className="h-4 w-4" />
            Add Income
          </Button> */}
        </CardHeader>
        <CardContent>
          {loading && <div className="py-12 text-center text-[var(--muted-foreground)] text-sm">Loading...</div>}
          {!loading && incomes.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto mb-3 text-[var(--muted-foreground)]" />
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">No incomes yet</p>
              <p className="text-xs text-[var(--muted-foreground)] mb-4">Record rent or other income for your properties</p>
              <Button onClick={openAddIncome} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </div>
          )}
          {!loading && incomes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                    <th className="text-left font-semibold text-[var(--foreground)] px-4 py-3">Date</th>
                    <th className="text-left font-semibold text-[var(--foreground)] px-4 py-3">Property</th>
                    <th className="text-left font-semibold text-[var(--foreground)] px-4 py-3">Source</th>
                    <th className="text-left font-semibold text-[var(--foreground)] px-4 py-3">Payment</th>
                    <th className="text-right font-semibold text-[var(--foreground)] px-4 py-3">Amount</th>
                    <th className="w-20 px-4 py-3" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((i) => (
                    <tr key={i.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors">
                      <td className="px-4 py-3 text-[var(--foreground)] whitespace-nowrap">{fmtDate(i.incomeDate)}</td>
                      <td className="px-4 py-3 text-[var(--foreground)]">{i.property?.title ?? "—"}</td>
                      <td className="px-4 py-3 text-[var(--foreground)]">{i.source}</td>
                      <td className="px-4 py-3 text-[var(--muted-foreground)]">{i.paymentMethod ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600">{fmtAmount(i.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditIncome(i)} className="h-8 w-8 p-0" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(i.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[var(--border)] bg-[var(--muted)]/30 font-semibold">
                    <td colSpan={4} className="px-4 py-3 text-right text-[var(--foreground)]">Total</td>
                    <td className="px-4 py-3 text-right text-emerald-600">{fmtAmount(totalIncome)}</td>
                    <td className="px-4 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingIncome ? "Edit Income" : "Add Income"} maxWidth="max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
            <select
              value={incomeForm.propertyId}
              onChange={(e) => setIncomeForm({ ...incomeForm, propertyId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              required
            >
              <option value="">— Select —</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={incomeForm.incomeDate}
                onChange={(e) => setIncomeForm({ ...incomeForm, incomeDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
              <input
                type="number"
                step="0.01"
                value={incomeForm.amount}
                onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source *</label>
              <select
                value={incomeForm.source}
                onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="Rent">Rent</option>
                <option value="Deposit">Deposit</option>
                <option value="Commission">Commission</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment method *</label>
              <select
                value={incomeForm.paymentMethod}
                onChange={(e) => setIncomeForm({ ...incomeForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="CASH">Cash</option>
                <option value="BANK">Bank</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="Mpesa">Mpesa</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
            <input
              value={incomeForm.reference}
              onChange={(e) => setIncomeForm({ ...incomeForm, reference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="Receipt ID, etc."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button
              onClick={handleSaveIncome}
              disabled={saving || !incomeForm.propertyId || !incomeForm.amount}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
            >
              {saving ? "Saving..." : editingIncome ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Income">
        <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this income? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
