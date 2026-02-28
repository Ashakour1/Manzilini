import { api } from "@/lib/api";
import type { Staff } from "@/lib/types";

export function getStaff() {
  return api.get<Staff[]>("/staff");
}

export function getStaffMember(id: string) {
  return api.get<Staff>(`/staff/${id}`);
}

export function createStaff(data: Partial<Staff>) {
  return api.post<Staff>("/staff", data);
}

export function updateStaff(id: string, data: Partial<Staff>) {
  return api.put<Staff>(`/staff/${id}`, data);
}

export function deleteStaff(id: string) {
  return api.delete<{ message?: string }>(`/staff/${id}`);
}
