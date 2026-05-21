"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Quote,
  Star,
  User,
} from "lucide-react";
import { registerLandlord, LandlordRegistrationData } from "@/lib/api";

const TESTIMONIALS = [
  {
    quote:
      "Manzilini cut my rent collection time in half. The dashboard is genuinely a joy to use every morning.",
    name: "Amina Kamau",
    role: "Owner · 12 units",
    location: "Nairobi",
    initials: "AK",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    quote:
      "Finally, one place for tenants, leases, and accounts. I sleep better at night knowing nothing slips through.",
    name: "David Otieno",
    role: "Property Manager",
    location: "Mombasa",
    initials: "DO",
    gradient: "from-sky-400 to-indigo-500",
  },
  {
    quote:
      "The reporting alone is worth it. I can show investors everything they need in two clicks.",
    name: "Sarah Mwangi",
    role: "Portfolio Director",
    location: "Kisumu",
    initials: "SM",
    gradient: "from-fuchsia-400 to-rose-500",
  },
];

function BrandPanel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const t = TESTIMONIALS[active];

  return (
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

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
          Grow your portfolio with Manzilini.
        </h2>
        <p className="mt-3 text-white/80 text-sm leading-relaxed">
          Join hundreds of landlords using a calm, modern workspace for properties, tenants, leases and finances.
        </p>

        {/* Testimonial card */}
        <div className="mt-7 rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-md p-5 shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 text-amber-300 fill-amber-300" aria-hidden />
              ))}
            </div>
            <Quote className="h-5 w-5 text-white/30" aria-hidden />
          </div>

          <p
            key={t.quote}
            className="mt-3 text-white/95 text-[15px] leading-relaxed animate-[fadeIn_400ms_ease-out]"
          >
            &ldquo;{t.quote}&rdquo;
          </p>

          <div className="mt-5 flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white/20`}
            >
              {t.initials}
            </div>
            <div className="leading-tight">
              <p className="text-white text-sm font-medium">{t.name}</p>
              <p className="text-white/60 text-xs">
                {t.role} · {t.location}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-1.5" role="tablist" aria-label="Testimonials">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Show testimonial ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-6 text-white/70 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Trusted by 500+ landlords
          </div>
          <span className="text-white/40">© {new Date().getFullYear()} Manzilini</span>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [formData, setFormData] = useState<LandlordRegistrationData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    company_name: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitStatus === "error") {
      setSubmitStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
        setErrorMessage("Name, email, and password are required fields");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setErrorMessage("Please enter a valid email address");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      if (formData.password.trim().length < 6) {
        setErrorMessage("Password must be at least 6 characters long");
        setSubmitStatus("error");
        setIsSubmitting(false);
        return;
      }

      await registerLandlord({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        phone: formData.phone?.trim() || undefined,
        company_name: formData.company_name?.trim() || undefined,
        address: formData.address?.trim() || undefined,
      });

      setSubmitStatus("success");
      setFormData({ name: "", email: "", password: "", phone: "", company_name: "", address: "" });
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    "w-full h-11 pl-10 pr-4 rounded-lg border border-[var(--border)] bg-white text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/80 text-sm shadow-sm transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 focus:outline-none disabled:opacity-60";

  if (submitStatus === "success") {
    return (
      <div className="min-h-screen flex">
        <BrandPanel />
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#fafbfc] relative">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.5]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.06) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="w-full max-w-[420px] text-center relative">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" aria-hidden />
            </div>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight mb-3">
              You&apos;re on the list
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-2">
              Thanks for signing up as a landlord with Manzilini.
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mb-8">
              We&apos;ll review your application and be in touch shortly.
            </p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full h-11 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-sm shadow-sm shadow-[var(--primary)]/20 transition-colors"
              >
                Go to sign in
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center w-full h-11 rounded-lg border border-[var(--border)] bg-white hover:bg-[var(--muted)] text-[var(--foreground)] font-medium text-sm transition-colors"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <BrandPanel />

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#fafbfc] relative overflow-y-auto">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.06) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="w-full max-w-[460px] relative py-8">
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
              Get started
            </span>
            <h2 className="text-[28px] leading-[1.15] font-semibold text-[var(--foreground)] tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Focus on your business — let Manzilini run your property portfolio.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {submitStatus === "error" && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-red-200/80 bg-red-50 px-3.5 py-3 text-sm text-red-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                <div className="leading-snug">
                  <p className="font-medium text-red-800">Couldn&apos;t create your account</p>
                  <p className="text-red-700/90">{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Full name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" aria-hidden />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className={inputBase}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Business name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" aria-hidden />
                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    placeholder="Acme Holdings"
                    value={formData.company_name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={inputBase}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Email address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" aria-hidden />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className={inputBase}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Phone number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" aria-hidden />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={inputBase}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" aria-hidden />
                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Nairobi, Kenya"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={inputBase}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" aria-hidden />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className={`${inputBase} pr-11`}
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
              <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                Use 6+ characters with a mix of letters and numbers.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group w-full h-11 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-sm shadow-sm shadow-[var(--primary)]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </>
              )}
            </button>

            <p className="pt-2 text-center text-sm text-[var(--muted-foreground)]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </form>

          <p className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[var(--foreground)]">Terms</Link>{" "}
            &amp;{" "}
            <Link href="/privacy" className="underline hover:text-[var(--foreground)]">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
