"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Building2, Phone, Mail, Users, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"

export default function LandlordCTASection() {
  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Building2 className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Are You a Property Owner?
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of landlords who trust Manzilini to help them find quality tenants and grow their property business. List your properties today and reach thousands of potential renters.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-xl bg-card border border-border text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Reach More Tenants</h3>
              <p className="text-sm text-muted-foreground">
                Connect with thousands of active property seekers looking for their next home
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Grow Your Business</h3>
              <p className="text-sm text-muted-foreground">
                Expand your property portfolio and maximize your rental income with our platform
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Easy Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage all your properties in one place with our intuitive dashboard
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              asChild
              size="lg"
              className="gap-2 text-lg px-8 py-6 bg-primary hover:bg-primary/90"
            >
              <Link href="/landlords/register">
                Register as Landlord
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 text-lg px-8 py-6"
            >
              <Link href="/contact">
                Learn More
                <Phone className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span className="text-sm md:text-base">+254118723979</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <span className="text-sm md:text-base">info@manzilini.com</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
