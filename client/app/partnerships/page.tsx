"use client"

import {
  Handshake,
  Building2,
  TrendingUp,
  Users,
  Award,
  Target,
  CheckCircle,
  ArrowRight,
  Globe,
  Shield,
  Heart,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const benefits = [
  {
    icon: TrendingUp,
    title: "Increased Visibility",
    description: "Reach thousands of active users searching for properties and home services. Get your brand in front of the right audience.",
  },
  {
    icon: Users,
    title: "Quality Leads",
    description: "Connect with verified tenants, landlords, and homeowners who are actively engaged in the real estate market.",
  },
  {
    icon: Award,
    title: "Brand Credibility",
    description: "Partner with Kenya's leading integrated real estate platform and enhance your brand's reputation.",
  },
  {
    icon: Building2,
    title: "Business Growth",
    description: "Scale your business with our platform tools, analytics, and marketing support to drive sustainable growth.",
  },
]

const partnershipTypes = [
  {
    icon: Building2,
    title: "Property Developers",
    description: "Showcase your new developments and reach potential buyers and renters through verified listings.",
    features: [
      "Featured property listings",
      "Virtual tour integration",
      "Lead generation tools",
      "Marketing support",
    ],
  },
  {
    icon: Handshake,
    title: "Service Providers",
    description: "Join our ecosystem of vetted home service providers and connect with homeowners who need your expertise.",
    features: [
      "Service provider profile",
      "Direct booking system",
      "Customer reviews",
      "Payment processing",
    ],
  },
  {
    icon: Globe,
    title: "Real Estate Agencies",
    description: "Expand your reach and manage multiple properties efficiently with our property management tools.",
    features: [
      "Bulk listing management",
      "Tenant screening tools",
      "Analytics dashboard",
      "Priority support",
    ],
  },
]

const whyPartner = [
  {
    icon: Shield,
    title: "Verified Network",
    description: "Join a trusted network of verified partners. We ensure quality and reliability across all our partnerships.",
  },
  {
    icon: CheckCircle,
    title: "Dedicated Support",
    description: "Get dedicated account management and support to help you maximize your partnership benefits.",
  },
  {
    icon: Target,
    title: "Data-Driven Insights",
    description: "Access analytics and insights to understand your audience and optimize your partnership strategy.",
  },
  {
    icon: Heart,
    title: "Community Impact",
    description: "Be part of transforming Kenya's real estate sector and improving living standards across the country.",
  },
]

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "500+", label: "Listed Properties" },
  { value: "50+", label: "Service Partners" },
  { value: "24/7", label: "Partner Support" },
]

export default function Partnerships() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-b from-background via-background to-card">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Partnerships
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Grow Your Business with <span className="text-primary">Manzilini</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Join forces with Kenya&apos;s leading integrated real estate platform. Whether you&apos;re a developer, service provider, or agency — we have a partnership built for your growth.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
              <Button size="lg" asChild className="gap-2 rounded-xl">
                <Link href="/contact">
                  Become a Partner
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-xl">
                <Link href="#partnership-types">Explore Programs</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm"
                >
                  <p className="text-xl font-bold tracking-tight text-foreground">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Benefits
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Why Partner With Us
            </h2>
            <p className="mt-3 text-muted-foreground">
              Partnering with Manzilini opens doors to new opportunities, increased visibility, and sustainable business growth.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div
                  key={index}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section id="partnership-types" className="py-20 md:py-28 bg-card border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Programs
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Partnership Opportunities
            </h2>
            <p className="mt-3 text-muted-foreground">
              Tailored partnership programs designed to fit different types of businesses.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {partnershipTypes.map((type, index) => {
              const Icon = type.icon
              return (
                <div
                  key={index}
                  className="group relative rounded-2xl border border-border bg-background p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">{type.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{type.description}</p>

                  <ul className="space-y-2.5 border-t border-border pt-5">
                    {type.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button asChild variant="ghost" size="sm" className="mt-5 -ml-2 gap-1 text-primary hover:text-primary">
                    <Link href="/contact">
                      Apply now
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Partner */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              The Manzilini Difference
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              What Makes Our Partnerships Special
            </h2>
            <p className="mt-3 text-muted-foreground">
              We&apos;re committed to building long-term, mutually beneficial partnerships that drive real success.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {whyPartner.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={index}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              Ready to partner with us?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join our growing network of partners and take your business to the next level. Let&apos;s discuss how we can build something great together.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <Button size="lg" asChild className="gap-2 rounded-xl">
                <Link href="/contact">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-xl">
                <Link href="/about">Learn About Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
