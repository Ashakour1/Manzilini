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
import LandlordCTASection from "@/components/landlord-cta-section"
import FeaturedHousesSection from "@/components/featured-houses-section"
import ManagementSystemSection from "@/components/management-system-section"

export default function Home() {
  const [selectedProperty, setSelectedProperty] = useState(null)

  return (
    <>
      <Hero />
      <FeaturedHousesSection />
      <HelpSection />
      <ManagementSystemSection />
      <WhyChooseUsSection />
      <PropertyGrid onSelectProperty={setSelectedProperty} />
      <LandlordCTASection />
      <ApartmentTypesSection />
      <CTASection />
   

      {/* <TestimonialsSection /> */}
    
     
      {/* <ServicesSection /> */}
      {selectedProperty && <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
    </>
  )
}
