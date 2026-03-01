"use client"

import { Shield, Key, Wallet, Home, Award, CheckCircle, Phone, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const services = [
  {
    icon: Shield,
    title: "Property Management",
    description:
      "Comprehensive management solutions to help landlords efficiently handle tenants, maintenance, and investments.",
  },
  {
    icon: Key,
    title: "Mortgage Services",
    description:
      "Expert guidance for property financing — navigate applications and secure the best rates for your purchase.",
  },
  {
    icon: Wallet,
    title: "Flexible Payments",
    description:
      "Seamless payment solutions and currency conversion for local and international property transactions.",
  },
]

const stats = [
  { value: "47+", label: "Counties Covered", icon: Award },
  { value: "24/7", label: "Available Support", icon: CheckCircle },
  { value: "100%", label: "Trusted Platform", icon: Phone },
]

export default function WhyChooseUsSection() {
  return (
    <section className="py-20 md:py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 xl:gap-20 items-center mb-20">
          {/* Left — Image with overlay */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden bg-muted">
              <div className="relative h-[460px] md:h-[520px] w-full">
                <Image
                  src="/aerial_2.jpg"
                  alt="Modern house"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              </div>

              {/* Floating stat card */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between bg-background/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Home className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Properties Listed</p>
                    <p className="text-lg font-bold text-foreground tabular-nums">4,382+</p>
                  </div>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Verified Listings</p>
                    <p className="text-lg font-bold text-foreground">100%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative blur */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />
          </div>

          {/* Right — Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-5">
              Why Manzilini
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight mb-4">
              Everything You Need in One Platform
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-10 max-w-lg">
              We connect tenants, landlords, and homeowners with verified properties and trusted services across Kenya — making every step simple and transparent.
            </p>

            <div className="space-y-6">
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <div
                    key={index}
                    className="group flex gap-4 p-4 -mx-4 rounded-2xl hover:bg-muted/60 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center flex-shrink-0 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-1">{service.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-10">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Learn more about us
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid sm:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="relative flex items-center gap-4 p-6 rounded-2xl border border-border bg-card overflow-hidden group hover:border-primary/30 transition-colors"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-foreground tabular-nums">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
