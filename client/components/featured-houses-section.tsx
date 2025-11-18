"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Bath, Bed, MapPin, Maximize2 } from "lucide-react"

const featuredHouses = [
  {
    id: "kilimani-duplex",
    title: "Kilimani Garden Duplex",
    location: "Kilimani, Nairobi",
    price: 2750,
    beds: 4,
    baths: 3,
    size: 2400,
    tag: "New Listing",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&h=800&fit=crop",
  },
  {
    id: "riverside-villa",
    title: "Riverside Contemporary Villa",
    location: "Riverside Drive, Nairobi",
    price: 4200,
    beds: 5,
    baths: 4,
    size: 3200,
    tag: "Furnished",
    image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&h=800&fit=crop",
  },
  {
    id: "westlands-loft",
    title: "Skyline Loft Residence",
    location: "Westlands, Nairobi",
    price: 2100,
    beds: 3,
    baths: 2,
    size: 1850,
    tag: "Price Drop",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop",
  },
]

const highlights = [
  "Handpicked luxury homes in Nairobi's top neighborhoods",
  "Verified listings with guided tours and concierge support",
  "Flexible payment plans with transparent terms",
]

// const stats = [
//   { label: "Luxury Homes", value: "120+" },
//   { label: "Verified Landlords", value: "60+" },
//   { label: "Average Tour Rating", value: "4.9/5" },
// ]

export default function FeaturedHousesSection() {
  return (
    <section className="py-20 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.05fr,1.35fr] items-start">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Curated Collection
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Featured Houses Ready For A Private Tour
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                Discover the most sought-after residences with natural light, contemporary finishes, and seamless smart-home integrations.
              </p>
            </div>
            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {/* <div className="grid grid-cols-3 gap-4 pt-2">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div> */}
            <div className="pt-4">
              <Link
                href="/properties?featured=true"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Explore all featured homes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {featuredHouses.map((house) => (
              <div
                key={house.id}
                className="group rounded-3xl border border-border bg-background overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={house.image}
                    alt={house.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 40vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary">
                    {house.tag}
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Featured Listing</p>
                    <h3 className="text-xl font-semibold text-foreground mt-1">{house.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      {house.location}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-foreground">${house.price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Bed className="h-4 w-4 text-primary" /> {house.beds} Beds
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bath className="h-4 w-4 text-primary" /> {house.baths} Baths
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Maximize2 className="h-4 w-4 text-primary" /> {house.size} sqft
                    </span>
                  </div>
                  <Link
                    href="/properties"
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    View listing
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
