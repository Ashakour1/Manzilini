import { api } from "@/lib/api";
import type { Application } from "@/lib/types";

/** Fetch property applications scoped by authenticated user (no params) */
export function getApplications() {
  return api.get<Application[]>(`/property-applications`);
}

export function approveApplication(id: string, data?: Record<string, unknown>) {
  return api.patch<Application>(`/property-applications/${id}/approve`, data ?? {});
}

export function rejectApplication(id: string, remarks?: string) {
  return api.patch<Application>(`/property-applications/${id}/reject`, { remarks });
}
