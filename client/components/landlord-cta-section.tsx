"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Building2, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const perks = [
  "List unlimited properties",
  "Reach verified tenants",
  "Manage everything in one dashboard",
]

export default function LandlordCTASection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl  bg-card p-8 md:p-14">
          <div className="relative grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
            {/* Left: copy + CTAs */}
            <div>
              <div className="mb-5 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                For Landlords
              </div>

              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Own a property? Put it to work.
              </h2>

              <p className="mt-3 max-w-xl text-muted-foreground md:text-lg">
                Join hundreds of landlords using Manzilini to list properties, screen tenants, and grow their rental income — all from one dashboard.
              </p>

              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2 rounded-xl">
                  <Link href="https://manage.manzilini.com/signup">
                    Register as Landlord
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl">
                  <Link href="/contact">Talk to us</Link>
                </Button>
              </div>
            </div>

            {/* Right: stat tiles */}
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-sm shadow-xl shadow-primary/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Property Portfolio</p>
                    <p className="text-sm font-semibold text-foreground">Live performance</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-[11px] text-muted-foreground">Active Listings</p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-foreground">12</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-[11px] text-muted-foreground">Occupancy</p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-foreground">94%</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-[11px] text-muted-foreground">New Inquiries</p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-foreground">+38</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-[11px] text-muted-foreground">This Month</p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-foreground">KES 1.2M</p>
                  </div>
                </div>
              </div>

              {/* Floating chip */}
              <div className="absolute -bottom-4 -right-4 hidden rounded-2xl border border-border bg-card px-4 py-2.5 shadow-lg sm:flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <div>
                  <p className="text-[10px] text-muted-foreground">Trusted by</p>
                  <p className="text-xs font-bold text-foreground">500+ landlords</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
