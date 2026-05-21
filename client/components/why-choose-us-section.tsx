"use client"

import {
  Shield,
  Key,
  Wallet,
  Home,
  CheckCircle2,
  ArrowRight,
  BadgeCheck,
  Headphones,
  Zap,
  Users,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const services = [
  {
    icon: Shield,
    title: "Verified Listings",
    description: "Every property is reviewed for authenticity and accuracy before going live.",
  },
  {
    icon: Wallet,
    title: "Flexible Payments",
    description: "Local & international payment options with secure rent collection.",
  },
  {
    icon: Key,
    title: "Mortgage Support",
    description: "Expert guidance to navigate financing and secure great rates.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Real humans ready to help — whenever you need a hand.",
  },
]

const stats = [
  { value: "47+", label: "Counties Covered", icon: BadgeCheck },
  { value: "4,300+", label: "Properties Listed", icon: Home },
  { value: "10K+", label: "Active Users", icon: Users },
  { value: "24/7", label: "Support", icon: Zap },
]

export default function WhyChooseUsSection() {
  return (
    <section className="relative py-20 md:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 xl:gap-20 items-center">
          {/* Left — Image with floating cards */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden bg-muted">
              <div className="relative h-[460px] md:h-[540px] w-full">
                <Image
                  src="/aerial_2.jpg"
                  alt="Modern Kenyan property"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
              </div>

              {/* Top-left verified pill */}
              <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                Verified Property
              </div>
            </div>

            {/* Floating "Rating" card */}
            <div className="absolute -left-4 bottom-10 hidden sm:block">
              <div className="rounded-2xl border border-border bg-card/95 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Trust Score</p>
                    <p className="text-lg font-bold tabular-nums text-foreground">98<span className="text-sm text-muted-foreground">/100</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating "Properties" card */}
            <div className="absolute -right-4 top-10 hidden sm:block">
              <div className="rounded-2xl border border-border bg-card/95 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Home className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Properties</p>
                    <p className="text-lg font-bold tabular-nums text-foreground">4,300+</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative blurs */}
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl -z-10" />
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl -z-10" />
          </div>

          {/* Right — Content */}
          <div>
            <div className="mb-5 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Why Manzilini
            </div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight mb-4">
              Everything you need, in one trusted place
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-8 max-w-lg">
              We connect tenants, landlords, and homeowners with verified properties and trusted services across Kenya — making every step simple, secure, and transparent.
            </p>

            {/* Features grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <div
                    key={index}
                    className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <Icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{service.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{service.description}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-8">
              <Link
                href="/about"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Learn more about us
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-border bg-card p-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold tracking-tight text-foreground tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
