"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
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
      {/* Left panel - Branding with cityscape */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden">
        <Image
          src="/dash.jpg"
          alt="City skyline"
          fill
          priority
          sizes="(min-width: 1024px) 52vw, 0vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1e2e]/85 via-[#163049]/70 to-[#2a6f97]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center">
            <Image src="/logo.png" alt="Manzilini" width={28} height={28} className="rounded-md" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white tracking-tight leading-tight">Manzilini</h1>
            <p className="text-white/70 text-xs">Landlord Portal</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-white text-3xl font-semibold tracking-tight leading-tight">
            Run your portfolio with confidence.
          </h2>
          <p className="mt-3 text-white/80 text-sm leading-relaxed">
            Properties, tenants, leases and finances — all connected in one calm, modern workspace built for landlords.
          </p>

          <div className="mt-8 flex items-center gap-6 text-white/70 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              All systems operational
            </div>
            <span className="text-white/40">© {new Date().getFullYear()} Manzilini</span>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#fafbfc] relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.06) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="w-full max-w-[420px] relative">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <Image src="/logo.png" alt="Manzilini" width={40} height={40} className="rounded-xl" />
            <div>
              <h1 className="text-base font-semibold text-[var(--foreground)] leading-tight">Manzilini</h1>
              <p className="text-xs text-[var(--muted-foreground)]">Landlord Portal</p>
            </div>
          </div>

          <div className="mb-7">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/10 rounded-full px-2.5 py-1 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
              Welcome back
            </span>
            <h2 className="text-[28px] leading-[1.15] font-semibold text-[var(--foreground)] tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Enter your credentials below to access the dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-red-200/80 bg-red-50 px-3.5 py-3 text-sm text-red-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                <div className="leading-snug">
                  <p className="font-medium text-red-800">Couldn&apos;t sign in</p>
                  <p className="text-red-700/90">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none"
                  aria-hidden
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-[var(--border)] bg-white text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/80 text-sm shadow-sm transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[var(--foreground)]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none"
                  aria-hidden
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full h-11 pl-10 pr-11 rounded-lg border border-[var(--border)] bg-white text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/80 text-sm shadow-sm transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 inline-flex items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <span className="relative inline-flex h-4 w-4 items-center justify-center">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="peer absolute inset-0 h-4 w-4 cursor-pointer appearance-none rounded border border-[var(--border)] bg-white shadow-sm transition-colors checked:border-[var(--primary)] checked:bg-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/10"
                />
                <svg
                  className="pointer-events-none relative h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2.5 6.5L5 9l4.5-5.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-sm text-[var(--foreground)] group-hover:text-[var(--foreground)]">
                Remember me for 30 days
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="group w-full h-11 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-sm shadow-sm shadow-[var(--primary)]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/25"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </>
              )}
            </button>

            <p className="pt-2 text-center text-sm text-[var(--muted-foreground)]">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline font-medium"
              >
                Create account
              </Link>
            </p>
          </form>

          <p className="mt-10 text-center text-xs text-[var(--muted-foreground)]">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[var(--foreground)]">Terms</Link>{" "}
            &amp;{" "}
            <Link href="/privacy" className="underline hover:text-[var(--foreground)]">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
