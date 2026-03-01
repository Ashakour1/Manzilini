import { useAuthStore } from "./store/auth.store";

const API_BASE =  "https://manzilline-production-fcab.up.railway.app/api/v1";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = useAuthStore.getState().token;
  return token ?? localStorage.getItem("");
}

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await fetch(`https://manzilline-production-fcab.up.railway.app/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    const user = data.user ?? { _id: data._id, name: data.name, email: data.email, role: data.role, status: data.status };
    return { token: data.token, user } as { token: string; user: Record<string, unknown> };
  },
};

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // if (res.status === 401) {
  //   if (typeof window !== "undefined") {
  //     useAuthStore.getState().logout();
  //     window.location.href = "/login";
  //   }
  //   throw new Error("Unauthorized");
  // }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data as T;
}

export async function requestFormData<T>(path: string, formData: FormData, method: "POST" | "PUT" = "POST"): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: formData });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  postForm: <T>(path: string, formData: FormData) => requestFormData<T>(path, formData, "POST"),
  putForm: <T>(path: string, formData: FormData) => requestFormData<T>(path, formData, "PUT"),
};
