"use client"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FavoritesPage() {
  const favorites = [
    {
      id: 1,
      title: "Modern Downtown Apartment",
      price: "$2,500/mo",
      location: "New York, NY",
      bedrooms: 2,
      bathrooms: 2,
      image: "/modern-downtown-apartment.jpg",
    },
    {
      id: 2,
      title: "Cozy Studio Near Park",
      price: "$1,800/mo",
      location: "San Francisco, CA",
      bedrooms: 1,
      bathrooms: 1,
      image: "/cozy-studio-apartment.jpg",
    },
    {
      id: 3,
      title: "Luxury Penthouse",
      price: "$5,200/mo",
      location: "Los Angeles, CA",
      bedrooms: 3,
      bathrooms: 2.5,
      image: "/luxury-penthouse.png",
    },
  ]

  return (
    <>
        <div className="bg-card border-b border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Your Favorite Properties</h1>
            <p className="text-muted-foreground">Keep track of properties you love</p>
          </div>
        </div>

        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {favorites.map((property) => (
                  <div key={property.id} className="bg-card border border-border rounded-lg overflow-hidden group">
                    <div className="relative overflow-hidden">
                      <img
                        src={property.image || "/placeholder.svg"}
                        alt={property.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                      />
                      <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg">
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      </button>
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-foreground mb-2">{property.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{property.location}</p>
                      <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
                        <span>{property.bedrooms} bd</span>
                        <span>{property.bathrooms} ba</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg text-foreground">{property.price}</span>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">No Favorites Yet</h2>
                <p className="text-muted-foreground mb-6">Start adding properties to your favorites list</p>
                <Button className="bg-primary hover:bg-primary/90">Browse Properties</Button>
              </div>
            )}
          </div>
        </section>
    </>
  )
}
