"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  LayoutDashboard,
  FileText,
  BarChart3,
  Bell,
  Users,
  CreditCard,
} from "lucide-react"

const features = [
  {
    icon: LayoutDashboard,
    title: "Intuitive Dashboard",
    description: "Get a complete overview of your properties, tenants, and income at a glance.",
  },
  {
    icon: Users,
    title: "Tenant Management",
    description: "Screen applicants, manage leases, and communicate with tenants seamlessly.",
  },
  {
    icon: CreditCard,
    title: "Rent Collection",
    description: "Automate rent reminders and track payments with real-time updates.",
  },
  {
    icon: FileText,
    title: "Property Tracking",
    description: "Track your properties and tenants with ease.",
  },
  {
    icon: BarChart3,
    title: "Financial Reports",
    description: "Detailed income, expense, and occupancy reports for every property.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Stay updated with instant alerts for applications, payments, and maintenance.",
  },
]

export default function ManagementSystemSection() {
  return (
    <section className="py-20 md:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 xl:gap-20 items-center">
          {/* Left — Text content */}
          <div>
            {/* <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-5">
              <LayoutDashboard className="w-3.5 h-3.5" />
              For Landlords
            </div> */}

            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight mb-4">
              A Powerful Property Management System
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-10 max-w-lg">
              Manage your entire rental business from one place. Our landlord dashboard gives you the tools to list properties, track tenants, collect rent, and grow your portfolio — all with zero hassle.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="group flex gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground mb-0.5">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl gap-2 shadow-md">
                <Link href="https://manage.manzilini.com/signup">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl gap-2">
                <Link href="https://manage.manzilini.com/login">
                  Login to Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Right — Dashboard image */}
          <div className="relative pt-6 pb-8 px-4">
            {/* Browser window frame */}
            <div className="relative rounded-xl overflow-hidden border border-border/80 shadow-2xl shadow-primary/10 bg-card">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/60">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-1.5 bg-background/80 border border-border rounded-md px-3 py-1 max-w-[220px] w-full">
                    <div className="w-3 h-3 rounded-full border border-green-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate">manage.manzilini.com</span>
                  </div>
                </div>
                <div className="w-[52px]" />
              </div>
              {/* Screenshot */}
              <div className="relative aspect-[16/9] w-full bg-white">
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

            {/* Floating accent cards */}
            <div className="absolute bottom-0 left-0 bg-card border border-border rounded-xl p-3 shadow-lg flex items-center gap-3 z-10">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Monthly Revenue</p>
                <p className="text-sm font-bold text-foreground tabular-nums">KES 2.4M+</p>
              </div>
            </div>

            <div className="absolute top-0 right-0 bg-card border border-border rounded-xl p-3 shadow-lg flex items-center gap-3 z-10">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Active Tenants</p>
                <p className="text-sm font-bold text-foreground tabular-nums">1,200+</p>
              </div>
            </div>

            {/* Decorative blur */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}
