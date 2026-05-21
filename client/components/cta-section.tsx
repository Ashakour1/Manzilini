"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Phone, Mail } from "lucide-react"
import Link from "next/link"

export default function CTASection() {
  return (
    <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Ready to find your perfect property?
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8">
            Join thousands of users who found their next home with Manzilini. Browse verified listings or get in touch with our team today.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <Button asChild size="lg" className="gap-2 rounded-xl">
              <Link href="/properties">
                Browse Properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-muted-foreground">
            <a
              href="tel:+254118723979"
              className="inline-flex items-center gap-2 text-sm transition-colors hover:text-primary"
            >
              <Phone className="h-4 w-4 text-primary" />
              +254 118 723 979
            </a>
            <a
              href="mailto:info@manzilini.com"
              className="inline-flex items-center gap-2 text-sm transition-colors hover:text-primary"
            >
              <Mail className="h-4 w-4 text-primary" />
              info@manzilini.com
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
