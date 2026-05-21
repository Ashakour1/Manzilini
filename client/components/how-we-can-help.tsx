"use client"

import Link from "next/link"
import { ArrowRight, Home, HousePlus, KeyRound, type LucideIcon } from "lucide-react"

interface HelpItem {
  title: string
  description: string
  cta: string
  href: string
  icon: LucideIcon
}

const items: HelpItem[] = [
  {
    title: "Buy a property",
    description: "Browse verified listings and connect with sellers you can trust.",
    cta: "Find a home",
    href: "/properties?status=for-sale",
    icon: Home,
  },
  {
    title: "Sell a property",
    description: "Reach thousands of buyers and manage every lead in one dashboard.",
    cta: "List your property",
    href: "https://manage.manzilini.com/signup",
    icon: HousePlus,
  },
  {
    title: "Rent a property",
    description: "Discover rentals that match your budget, lifestyle, and location.",
    cta: "Find a rental",
    href: "/properties?status=for-rent",
    icon: KeyRound,
  },
]

export default function HelpSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            How we help
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            See how Manzilini can help
          </h2>
          <p className="mt-3 text-muted-foreground">
            Whether you&apos;re buying, selling, or renting — we make every step simple, secure, and transparent.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item, idx) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative flex flex-col rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
              >
                {/* Step number */}
                <span className="absolute right-6 top-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                  0{idx + 1}
                </span>

                {/* Icon */}
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                {/* Title + description */}
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                {/* CTA link */}
                <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {item.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
