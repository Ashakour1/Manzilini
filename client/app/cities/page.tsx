"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const allLocations = [
  {
    name: "Avington",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
  },
  {
    name: "Ruaka",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
  },
  {
    name: "Muthaiga",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop",
  },
  {
    name: "Kikuyu",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  },
  {
    name: "Kamukunji",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop",
  },
  {
    name: "Loresho",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop",
  },
  {
    name: "Kayole",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
  },
  {
    name: "Westlands",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
  },
  {
    name: "Karen",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop",
  },
  {
    name: "Runda",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  },
  {
    name: "Kileleshwa",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop",
  },
  {
    name: "Kitisuru",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop",
  },
  {
    name: "Syokimau",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
  },
  {
    name: "Dagoretti North",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
  },
  {
    name: "Kasarani",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop",
  },
  {
    name: "Kilimani",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  },
  {
    name: "Gigiri",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop",
  },
  {
    name: "Mathare",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop",
  },
  {
    name: "Lang'ata",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
  },
  {
    name: "Hurlingham",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
  },
  {
    name: "Embakasi",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop",
  },
  {
    name: "Makadara",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  },
  {
    name: "Nyari",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop",
  },
  {
    name: "Starehe",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop",
  },
]

export default function CitiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              All Locations
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore properties across all our premium locations in Nairobi
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allLocations.map((location, index) => (
              <Link
                key={index}
                href={`/properties?city=${location.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={location.image}
                    alt={location.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">{location.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Properties
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
