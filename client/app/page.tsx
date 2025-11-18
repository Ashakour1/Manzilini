"use client"

import { useState } from "react"
import Header from "@/components/header"
import Hero from "@/components/hero"
import PropertyGrid from "@/components/property-grid"
import PropertyModal from "@/components/property-modal"
import ServicesSection from "@/components/services-section"
import Footer from "@/components/footer"
import HelpSection from "@/components/how-we-can-help"
import CitiesSection from "@/components/cities-section"
import WhyChooseUsSection from "@/components/why-choose-us-section"
import TestimonialsSection from "@/components/testimonials-section"
import ApartmentTypesSection from "@/components/apartment-types-section"
import CTASection from "@/components/cta-section"
import FeaturedHousesSection from "@/components/featured-houses-section"

export default function Home() {
  const [selectedProperty, setSelectedProperty] = useState(null)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <Hero />
        <FeaturedHousesSection />
        <HelpSection />
        <PropertyGrid onSelectProperty={setSelectedProperty} />
        <ApartmentTypesSection />
        <CitiesSection />
        <WhyChooseUsSection />
        <TestimonialsSection />
        <CTASection />
        {/* <ServicesSection /> */}
      </main>
      <Footer />
      {selectedProperty && <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
    </div>
  )
}
