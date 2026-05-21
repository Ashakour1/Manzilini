"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  LayoutDashboard,
  BarChart3,
  Bell,
  Users,
  CreditCard,
  CheckCircle2,
  TrendingUp,
} from "lucide-react"

const features = [
  {
    icon: LayoutDashboard,
    title: "Unified Dashboard",
    description: "Properties, tenants, and income — all in one place.",
  },
  {
    icon: Users,
    title: "Tenant Management",
    description: "Screen applicants, manage leases, and chat with tenants.",
  },
  {
    icon: CreditCard,
    title: "Automated Rent Collection",
    description: "Reminders, M-Pesa & card payments, real-time tracking.",
  },
  {
    icon: BarChart3,
    title: "Financial Reports",
    description: "Income, expenses, and occupancy insights per property.",
  },
]

const trust = [
  "Cancel anytime",
  "Built for Kenya",
  "Free to start",
]

export default function ManagementSystemSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 bg-background">
      {/* Soft background tint */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-1/4 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] xl:gap-20">
          {/* Left — Text content */}
          <div>
            <span className="mb-5 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              For Landlords
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Run your rental business
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                like a pro.
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-muted-foreground leading-relaxed md:text-lg">
              List properties, screen tenants, automate rent collection, and grow your portfolio — all from one powerful dashboard.
            </p>

            {/* Features */}
            <div className="mt-8 space-y-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTAs */}
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2 rounded-xl">
                <Link href="https://manage.manzilini.com/signup">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl">
                <Link href="https://manage.manzilini.com/login">Sign in</Link>
              </Button>
            </div>

            {/* Trust signals */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5">
              {trust.map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Dashboard mockup */}
          <div className="relative">
            {/* Outer glow card frame */}
            <div className="relative rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/40 p-3 md:p-4">
              {/* Browser window */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
                {/* Title bar */}
                <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="flex flex-1 justify-center">
                    <div className="flex w-full max-w-[240px] items-center gap-1.5 rounded-md border border-border bg-background/80 px-3 py-1">
                      <div className="flex h-3 w-3 items-center justify-center rounded-full border border-green-500">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      </div>
                      <span className="truncate text-[10px] text-muted-foreground">
                        manage.manzilini.com
                      </span>
                    </div>
                  </div>
                  <div className="w-[52px]" />
                </div>
                {/* Screenshot */}
                <div className="relative aspect-[16/10] w-full bg-white">
                  <Image
                    src="/property-manage.png"
                    alt="Manzilini Property Management Dashboard"
                    fill
                    className="object-cover object-left-top"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Floating "Revenue trend" card */}
            <div className="absolute -bottom-5 -left-2 z-10 hidden w-52 rounded-2xl border border-border bg-card p-3.5 sm:block">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Monthly Revenue
                </p>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-2.5 w-2.5" />
                  +12%
                </span>
              </div>
              <p className="mt-1 text-lg font-bold tabular-nums text-foreground">KES 2.4M</p>
              {/* Mini sparkline */}
              <div className="mt-2 flex h-7 items-end gap-0.5">
                {[40, 55, 35, 70, 50, 80, 65, 95, 75, 100].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`flex-1 rounded-sm ${
                      i === 9 ? "bg-primary" : "bg-primary/30"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Floating "Active tenants" card */}
            <div className="absolute -top-5 -right-2 z-10 hidden flex-col rounded-2xl border border-border bg-card px-4 py-3 sm:flex">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/40">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Active Tenants
                  </p>
                  <p className="text-sm font-bold tabular-nums text-foreground">1,200+</p>
                </div>
              </div>
              {/* Avatar stack */}
              <div className="mt-2.5 flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  {["bg-rose-400", "bg-amber-400", "bg-emerald-400", "bg-violet-400"].map((c) => (
                    <span
                      key={c}
                      className={`h-5 w-5 rounded-full ring-2 ring-card ${c}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">+1.2K active</span>
              </div>
            </div>

            {/* Floating "New notification" toast */}
            <div className="absolute right-6 top-1/3 z-10 hidden items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2 md:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Bell className="h-3.5 w-3.5 text-primary" />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-foreground leading-tight">
                  New application
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">2 min ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
