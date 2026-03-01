"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      login(data.token, data.user as Parameters<typeof login>[1]);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-[48%] flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="relative z-10">
          <Image src="/logo.png" alt="Manzilini" width={48} height={48} className="rounded-xl" />
          <h1 className="mt-6 text-2xl font-bold text-white tracking-tight">Manzilini</h1>
          <p className="mt-1 text-white/80 text-sm">Landlord Portal</p>
        </div>
        <div className="relative z-10">
          <blockquote className="text-white/90 text-lg leading-relaxed">
            &ldquo;Manage your properties, tenants, and finances in one place.&rdquo;
          </blockquote>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#fafbfc]">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-10 text-center">
            <Image src="/logo.png" alt="Manzilini" width={44} height={44} className="mx-auto rounded-xl" />
            <h1 className="mt-3 text-xl font-bold text-[var(--foreground)]">Manzilini</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Landlord Portal</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">
              Sign in
            </h2>
            <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="w-full h-11 px-4 rounded-lg border border-[var(--border)] bg-white text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full h-11 px-4 rounded-lg border border-[var(--border)] bg-white text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>

            <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[var(--primary)] hover:underline font-medium">
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
