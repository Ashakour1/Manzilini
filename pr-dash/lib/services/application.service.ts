import { api } from "@/lib/api";
import type { Application } from "@/lib/types";

export function getApplications(status?: string) {
  const query = status ? `?status=${status}` : "";
  return api.get<Application[]>(`/property-applications/landlord/me${query}`);
}

export function approveApplication(id: string, data?: Record<string, unknown>) {
  return api.patch<Application>(`/property-applications/${id}/approve`, data ?? {});
}

export function rejectApplication(id: string, remarks?: string) {
  return api.patch<Application>(`/property-applications/${id}/reject`, { remarks });
}
