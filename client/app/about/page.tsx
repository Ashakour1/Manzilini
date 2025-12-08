"use client"

import { CheckCircle, Users, Lightbulb, Globe, Home, Shield, TrendingUp } from "lucide-react"
import Image from "next/image"

export default function About() {
  const values = [
    {
      icon: Users,
      title: "Community Focused",
      description: "Building a trustworthy community of renters and landlords across Kenya.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Constantly improving our platform with new features and technology.",
    },
    {
      icon: Globe,
      title: "Local Expertise",
      description: "Deep understanding of Kenyan real estate market and local needs.",
    },
    {
      icon: CheckCircle,
      title: "Trust & Safety",
      description: "Security and verification are at the heart of everything we do.",
    },
  ]

  const stats = [
    { icon: Home, value: "10,000+", label: "Properties Listed" },
    { icon: Users, value: "50,000+", label: "Active Users" },
    { icon: Shield, value: "98%", label: "Satisfaction Rate" },
    { icon: TrendingUp, value: "25+", label: "Cities Covered" },
  ]

  return (
    <>
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">About Manzilline</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                We're revolutionizing how people find and rent properties in Kenya. Our mission is to make property
                hunting accessible, transparent, and secure for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stat.value}</p>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Founded in 2023, Manzilline started with a simple vision: make finding rental properties easier and
                  safer for everyone in Kenya. What began as a small project has grown into a platform trusted by over
                  50,000 users across the country.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  We believe that everyone deserves access to quality housing information and verified landlords. That's
                  why we're dedicated to creating a platform that's transparent, secure, and user-friendly.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  From Nairobi to Mombasa, Kisumu to Nakuru, we're connecting renters with their perfect homes and
                  helping landlords find reliable tenants.
                </p>
              </div>
              <div className="relative bg-primary/10 rounded-xl h-96 border border-border overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop"
                  alt="Manzilline team"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <div
                    key={index}
                    className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
    </>
  )
}
