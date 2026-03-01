import { api } from "@/lib/api";
import type { MaintenanceRequest, Property } from "@/lib/types";

export interface MaintenanceResponse {
  requests: MaintenanceRequest[];
  properties: Property[];
}

/** Fetch maintenance requests and properties scoped by user (single call) */
export function getMaintenanceRequests() {
  return api.get<MaintenanceResponse>("/maintenance");
}

export function getMaintenanceRequestById(id: string) {
  return api.get<MaintenanceRequest>(`/maintenance/${id}`);
}

export function createMaintenanceRequest(data: Partial<MaintenanceRequest>) {
  return api.post<MaintenanceRequest>("/maintenance", data);
}

export function updateMaintenanceRequest(id: string, data: Partial<MaintenanceRequest>) {
  return api.patch<MaintenanceRequest>(`/maintenance/${id}`, data);
}

export function deleteMaintenanceRequest(id: string) {
  return api.delete<{ message?: string }>(`/maintenance/${id}`);
}
