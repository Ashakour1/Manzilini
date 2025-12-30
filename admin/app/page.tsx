"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Building2, Eye, EyeOff, Fingerprint, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import Login from "@/services/auth.service"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"

const perks = [
  {
    icon: ShieldCheck,
    title: "Enterprise-grade security",
    desc: "Encryption, device checks, and smart session lockouts baked in.",
  },
  {
    icon: Building2,
    title: "Operations overview",
    desc: "See rent, maintenance, and balances by landlord and tenant the moment you land.",
  },
  {
    icon: Sparkles,
    title: "One-click workflows",
    desc: "Approve payments, dispatch vendors, and notify landlords and tenants instantly.",
  },
]


export default function Home() {
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login } = useAuthStore();

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  }


  const HandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try{
      const data = await Login(formData.email, formData.password);

    
      window.location.href = "/dashboard";
      
      
      // // Assuming the response contains token, name, and email
      login({
        token: data.token,
        name: data.name,
        email: data.email,
      });

      // login(data.token, data.name, data.email);


     


      





    } catch (error) {
      console.error("Login failed:", error);
    }

    // Handle form submission logic here
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-12 right-12 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <section className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-16">
        <div className="space-y-8">
         
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Sign in to manage landlords, tenants, and properties
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Your secure gateway to payments, maintenance, and communications across your management company. Log in
              with your work email to keep every team in sync.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {perks.map((perk) => (
              <div
                key={perk.title}
                className="group rounded-xl border border-border/70  p-4 shadow-none transition hover:-translate-y-[2px] hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <perk.icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-base font-medium text-foreground">{perk.title}</p>
                <p className="text-sm text-muted-foreground">{perk.desc}</p>
              </div>
            ))}
          </div>
{/* 
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/50 p-4 shadow-sm backdrop-blur">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <KeyRound className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">SSO + passwordless ready</p>
              <p className="text-sm text-muted-foreground">Enforce passkeys, SAML, or email-based magic links.</p>
            </div>
          </div> */}
        </div>

        <Card className="border-none shadow-none">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-2xl font-semibold">Log in</CardTitle>
              <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                Admin access
              </Badge>
            </div>
            <CardDescription>Sign in with your company credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-4" onSubmit={HandleSubmit}>
              <Button variant="outline" className="w-full justify-center gap-2" type="button">
                <Fingerprint className="h-4 w-4" />
                Sign in with fingerprint
              </Button>

              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[0.7rem]">or with email</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <InputGroup className="h-12 rounded-md bg-transparent shadow-none border border-gray-400"
                  onChange={handleChange}>
                  <InputGroupAddon>
                    <Mail className="h-4 w-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
                </InputGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <InputGroup className="h-12 rounded-md bg-transparent shadow-none border border-gray-400"
                  onChange={handleChange}>
                  <InputGroupAddon>
                    <Lock className="h-4 w-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showPassword ? "Hide" : "Show"}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <p className="text-xs text-muted-foreground">
                  At least 8 characters. SSO/MFA enforced for sensitive actions.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox id="remember" name="remember" />
                  <span>Keep me signed in</span>
                </label>
                <Button variant="link" className="h-auto px-0 text-sm" asChild>
                  <Link href="/reset-password">Forgot password?</Link>
                </Button>
              </div>
              <Button className="w-full" type="submit">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
