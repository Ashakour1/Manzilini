"use client"

import { Home, UserCheck, Shield, MapPin, Heart, Zap } from "lucide-react"

const services = [
  {
    icon: Home,
    title: "Wide Property Selection",
    description: "Browse thousands of properties across different cities and neighborhoods.",
  },
  {
    icon: UserCheck,
    title: "Verified Landlords",
    description: "All landlords are verified for authenticity and credibility.",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Protected messaging and secure payment options for peace of mind.",
  },
  {
    icon: MapPin,
    title: "Location Insights",
    description: "Get detailed neighborhood information and commute times.",
  },
  {
    icon: Heart,
    title: "Save Favorites",
    description: "Bookmark properties and compare your top choices.",
  },
  {
    icon: Zap,
    title: "Quick Applications",
    description: "Apply to properties with a single click using your profile.",
  },
]

export default function ServicesSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Manzilini?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're committed to making property hunting simple, secure, and successful.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div
                key={index}
                className="p-8 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
