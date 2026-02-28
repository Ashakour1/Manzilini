import { api } from "@/lib/api";

export interface PropertyIncome {
  id: string;
  propertyId: string;
  tenantId: string | null;
  incomeDate: string;
  amount: string;
  source: string;
  paymentMethod: string;
  reference: string | null;
  description: string | null;
  property?: { id: string; title: string; address?: string };
  tenant?: { id: string; fullName: string; email?: string; phone?: string } | null;
}

export interface PropertyExpense {
  id: string;
  propertyId: string;
  expenseDate: string;
  amount: string;
  category: string;
  paymentMethod: string;
  vendorName: string | null;
  reference: string | null;
  description: string | null;
  property?: { id: string; title: string; address?: string };
}

export function getPropertyIncomes(propertyId?: string, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (propertyId) params.set("propertyId", propertyId);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return api.get<PropertyIncome[]>(`/property-incomes${qs ? `?${qs}` : ""}`);
}

export function createPropertyIncome(data: {
  propertyId: string;
  tenantId?: string | null;
  incomeDate: string;
  amount: number;
  source: string;
  paymentMethod: string;
  reference?: string | null;
  description?: string | null;
}) {
  return api.post<PropertyIncome>("/property-incomes", data);
}

export function updatePropertyIncome(id: string, data: Partial<{
  propertyId: string;
  tenantId: string | null;
  incomeDate: string;
  amount: number;
  source: string;
  paymentMethod: string;
  reference: string | null;
  description: string | null;
}>) {
  return api.patch<PropertyIncome>(`/property-incomes/${id}`, data);
}

export function deletePropertyIncome(id: string) {
  return api.delete<{ message: string }>(`/property-incomes/${id}`);
}

export function getPropertyExpenses(propertyId?: string, category?: string, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (propertyId) params.set("propertyId", propertyId);
  if (category) params.set("category", category);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return api.get<PropertyExpense[]>(`/property-expenses${qs ? `?${qs}` : ""}`);
}

export function createPropertyExpense(data: {
  propertyId: string;
  expenseDate: string;
  amount: number;
  category: string;
  paymentMethod: string;
  vendorName?: string | null;
  reference?: string | null;
  description?: string | null;
}) {
  return api.post<PropertyExpense>("/property-expenses", data);
}

export function updatePropertyExpense(id: string, data: Partial<{
  propertyId: string;
  expenseDate: string;
  amount: number;
  category: string;
  paymentMethod: string;
  vendorName: string | null;
  reference: string | null;
  description: string | null;
}>) {
  return api.patch<PropertyExpense>(`/property-expenses/${id}`, data);
}

export function deletePropertyExpense(id: string) {
  return api.delete<{ message: string }>(`/property-expenses/${id}`);
}
