"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { registerLandlord, LandlordRegistrationData } from "@/lib/api";

export default function SignupPage() {
  const [formData, setFormData] = useState<LandlordRegistrationData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    company_name: "",
    address: "",
  });
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

  const inputClass =
    "w-full h-11 px-4 rounded-lg border border-[var(--border)] bg-white text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 focus:outline-none disabled:opacity-60";

  if (submitStatus === "success") {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-[48%] flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
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
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#fafbfc]">
          <div className="w-full max-w-[400px] text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Registration Successful!</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-2">
              Thank you for registering as a landlord with Manzilini.
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mb-8">
              We&apos;ll review your application and contact you as soon as possible.
            </p>
            <div className="space-y-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center w-full h-11 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-sm"
              >
                Back to Home
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full h-11 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)] font-medium text-sm"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-[48%] flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
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
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#fafbfc] overflow-y-auto">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-10 text-center">
            <Image src="/logo.png" alt="Manzilini" width={44} height={44} className="mx-auto rounded-xl" />
            <h1 className="mt-3 text-xl font-bold text-[var(--foreground)]">Manzilini</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Landlord Portal</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">
              Create your account
            </h2>
            <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
              Focus on your business. Let Manzilini build your property portfolio.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {submitStatus === "error" && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Business name
                </label>
                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  placeholder="Acme"
                  value={formData.company_name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
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
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+254118723979"
                value={formData.phone}
                onChange={handleChange}
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="123 Main Street, Nairobi, Kenya"
                value={formData.address}
                onChange={handleChange}
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a secure password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--primary)] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
