import { api } from "@/lib/api";

export function getProfile() {
  return api.get<{ id: string; name?: string; email?: string; status?: string }>("/landlords/me");
}
