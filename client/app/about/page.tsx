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
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const highlights = [
  { value: "2025", label: "Founded" },
  { value: "1", label: "All-In-One Platform" },
  { value: "100%", label: "Verified Listings" },
  { value: "24/7", label: "Support" },
]

const values = [
  {
    icon: CheckCircle,
    title: "Convenience",
    description: "Everything you need in one place, from property search to trusted home services.",
  },
  {
    icon: Shield,
    title: "Transparency",
    description: "Clear pricing, verified listings, and honest communication at every step.",
  },
  {
    icon: Award,
    title: "Reliability",
    description: "Vetted providers, secure interactions, and consistent quality standards.",
  },
  {
    icon: Users,
    title: "Community Focused",
    description: "Built to support renters, landlords, and homeowners with practical tools.",
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
    description: "Every listing is reviewed for authenticity and accuracy.",
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
    description: "Property search and housing services were fragmented, manual, and difficult to trust.",
  },
  {
    title: "The Solution",
    description: "Manzilini was built as a centralized digital platform connecting listings, communication, and services.",
  },
  {
    title: "The Impact",
    description: "Users discover homes faster, manage listings better, and access vetted services in one place.",
  },
]

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-b from-background via-background to-card">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_560px]">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                About Us
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Building the future of <span className="text-primary">housing</span> in Kenya
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Manzilini is an integrated digital platform built for tenants, landlords, and homeowners — bringing verified property discovery, secure communication, and trusted home services into one practical experience.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="gap-2 rounded-xl">
                  <Link href="/properties">
                    Browse Properties
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-xl">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm"
                  >
                    <p className="text-xl font-bold tracking-tight text-foreground">{item.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 blur-2xl" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border shadow-2xl shadow-primary/10">
                <Image
                  src="/about.jpg"
                  alt="Modern residential towers representing Manzilini's vision for housing in Kenya"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 480px, 560px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
              </div>

              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-sm sm:flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Trusted by</p>
                  <p className="text-sm font-bold text-foreground">Renters & Landlords</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story / Journey */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Our Story
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              From Challenge to Impact
            </h2>
            <p className="mt-3 text-muted-foreground">
              Manzilini was built to solve real housing friction and make the full property journey more trusted and efficient.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
            {journey.map((item, index) => (
              <article
                key={item.title}
                className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
              >
                <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-card border-y border-border py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Mission & Vision
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Where We Are Going
            </h2>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            <div className="group rounded-2xl border border-border bg-background p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Our Mission</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                To provide an integrated digital platform where users can find properties, manage listings, and access essential housing services without the inefficiencies of manual workflows.
              </p>
            </div>

            <div className="group rounded-2xl border border-border bg-background p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Our Vision</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                To become Kenya&apos;s leading real estate and housing services ecosystem where finding a home and managing it is efficient, transparent, and dependable for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Our Values
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              The Principles That Guide Us
            </h2>
            <p className="mt-3 text-muted-foreground">
              How we build, operate, and support our users every day.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div
                  key={value.title}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
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

      {/* Services Ecosystem */}
      <section className="bg-card border-y border-border py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Services
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Complete Home Services Ecosystem
            </h2>
            <p className="mt-3 text-muted-foreground">
              Beyond rentals, we connect users with practical services delivered by vetted providers.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.title}
                  className="group rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
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

      {/* Commitments */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Commitments
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Our Commitment to You
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every decision we make is focused on trust, transparency, and a better user experience.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {commitments.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Ready to experience better real estate?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Start your search with verified listings, connect securely, and access trusted home services from one platform.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="gap-2 rounded-xl">
                <Link href="/properties">
                  Browse Properties
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-xl">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
