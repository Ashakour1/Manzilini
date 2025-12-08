"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function GuidesPage() {
  const guides = [
    {
      id: 1,
      title: "Complete Renter's Guide",
      description: "Everything you need to know before signing a lease agreement",
      category: "Renting",
      readTime: "12 min",
      image: "/renter-guide.jpg",
    },
    {
      id: 2,
      title: "Landlord Tips & Best Practices",
      description: "Maximize your rental income and maintain your properties effectively",
      category: "Landlording",
      readTime: "10 min",
      image: "/landlord-tips.jpg",
    },
    {
      id: 3,
      title: "Avoiding Common Rental Scams",
      description: "Protect yourself from rental fraud and suspicious listings",
      category: "Safety",
      readTime: "8 min",
      image: "/rental-scams.jpg",
    },
    {
      id: 4,
      title: "First Time Homebuyer Guide",
      description: "Navigate the mortgage process and make your first property purchase",
      category: "Buying",
      readTime: "15 min",
      image: "/first-time-buyer.jpg",
    },
    {
      id: 5,
      title: "Understanding Lease Agreements",
      description: "Decode common lease terms and what they mean for you",
      category: "Legal",
      readTime: "11 min",
      image: "/lease-agreement.jpg",
    },
    {
      id: 6,
      title: "Pet-Friendly Rentals Explained",
      description: "Find and negotiate pet policies for your furry friends",
      category: "Lifestyle",
      readTime: "7 min",
      image: "/pet-friendly-rentals.jpg",
    },
  ]

  const categories = ["All", "Renting", "Landlording", "Safety", "Buying", "Legal", "Lifestyle"]

  return (
    <>
        <div className="bg-card border-b border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Guides & Resources</h1>
            <p className="text-muted-foreground">Learn everything about renting, buying, and property management</p>
          </div>
        </div>

        <section className="py-12 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-3 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`px-4 py-2 rounded-lg border transition ${
                    cat === "All"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-foreground hover:border-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guides.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-card border border-border rounded-lg overflow-hidden group hover:shadow-lg transition"
                >
                  <img
                    src={guide.image || "/placeholder.svg"}
                    alt={guide.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {guide.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{guide.readTime} read</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-lg">{guide.title}</h3>
                    <p className="text-sm text-muted-foreground mb-6">{guide.description}</p>
                    <Button variant="ghost" className="p-0 h-auto text-primary hover:bg-transparent">
                      Read Guide <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
    </>
  )
}
