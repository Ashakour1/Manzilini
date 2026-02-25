"use client"

import {
  ArrowRight,
  Award,
  Bug,
  CheckCircle,
  Globe,
  Heart,
  Key,
  Settings,
  Shield,
  Sparkles,
  Target,
  Truck,
  Users,
  Wrench,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const highlights = [
  { value: "2025", label: "Founded" },
  { value: "1 Platform", label: "All-In-One Experience" },
  { value: "Verified", label: "Property Listings" },
  { value: "24/7", label: "Support" },
]

const values = [
  {
    icon: CheckCircle,
    title: "Convenience",
    description:
      "Everything you need in one place, from property search to trusted home services.",
  },
  {
    icon: Shield,
    title: "Transparency",
    description:
      "Clear pricing, verified listings, and honest communication at every step.",
  },
  {
    icon: Award,
    title: "Reliability",
    description:
      "Vetted providers, secure interactions, and consistent quality standards.",
  },
  {
    icon: Users,
    title: "Community Focused",
    description:
      "Built to support renters, landlords, and homeowners with practical tools.",
  },
]

const services = [
  {
    icon: Truck,
    title: "House Moving",
    description: "Professional moving services for a smooth and stress-free relocation.",
  },
  {
    icon: Bug,
    title: "Fumigation",
    description: "Expert pest control to keep your property clean and protected.",
  },
  {
    icon: Sparkles,
    title: "Interior Design",
    description: "Design support to transform your space into a functional home.",
  },
  {
    icon: Settings,
    title: "House Management",
    description: "Property management support for landlords and homeowners.",
  },
  {
    icon: Wrench,
    title: "Installations",
    description: "Reliable installation services for appliances and fixtures.",
  },
  {
    icon: Key,
    title: "Airbnb Support",
    description: "Operational support to help hosts manage and scale listings.",
  },
]

const commitments = [
  {
    icon: Shield,
    title: "Verified Listings",
    description: "Every listing is reviewed for authenticity and listing accuracy.",
  },
  {
    icon: CheckCircle,
    title: "Transparent Pricing",
    description: "Clear fees and costs with no hidden surprises.",
  },
  {
    icon: Heart,
    title: "Reliable Support",
    description: "Fast, responsive support when users need help.",
  },
  {
    icon: Award,
    title: "Quality Standards",
    description: "We continuously improve service quality and user trust.",
  },
]

const journey = [
  {
    title: "The Problem",
    description:
      "Property search and housing services were fragmented, manual, and difficult to trust.",
  },
  {
    title: "The Solution",
    description:
      "Manzilini was built as a centralized digital platform connecting listings, communication, and services.",
  },
  {
    title: "The Impact",
    description:
      "Users can discover homes faster, manage listings better, and access vetted services in one place.",
  },
]

export default function About() {
  return (
    <>
      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-6 md:p-10">
            <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
              <div className="max-w-4xl">
                <div className="flex items-start gap-4 md:gap-5">
                  <div>
                    <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
                      About Manzilini
                    </h1>
                    <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                      Manzilini is an integrated digital platform built for tenants, landlords, and homeowners. We bring
                      verified property discovery, secure communication, and trusted home services into one practical
                      experience.
                    </p>
                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                      <Button size="lg" asChild className="gap-2">
                        <Link href="/properties">
                          Browse Properties
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild>
                        <Link href="/contact">Contact Us</Link>
                      </Button>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {highlights.map((item) => (
                        <div key={item.label} className="rounded-xl bg-background p-3">
                          <p className="text-sm font-bold text-foreground">{item.value}</p>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mx-auto w-full max-w-sm lg:max-w-none" aria-hidden="true">
                <svg
                  viewBox="0 0 320 360"
                  className="h-auto w-full text-primary"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18 332H302" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
                  <rect x="34" y="120" width="90" height="212" rx="8" stroke="currentColor" strokeWidth="4" opacity="0.9" />
                  <rect x="120" y="84" width="84" height="248" rx="8" stroke="currentColor" strokeWidth="4" opacity="0.95" />
                  <rect x="198" y="148" width="88" height="184" rx="8" stroke="currentColor" strokeWidth="4" opacity="0.8" />
                  <rect x="150" y="260" width="24" height="72" stroke="currentColor" strokeWidth="4" opacity="0.95" />
                  <g opacity="0.65" fill="currentColor">
                    <rect x="52" y="142" width="14" height="14" rx="2" />
                    <rect x="80" y="142" width="14" height="14" rx="2" />
                    <rect x="52" y="170" width="14" height="14" rx="2" />
                    <rect x="80" y="170" width="14" height="14" rx="2" />
                    <rect x="52" y="198" width="14" height="14" rx="2" />
                    <rect x="80" y="198" width="14" height="14" rx="2" />
                    <rect x="138" y="108" width="14" height="14" rx="2" />
                    <rect x="164" y="108" width="14" height="14" rx="2" />
                    <rect x="138" y="136" width="14" height="14" rx="2" />
                    <rect x="164" y="136" width="14" height="14" rx="2" />
                    <rect x="138" y="164" width="14" height="14" rx="2" />
                    <rect x="164" y="164" width="14" height="14" rx="2" />
                    <rect x="138" y="192" width="14" height="14" rx="2" />
                    <rect x="164" y="192" width="14" height="14" rx="2" />
                    <rect x="138" y="220" width="14" height="14" rx="2" />
                    <rect x="164" y="220" width="14" height="14" rx="2" />
                    <rect x="218" y="168" width="14" height="14" rx="2" />
                    <rect x="246" y="168" width="14" height="14" rx="2" />
                    <rect x="218" y="196" width="14" height="14" rx="2" />
                    <rect x="246" y="196" width="14" height="14" rx="2" />
                    <rect x="218" y="224" width="14" height="14" rx="2" />
                    <rect x="246" y="224" width="14" height="14" rx="2" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Our Story
            </span>
            <h2 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">From Challenge to Impact</h2>
            <p className="mt-3 text-muted-foreground">
              Manzilini was built to solve real housing friction and make the full property journey more trusted and efficient.
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="relative pl-8 sm:pl-12">
              <div className="absolute  left-2 top-2 w-px bg-border sm:left-4" />
              <div className="space-y-4 md:space-y-5">
                {journey.map((item, index) => (
                  <article
                    key={item.title}
                    className="relative pl-6 sm:pl-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-4 motion-safe:duration-700"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <span className="absolute -left-0.5 top-4 inline-flex h-6 w-6 items-center justify-center rounded-full border border-primary/20 bg-primary/15 text-xs font-semibold text-primary sm:-left-1">
                      {index + 1}
                    </span>
                    <div className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
                      <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Mission & Vision
            </span>
            <h2 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">Where We Are Going</h2>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-6 motion-safe:duration-700 motion-safe:delay-100">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Our Mission</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  To provide an integrated digital platform where users can find properties, manage listings, and
                  access essential housing services without the inefficiencies of manual workflows.
                </p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-6 motion-safe:duration-700 motion-safe:delay-200">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  To become Kenya's leading real estate and housing services ecosystem where finding a home and
                  managing it is efficient, transparent, and dependable for everyone.
                </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Our Core Values</h2>
            <p className="mt-3 text-muted-foreground">
              The principles that guide how we build, operate, and support our users.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div
                  key={value.title}
                  className="rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Complete Home Services Ecosystem</h2>
            <p className="mt-3 text-muted-foreground">
              Beyond rentals, we connect users with practical services delivered by vetted providers.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.title}
                  className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/40"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-card py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-card p-8 md:p-12">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Our Commitment to You</h2>
              <p className="mt-3 text-muted-foreground">
                Every decision we make is focused on trust, transparency, and a better user experience.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {commitments.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="rounded-2xl border border-border bg-card p-6">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-primary/5 p-10 text-center md:p-14">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Ready to Experience Better Real Estate?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Start your search with verified listings, connect securely, and access trusted home services from one platform.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link href="/properties">
                  Browse Properties
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
