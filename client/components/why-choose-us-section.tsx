"use client"

import { Shield, Key, Wallet, Home, Award, CheckCircle, Smile } from "lucide-react"
import Image from "next/image"

const services = [
  {
    icon: Shield,
    title: "Property Management",
    description: "Nullam sollicitudin blandit eros eu pretium. Nullam maximus ultricies auctor.",
  },
  {
    icon: Key,
    title: "Mortgage Services",
    description: "Nullam sollicitudin blandit eros eu pretium. Nullam maximus ultricies auctor.",
  },
  {
    icon: Wallet,
    title: "Currency Services",
    description: "Nullam sollicitudin blandit eros eu pretium. Nullam maximus ultricies auctor.",
  },
]

const stats = [
  { value: "4M", label: "Award Winning", icon: Award },
  { value: "18K", label: "Property Ready", icon: CheckCircle },
  { value: "23M", label: "Happy Customer", icon: Smile },
]

export default function WhyChooseUsSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left Section - House Image */}
          <div className="relative rounded-2xl overflow-hidden bg-card border border-border">
            <div className="relative h-[500px] w-full">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
                alt="Modern house"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Overlay Card */}
              <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-sm rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Home className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-white/70 mb-1">Total Rent</p>
                    <p className="text-lg font-semibold">4,382 Unit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Why Choose Us */}
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              As the complexity of buildings to increase, the field of architecture.
            </p>

            <div className="space-y-6">
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{service.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Statistics Bar */}
        <div className="grid md:grid-cols-3 gap-8 pt-12 border-t border-border">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                  <p className="text-4xl md:text-5xl font-bold text-foreground">{stat.value}</p>
                </div>
                <p className="text-muted-foreground text-lg">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

