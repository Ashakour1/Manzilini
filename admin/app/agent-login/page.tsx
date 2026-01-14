"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Eye, EyeOff, Fingerprint, Lock, Mail, ShieldCheck, AlertCircle, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Login from "@/services/auth.service"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"

export default function AgentLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, logout, isLoggedIn, isHydrated, user } = useAuthStore();

  const router = useRouter();

  // Redirect logged-in agents to agent dashboard, block non-agents
  useEffect(() => {
    if (isHydrated && isLoggedIn && user) {
      const role = user.role?.toUpperCase();
      if (role === "AGENT") {
        router.replace("/agent/dashboard");
      } else {
        // Non-agents should use admin login
        logout();
        setError("Please use the admin login page for non-agent accounts.");
      }
    }
  }, [isHydrated, isLoggedIn, user, router, logout]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (error) {
      setError(null)
    }
  }

  const HandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null)
    setIsLoading(true)

    try {
      const data = await Login(formData.email, formData.password);
      
      // Only allow agents to login here
      const role = data.role?.toUpperCase();
      if (role !== "AGENT") {
        setError("This login page is for field agents only. Please use the admin login page.");
        setIsLoading(false);
        return;
      }
      
      // Store user data
      login({
        token: data.token,
        name: data.name,
        email: data.email,
        role: data.role,
      });

      // Redirect to agent dashboard
      router.push("/agent/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setError(error instanceof Error ? error.message : "Failed to login. Please try again.");
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render login form if user is already logged in (will redirect)
  if (isHydrated && isLoggedIn) {
    return null;
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#2a6f97]/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-12 right-12 h-64 w-64 rounded-full bg-[#2a6f97]/5 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2a6f97]/5 blur-3xl" />
      </div>

      <section className="relative mx-auto grid min-h-screen max-w-5xl grid-cols-1 items-center gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:px-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2a6f97]/20 bg-[#2a6f97]/10 px-3 py-1 text-xs font-medium text-[#2a6f97]">
              <MapPin className="h-3.5 w-3.5" />
              Field Agent Portal
            </div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
              Sign in to manage your properties and clients
            </h1>
            <p className="max-w-xl text-sm text-gray-600">
              Access your field agent dashboard to manage properties, landlords, tenants, and track your activities.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="group rounded-lg border border-gray-200 backdrop-blur-sm p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2a6f97]/40 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2a6f97]/10 text-[#2a6f97] transition-colors group-hover:bg-[#2a6f97]/20">
                <MapPin className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">Property Management</p>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">View and manage properties assigned to you</p>
            </div>
            <div className="group rounded-lg border border-gray-200 backdrop-blur-sm p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2a6f97]/40 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2a6f97]/10 text-[#2a6f97] transition-colors group-hover:bg-[#2a6f97]/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">Client Relations</p>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">Manage landlords and tenants you work with</p>
            </div>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-none">
          <CardHeader className="space-y-2 pb-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-xl font-bold text-gray-900">Agent Login</CardTitle>
              <Badge variant="outline" className="border-[#2a6f97]/30 bg-[#2a6f97]/10 text-[#2a6f97] text-xs font-medium">
                Agent
              </Badge>
            </div>
            <CardDescription className="text-sm text-gray-600">Sign in with your agent credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={HandleSubmit}>
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 py-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <AlertTitle className="text-sm text-red-800">Login Failed</AlertTitle>
                  <AlertDescription className="text-xs text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              <Button 
                variant="outline" 
                className="w-full justify-center gap-2 h-9 border-gray-300 hover:bg-gray-50 text-sm" 
                type="button"
              >
                <Fingerprint className="h-3.5 w-3.5" />
                Sign in with fingerprint
              </Button>

              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
                <div className="h-px flex-1 bg-gray-300" />
                <span className="text-[10px]">or with email</span>
                <div className="h-px flex-1 bg-gray-300" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-gray-700">Email</Label>
                <InputGroup 
                  className="h-9 rounded-lg bg-white border-gray-300 focus-within:border-[#2a6f97] focus-within:ring-1 focus-within:ring-[#2a6f97]/20 transition-all"
                >
                  <InputGroupAddon>
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="email"
                    name="email"
                    type="email"
                    placeholder="agent@company.com"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="placeholder:text-gray-400 text-sm"
                  />
                </InputGroup>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-gray-700">Password</Label>
                <InputGroup 
                  className="h-9 rounded-lg bg-white border-gray-300 focus-within:border-[#2a6f97] focus-within:ring-1 focus-within:ring-[#2a6f97]/20 transition-all"
                >
                  <InputGroupAddon>
                    <Lock className="h-3.5 w-3.5 text-gray-400" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="placeholder:text-gray-400 text-sm"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-gray-500 hover:text-gray-700 h-7"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span className="ml-1 text-[10px]">{showPassword ? "Hide" : "Show"}</span>
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <p className="text-[10px] text-gray-500">
                  At least 8 characters. SSO/MFA enforced for sensitive actions.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                  <Checkbox id="remember" name="remember" className="h-3.5 w-3.5" />
                  <span>Keep me signed in</span>
                </label>
                <Button variant="link" className="h-auto px-0 text-xs text-[#2a6f97] hover:text-[#1f5a7a]" asChild>
                  <Link href="/reset-password">Forgot password?</Link>
                </Button>
              </div>
              <Button 
                className="w-full h-9 bg-[#2a6f97] hover:bg-[#1f5a7a] text-white text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Continue"}
                {!isLoading && <ArrowRight className="ml-2 h-3.5 w-3.5" />}
              </Button>
              <div className="text-center">
                <Button variant="link" className="h-auto px-0 text-xs text-gray-500 hover:text-[#2a6f97]" asChild>
                  <Link href="/">Admin Login</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
