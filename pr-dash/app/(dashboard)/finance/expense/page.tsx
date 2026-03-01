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
  getPropertyExpenses,
  createPropertyExpense,
  updatePropertyExpense,
  deletePropertyExpense,
  type PropertyExpense,
} from "@/lib/services/finance.service";
import { useLoad } from "@/lib/hooks/useLoad";

const emptyExpenseForm = {
  propertyId: "",
  expenseDate: new Date().toISOString().split("T")[0],
  amount: "",
  category: "Maintenance",
  paymentMethod: "CASH",
  vendorName: "",
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

export default function ExpensePage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [expenses, setExpenses] = useState<PropertyExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [propertyFilter, setPropertyFilter] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PropertyExpense | null>(null);
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const propId = propertyFilter || undefined;
      const [props, exp] = await Promise.all([getProperties(), getPropertyExpenses(propId)]);
      setProperties(props);
      setExpenses(exp);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [propertyFilter]);

  useLoad(load);

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId && expenses.length > 0) {
      const expense = expenses.find((e) => e.id === editId);
      if (expense) {
        setEditingExpense(expense);
        setExpenseForm({
          propertyId: expense.propertyId,
          expenseDate: expense.expenseDate ? new Date(expense.expenseDate).toISOString().split("T")[0] : "",
          amount: String(expense.amount),
          category: expense.category || "Maintenance",
          paymentMethod: expense.paymentMethod || "CASH",
          vendorName: expense.vendorName || "",
          reference: expense.reference || "",
          description: expense.description || "",
        });
        setShowModal(true);
      }
    }
  }, [searchParams, expenses]);

  const openAddExpense = () => {
    setEditingExpense(null);
    setExpenseForm({
      ...emptyExpenseForm,
      expenseDate: new Date().toISOString().split("T")[0],
      propertyId: propertyFilter || "",
    });
    setShowModal(true);
  };

  const openEditExpense = (e: PropertyExpense) => {
    setEditingExpense(e);
    setExpenseForm({
      propertyId: e.propertyId,
      expenseDate: e.expenseDate ? new Date(e.expenseDate).toISOString().split("T")[0] : "",
      amount: String(e.amount),
      category: e.category || "Maintenance",
      paymentMethod: e.paymentMethod || "CASH",
      vendorName: e.vendorName || "",
      reference: e.reference || "",
      description: e.description || "",
    });
    setShowModal(true);
  };

  const handleSaveExpense = async () => {
    setSaving(true);
    try {
      const payload = {
        propertyId: expenseForm.propertyId,
        expenseDate: expenseForm.expenseDate,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        paymentMethod: expenseForm.paymentMethod,
        vendorName: expenseForm.vendorName || null,
        reference: expenseForm.reference || null,
        description: expenseForm.description || null,
      };
      if (editingExpense) {
        await updatePropertyExpense(editingExpense.id, payload);
      } else {
        await createPropertyExpense(payload);
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
      await deletePropertyExpense(deleteId);
      setDeleteId(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const totalExpense = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  return (
    <div className="p-5 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Expenses</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Record and manage expenses by property</p>
        </div>
        <Button onClick={openAddExpense} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white gap-1.5">
          <Plus className="h-4 w-4" />
          Add Expense
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
            <CardTitle>Expenses</CardTitle>
            <CardDescription>
              {expenses.length} record(s) · Total: {fmtAmount(totalExpense)}
            </CardDescription>
          </div>
          {/* <Button onClick={openAddExpense} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white gap-1.5">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button> */}
        </CardHeader>
        <CardContent>
          {loading && <div className="py-12 text-center text-[var(--muted-foreground)] text-sm">Loading...</div>}
          {!loading && expenses.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto mb-3 text-[var(--muted-foreground)]" />
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">No expenses yet</p>
              <p className="text-xs text-[var(--muted-foreground)] mb-4">Record maintenance or other expenses for your properties</p>
              <Button onClick={openAddExpense} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
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
                    <th className="w-20 px-4 py-3" aria-label="Actions" />
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditExpense(e)} className="h-8 w-8 p-0" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(e.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete">
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
                    <td className="px-4 py-3 text-right text-red-600">{fmtAmount(totalExpense)}</td>
                    <td className="px-4 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingExpense ? "Edit Expense" : "Add Expense"} maxWidth="max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
            <select
              value={expenseForm.propertyId}
              onChange={(e) => setExpenseForm({ ...expenseForm, propertyId: e.target.value })}
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
                value={expenseForm.expenseDate}
                onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
              <input
                type="number"
                step="0.01"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Utilities">Utilities</option>
                <option value="Security">Security</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment method *</label>
              <select
                value={expenseForm.paymentMethod}
                onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
            <input
              value={expenseForm.vendorName}
              onChange={(e) => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="Contractor, supplier..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
            <input
              value={expenseForm.reference}
              onChange={(e) => setExpenseForm({ ...expenseForm, reference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button
              onClick={handleSaveExpense}
              disabled={saving || !expenseForm.propertyId || !expenseForm.amount}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
            >
              {saving ? "Saving..." : editingExpense ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Expense">
        <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this expense? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
