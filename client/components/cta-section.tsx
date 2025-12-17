"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Home, Phone, Mail } from "lucide-react"
import Link from "next/link"

export default function CTASection() {
  return (
    <section className="relative py-20 md:py-28 bg-primary text-primary-foreground overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0"/>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-foreground/10 mb-6">
            <Home className="w-8 h-8 text-primary-foreground" />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Ready to Find Your Perfect Property?
          </h2>
          
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their dream home with Manzilini. Start your property search today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="gap-2 text-lg px-8 py-6"
            >
              <Link href="/properties">
                Browse Properties
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground bg-primary-foreground/10"
            >
              <Link href="/contact">
                Contact Us
                <Phone className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span className="text-sm md:text-base">+254 700 000 000</span>
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

