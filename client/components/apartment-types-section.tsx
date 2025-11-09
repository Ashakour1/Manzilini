"use client"

import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const apartmentTypes = [
  {
    name: "Houses",
    count: 7,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
  },
  {
    name: "Apartments",
    count: 3,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
  },
  {
    name: "Office",
    count: 4,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
  },
  {
    name: "Villa",
    count: 4,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop",
  },
  {
    name: "Townhome",
    count: 2,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
  },
]

export default function ApartmentTypesSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Explore Apartment Types</h2>
            <p className="text-muted-foreground">Lorem ipsum dolor sit amet,</p>
          </div>
          <Link
            href="/properties"
            className="mt-4 md:mt-0 flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium"
          >
            All Types
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide pb-4">
            <div className="flex gap-6 min-w-max">
              {apartmentTypes.map((type, index) => (
                <Link
                  key={index}
                  href={`/properties?type=${type.name.toLowerCase()}`}
                  className="group flex-shrink-0 w-64 bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={type.image}
                      alt={type.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="256px"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-foreground mb-1">{type.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {type.count} {type.count === 1 ? "Property" : "Properties"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2, 3, 4].map((index) => {
              const isActive = index === 0
              return (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isActive ? "bg-foreground" : "bg-gray-300"
                  }`}
                />
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

