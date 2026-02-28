import { api } from "@/lib/api";
import type { Tenant } from "@/lib/types";

export function getTenants() {
  return api.get<Tenant[]>("/tenants");
}

export function getTenant(id: string) {
  return api.get<Tenant>(`/tenants/${id}`);
}

export function createTenant(data: Partial<Tenant>) {
  return api.post<Tenant>("/tenants", data);
}

export function updateTenant(id: string, data: Partial<Tenant>) {
  return api.put<Tenant>(`/tenants/${id}`, data);
}

export function deleteTenant(id: string) {
  return api.delete<{ message?: string }>(`/tenants/${id}`);
}
