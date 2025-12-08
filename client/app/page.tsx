"use client"

import { useState } from "react"
import Hero from "@/components/hero"
import PropertyGrid from "@/components/property-grid"
import PropertyModal from "@/components/property-modal"
import ServicesSection from "@/components/services-section"
import HelpSection from "@/components/how-we-can-help"
import WhyChooseUsSection from "@/components/why-choose-us-section"
import TestimonialsSection from "@/components/testimonials-section"
import ApartmentTypesSection from "@/components/apartment-types-section"
import CTASection from "@/components/cta-section"
import FeaturedHousesSection from "@/components/featured-houses-section"

export default function Home() {
  const [selectedProperty, setSelectedProperty] = useState(null)

  return (
    <>
      <Hero />
      <FeaturedHousesSection />
      <HelpSection />
      <PropertyGrid onSelectProperty={setSelectedProperty} />
      <ApartmentTypesSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <CTASection />
      {/* <ServicesSection /> */}
      {selectedProperty && <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
    </>
  )
}
