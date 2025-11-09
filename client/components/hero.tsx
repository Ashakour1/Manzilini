"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, CheckCircle2, Star } from "lucide-react"
import Image from "next/image"

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              New: Zero-fee listings this month
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Find your next{" "}
              <span className="text-primary">dream home</span>
            </h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Browse verified rentals, apartments, and homes. Message landlords directly and secure your place with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2">
                Explore listings
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Watch demo
              </Button>
            </div>
            
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">4.9/5</span> rating
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">10k+</span> listings
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">24/7</span> support
                </span>
              </div>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="relative">
            <div className="relative bg-background rounded-2xl h-80 md:h-[450px] border border-border overflow-hidden shadow-lg">
              <Image
                src="/modern-property-lifestyle.jpg"
                alt="Modern property lifestyle showcase"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            
            <div className="absolute -bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-64 rounded-xl border border-border bg-background p-4 shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Manzil Verified</p>
                  <p className="text-xs text-muted-foreground">Listings reviewed for quality and safety</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
