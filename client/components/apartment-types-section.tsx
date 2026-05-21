"use client"

import {
  ArrowRight,
  Building2,
  Home,
  Sofa,
  Briefcase,
  TreePine,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface PropertyType {
  name: string
  image: string
  type: string
  description: string
  icon: LucideIcon
  accent: string
}

const propertyTypes: PropertyType[] = [
  {
    type: "APARTMENT",
    name: "Apartments",
    description: "Modern living spaces in the heart of the city.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=600&fit=crop",
    icon: Building2,
    accent: "from-sky-500/20 to-sky-500/0",
  },
  {
    type: "HOUSE",
    name: "Houses",
    description: "Spacious family homes with private comfort.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=600&fit=crop",
    icon: Home,
    accent: "from-emerald-500/20 to-emerald-500/0",
  },
  {
    type: "STUDIO",
    name: "Studios",
    description: "Smart, compact homes for solo living.",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=600&fit=crop",
    icon: Sofa,
    accent: "from-violet-500/20 to-violet-500/0",
  },
  {
    type: "OFFICE",
    name: "Offices",
    description: "Professional workspaces for your business.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop",
    icon: Briefcase,
    accent: "from-amber-500/20 to-amber-500/0",
  },
  {
    type: "LAND",
    name: "Land",
    description: "Plots ready for your next development.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=600&fit=crop",
    icon: TreePine,
    accent: "from-lime-500/20 to-lime-500/0",
  },
]

export default function ApartmentTypesSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Property Types
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Find a home that fits how you live
            </h2>
            <p className="mt-3 text-muted-foreground">
              Browse by category — from city apartments to family houses, studios, offices, and land.
            </p>
          </div>
          <Link
            href="/properties"
            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:text-primary"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {propertyTypes.map((type) => {
            const Icon = type.icon
            return (
              <Link
                key={type.type}
                href={`/properties?property_type=${type.type.toLowerCase()}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30"
              >
                {/* Image */}
                <Image
                  src={type.image}
                  alt={type.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />

                {/* Color accent (top) */}
                <div
                  className={`pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b ${type.accent}`}
                />

                {/* Bottom dark gradient for text legibility */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Top-left icon chip */}
                <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-white/20">
                  <Icon className="h-4 w-4 text-white" />
                </div>

                {/* Bottom info */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-lg font-bold text-white">{type.name}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-white/80">{type.description}</p>

                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                    Browse
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
