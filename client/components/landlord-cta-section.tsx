"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Building2 } from "lucide-react"
import Link from "next/link"

export default function LandlordCTASection() {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-5">
            <Building2 className="w-6 h-6 text-primary" />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Are You a Property Owner?
          </h2>

          <p className="text-muted-foreground mb-8">
            Join hundreds of landlords who trust Manzilini. List your properties and reach thousands of potential renters.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="https://manage.manzilini.com/signup">
                Register as Landlord
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
