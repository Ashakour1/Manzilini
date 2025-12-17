"use client"

import { Handshake, Building2, TrendingUp, Users, Award, Target, CheckCircle, ArrowRight, Globe, Shield, Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Partnerships() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Increased Visibility",
      description: "Reach thousands of active users searching for properties and home services. Get your brand in front of the right audience at the right time.",
    },
    {
      icon: Users,
      title: "Access to Quality Leads",
      description: "Connect with verified tenants, landlords, and homeowners who are actively engaged in the real estate market.",
    },
    {
      icon: Award,
      title: "Brand Credibility",
      description: "Partner with Kenya's leading integrated real estate platform and enhance your brand's reputation and trustworthiness.",
    },
    {
      icon: Building2,
      title: "Business Growth",
      description: "Scale your business with our comprehensive platform tools, analytics, and marketing support to drive sustainable growth.",
    },
  ]

  const partnershipTypes = [
    {
      icon: Building2,
      title: "Property Developers",
      description: "Showcase your new developments and reach potential buyers and renters through our verified property listings.",
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
      description: "Expand your reach and manage multiple properties efficiently with our comprehensive property management tools.",
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

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className=" text-start">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">Partnerships</h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-4">
              Grow Your Business with Manzilini
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Join forces with Kenya's leading integrated real estate platform. Whether you're a property developer, 
              service provider, or real estate agency, we offer opportunities to expand your reach 
              and grow your business.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="gap-2">
                <Link href="/contact">
                  Become a Partner
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#partnership-types">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Why Partner With Us</h2>
          <p className="text-muted-foreground mb-12 max-w-3xl leading-relaxed text-lg">
            Partnering with Manzilini opens doors to new opportunities, increased visibility, and sustainable business growth. 
            Here's what you can expect from our partnership program.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={index}
                    className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                )
              })}
          </div>
        </div>
      </section>

      {/* Partnership Types Section */}
      <section id="partnership-types" className="py-20 md:py-28 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Partnership Opportunities</h2>
          <p className="text-muted-foreground mb-12 max-w-3xl leading-relaxed text-lg">
            We offer various partnership programs tailored to different types of businesses. Find the right partnership 
            opportunity for your organization.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
              {partnershipTypes.map((type, index) => {
                const Icon = type.icon
                return (
                  <div
                    key={index}
                    className="p-8 rounded-xl border border-border bg-background hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">{type.title}</h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{type.description}</p>
                    <div className="space-y-3">
                      {type.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </section>

      {/* Why Partner Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">What Makes Our Partnerships Special</h2>
          <p className="text-muted-foreground mb-12 max-w-3xl leading-relaxed text-lg">
            We're committed to building long-term, mutually beneficial partnerships that drive success for both parties.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyPartner.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={index}
                    className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                )
              })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Partner With Us?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join our growing network of partners and take your business to the next level. Let's discuss how we can 
              create a successful partnership together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link href="/contact">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">
                  Learn More About Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
