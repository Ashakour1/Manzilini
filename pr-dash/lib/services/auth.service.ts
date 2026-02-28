import { api } from "@/lib/api";

// Server returns { _id, name, email, role, status, token }; we normalize to { token, user }
export async function login(email: string, password: string) {
  const data = await api.post<{
    token: string;
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
    status?: string;
    user?: Record<string, unknown>;
  }>("/auth/login", { email, password });

  const user = data.user ?? {
    _id: data._id,
    name: data.name,
    email: data.email,
    role: data.role,
    status: data.status,
  };
  return { token: data.token, user };
}
