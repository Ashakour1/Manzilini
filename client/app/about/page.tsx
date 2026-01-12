"use client"

import { CheckCircle, Users, Lightbulb, Globe, Shield, Target, Heart, Award, ArrowRight, Wrench, Sparkles, Bug, Truck, Paintbrush, Settings, Key } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function About() {
  const values = [
    {
      icon: CheckCircle,
      title: "Convenience",
      description: "Everything you need in one place. From property search to home services, we eliminate the need to juggle multiple platforms and manual processes.",
    },
    {
      icon: Shield,
      title: "Transparency",
      description: "Clear pricing, verified listings, and honest communication. We believe in complete transparency at every step of your property journey.",
    },
    {
      icon: Award,
      title: "Reliability",
      description: "Vetted service providers, verified properties, and secure communication. You can trust us to deliver quality services every time.",
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "Building a trustworthy community of tenants, landlords, and homeowners across Kenya. We foster connections that go beyond transactions.",
    },
  ]

  const services = [
    {
      icon: Truck,
      title: "House Moving",
      description: "Professional moving services to help you relocate smoothly and safely.",
    },
    {
      icon: Bug,
      title: "Fumigation",
      description: "Expert pest control services to keep your home clean and pest-free.",
    },
    {
      icon: Sparkles,
      title: "Interior Design",
      description: "Transform your space with professional interior design services.",
    },
    {
      icon: Settings,
      title: "House Management",
      description: "Comprehensive property management solutions for landlords and homeowners.",
    },
    {
      icon: Wrench,
      title: "Installations",
      description: "Professional installation services for appliances, fixtures, and more.",
    },
    {
      icon: Key,
      title: "Airbnb Support",
      description: "Complete support services to help you manage and optimize your Airbnb listings.",
    },
  ]

  const commitments = [
    {
      icon: Shield,
      title: "Verified Listings",
      description: "Every property on our platform is verified for authenticity. We conduct thorough checks to ensure listings are legitimate and accurately represented.",
    },
    {
      icon: CheckCircle,
      title: "Transparent Pricing",
      description: "No hidden fees, no surprises. We believe in complete transparency when it comes to pricing, so you know exactly what you're paying for.",
    },
    {
      icon: Heart,
      title: "24/7 Support",
      description: "Our dedicated support team is available around the clock to assist you with any questions or concerns. Your peace of mind is our priority.",
    },
    {
      icon: Award,
      title: "Quality Guarantee",
      description: "We stand behind the quality of our listings. If something doesn't match our standards, we'll work to make it right.",
    },
  ]

  return (
    <>
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className=" text-start">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">About Manzilini</h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-4 max-w-5xl">
                An integrated digital platform designed to address the challenges faced by tenants, landlords, and homeowners 
                in the real estate and housing services market.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                Manzilini provides a centralized solution where users can search for rental properties, manage listings, 
                communicate securely, and access a wide range of home-related services without the limitations of traditional, 
                manual processes. Through our mobile and web-based applications, we enable tenants to explore verified property 
                listings remotely while allowing landlords to efficiently advertise and manage their properties.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Our Story</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed text-lg">
                  Founded in 2025, Manzilini was created to address the real challenges faced by tenants, landlords, 
                  and homeowners in Kenya's real estate market. We recognized that the traditional property search and 
                  housing services process was fragmented, time-consuming, and often unreliable.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Many renters struggled with unverified listings, hidden fees, and lack of transparency. Landlords found 
                  it challenging to reach genuine tenants and manage their properties efficiently. Homeowners needed reliable 
                  access to quality home services but had to navigate multiple platforms and service providers.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Manzilini is built on the principles of convenience, transparency, and reliability. By leveraging 
                  modern technology and a user-centered design approach, we've created an integrated platform that brings 
                  together property search, listing management, secure communication, and a comprehensive ecosystem of 
                  home-related services.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Beyond property rentals, our platform offers essential services including house moving, fumigation, 
                  interior design, house management, installations, and Airbnb support—all delivered by vetted service 
                  providers. Our goal is to improve living standards, reduce inefficiencies in the housing process, 
                  and contribute to the digital transformation of the real estate sector in Kenya.
                </p>
              </div>
              <div className="relative bg-primary/10 rounded-xl h-96 md:h-[500px] border border-border overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop"
                  alt="Manzilini team"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="grid md:grid-cols-2 gap-8 mb-20">
              <div className="p-8 rounded-xl border border-border bg-card">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To provide an integrated digital platform that addresses the challenges faced by tenants, landlords, and 
                  homeowners in Kenya's real estate market. We aim to create a centralized solution where users can search 
                  for rental properties, manage listings, communicate securely, and access a wide range of home-related 
                  services—all without the limitations of traditional, manual processes.
                </p>
              </div>
              <div className="p-8 rounded-xl border border-border bg-card">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To become Kenya's leading integrated real estate and housing services platform, where finding a home 
                  and accessing quality home services is seamless and efficient. We envision a future where technology 
                  improves living standards, reduces inefficiencies in the housing process, and contributes to the digital 
                  transformation of the real estate sector—making quality housing and services accessible to everyone.
                </p>
              </div>
            </div>

            {/* Core Values */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">Our Core Values</h2>
              <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                These principles guide everything we do and shape how we serve our community of renters and property owners.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value, index) => {
                  const Icon = value.icon
                  return (
                    <div
                      key={index}
                      className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300"
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

            {/* Our Commitment */}
            <div className="bg-card rounded-2xl p-8 md:p-12 border border-border">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">Our Commitment to You</h2>
              <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                We're committed to providing you with the best possible experience. Here's what you can expect from us:
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {commitments.map((commitment, index) => {
                  const Icon = commitment.icon
                  return (
                    <div
                      key={index}
                      className="p-6 rounded-xl border border-border bg-background hover:border-primary/50 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{commitment.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{commitment.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Services Ecosystem */}
        <section className="py-20 md:py-28 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">Complete Home Services Ecosystem</h2>
              <p className="text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
                Beyond property rentals, Manzilini offers a comprehensive ecosystem of essential home-related services, 
                all delivered by vetted service providers. Everything you need for your home, all in one place.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => {
                  const Icon = service.icon
                  return (
                    <div
                      key={index}
                      className="p-6 rounded-xl border border-border bg-background hover:border-primary/50 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{service.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* What Makes Us Different
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">What Makes Us Different</h2>
              <div className="space-y-6">
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Integrated Digital Platform</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Unlike traditional platforms that focus on just one aspect, Manzilini is a comprehensive solution 
                    that addresses all your real estate and housing needs. Search properties, manage listings, communicate 
                    securely, and access home services—all from one centralized platform.
                  </p>
                </div>
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Verified Property Listings</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Every property on our platform goes through a verification process. We verify property ownership, 
                    check listing accuracy, and ensure all information is up-to-date. Tenants can explore verified 
                    listings remotely with confidence, while landlords can efficiently advertise and manage their properties.
                  </p>
                </div>
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Mobile & Web Accessibility</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Access Manzilini from anywhere, anytime. Our mobile and web-based applications are designed 
                    for convenience, allowing you to search properties, manage listings, and book services on the go. 
                    No more limitations of traditional, manual processes.
                  </p>
                </div>
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Vetted Service Providers</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    All our service providers—from movers to interior designers, fumigation experts to installation 
                    specialists—are carefully vetted to ensure quality and reliability. You can trust that every service 
                    in our ecosystem meets our high standards.
                  </p>
                </div>
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Secure Communication</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Built-in secure communication tools allow tenants and landlords to connect safely, schedule viewings, 
                    and discuss property details without compromising privacy or security. All interactions are protected 
                    and transparent.
                  </p>
                </div>
                <div className="p-6 rounded-xl border border-border bg-card">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Digital Transformation Focus</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We're committed to improving living standards and reducing inefficiencies in the housing process. 
                    By leveraging modern technology and user-centered design, we're contributing to the digital 
                    transformation of Kenya's real estate sector.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 to-primary/5  p-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center ">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Experience the Future of Real Estate?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of satisfied users who have found their dream homes and accessed quality home services through Manzilini. 
                Start your property search today and discover the convenience of an integrated platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="gap-2">
                  <Link href="/properties">
                    Browse Properties
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
    </>
  )
}
