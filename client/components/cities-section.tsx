"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const cities = [
  {
    name: "Nairobi",
    properties: 10,
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
  },
  {
    name: "Mombasa",
    properties: 1,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
  },
  {
    name: "Kisumu",
    properties: 1,
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop",
  },
  {
    name: "Nakuru",
    properties: 1,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  },
  {
    name: "Eldoret",
    properties: 2,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop",
  },
  {
    name: "Thika",
    properties: 0,
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop",
  },
]

export default function CitiesSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Properties By Cities</h2>
            <p className="text-muted-foreground">Aliquam lacinia diam quis lacus euismod</p>
          </div>
          <Link
            href="/cities"
            className="mt-4 md:mt-0 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            See All Cities
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city, index) => (
            <Link
              key={index}
              href={`/properties?city=${city.name.toLowerCase()}`}
              className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:shadow-lg transition-all duration-300"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-semibold mb-1">{city.name}</h3>
                <p className="text-sm text-white/90">
                  {city.properties} {city.properties === 1 ? "Property" : "Properties"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

