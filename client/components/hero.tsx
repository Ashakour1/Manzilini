"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Filter, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fetchPropertyCountsByCity } from "@/services/properties.service"

const heroTabs = [
  { label: "All", value: "all" },
  { label: "Sale", value: "sale" },
  { label: "Rent", value: "rent" },
]

const propertyTypes = [
  { value: "all", label: "All Type" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOUSE", label: "House" },
  { value: "STUDIO", label: "Studio" },
  { value: "OFFICE", label: "Office" },
  { value: "LAND", label: "Land" },
]

const heroStats = [
  { value: "47", label: "Counties Covered" },
  { value: "24/7", label: "Available Support" },
  { value: "100%", label: "Trusted Platform" },
]

const nairobiVillages = [
  {
    name: "Nairobi",
    properties: 0,
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop"
  },
  {
    name: "Mombasa",
    properties: 0,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
  },
  {
    name: "Kisumu",
    properties: 0,
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop"
  },
  {
    name: "Nakuru",
    properties: 0,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
  },
  {
    name: "Eldoret",
    properties: 0,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop"
  },
  {
    name: "Thika",
    properties: 0,
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"
  },
  {
    name: "Malindi",
    properties: 0,
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop"
  },
  {
    name: "Nyeri",
    properties: 0,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
  },
  {
    name: "Embu",
    properties: 0,
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop"
  },
  {
    name: "Meru",
    properties: 0,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
  },
  {
    name: "Kitale",
    properties: 0,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop"
  },
  {
    name: "Kakamega",
    properties: 0,
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"
  },
  {
    name: "Garissa",
    properties: 0,
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop"
  },
  {
    name: "Lamu",
    properties: 0,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
  },
  {
    name: "Machakos",
    properties: 0,
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop"
  },
  {
    name: "Kericho",
    properties: 0,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
  },
  {
    name: "Naivasha",
    properties: 0,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop"
  },
  {
    name: "Nanyuki",
    properties: 0,
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"
  },
  {
    name: "Bungoma",
    properties: 0,
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop"
  },
  {
    name: "Busia",
    properties: 0,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
  },
  {
    name: "Homa Bay",
    properties: 0,
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop"
  },
  {
    name: "Kisii",
    properties: 0,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
  },
  {
    name: "Kilifi",
    properties: 0,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop"
  },
  {
    name: "Voi",
    properties: 0,
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"
  },
  {
    name: "Narok",
    properties: 0,
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop"
  },
  {
    name: "Nyamira",
    properties: 0,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
  },
  {
    name: "Migori",
    properties: 0,
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop"
  },
  {
    name: "Siaya",
    properties: 0,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
  },
  {
    name: "Bomet",
    properties: 0,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop"
  },
  {
    name: "Kajiado",
    properties: 0,
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"
  },
  {
    name: "Kiambu",
    properties: 0,
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop"
  },
  {
    name: "Murang'a",
    properties: 0,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
  },
  {
    name: "Nyahururu",
    properties: 0,
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop"
  },
  {
    name: "Lodwar",
    properties: 0,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
  },
  {
    name: "Marsabit",
    properties: 0,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop"
  },
  {
    name: "Wajir",
    properties: 0,
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"
  },
  {
    name: "Mandera",
    properties: 0,
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop"
  },
  {
    name: "Isiolo",
    properties: 0,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
  },
  {
    name: "Kapenguria",
    properties: 0,
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop"
  },
  {
    name: "Maralal",
    properties: 0,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
  },
  {
    name: "Moyale",
    properties: 0,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop"
  },
  {
    name: "Diani",
    properties: 0,
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop"
  },
  {
    name: "Watamu",
    properties: 0,
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop"
  },
  {
    name: "Ruiru",
    properties: 0,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
  },
  {
    name: "Athi River",
    properties: 0,
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop"
  },
]

const getLocationOptions = (villagesList: typeof nairobiVillages) => {
  return villagesList.map((village) => ({
    value: village.name.toLowerCase().replace(/\s+/g, "-"),
    label: village.name,
  }))
}

export default function Hero() {
  const [activeTab, setActiveTab] = useState<string>("sale")
  const [villages, setVillages] = useState(nairobiVillages)

  const [location, setLocation] = useState<string>("")
  const [type, setType] = useState<string>("")
  const [budget, setBudget] = useState<string>("")
  const [keyword, setKeyword] = useState<string>("")

  useEffect(() => {
    const loadPropertyCounts = async () => {
      try {
        const cityCounts = await fetchPropertyCountsByCity()
        
        // Create a map of city name to count (case-insensitive matching)
        const countsMap = new Map<string, number>()
        cityCounts.forEach((item: { city: string; count: number }) => {
          const cityName = item.city?.trim()
          if (cityName) {
            countsMap.set(cityName.toLowerCase(), item.count)
          }
        })

        // Update villages with dynamic counts
        const updatedVillages = nairobiVillages.map((village) => {
          const count = countsMap.get(village.name.toLowerCase()) || 0
          return {
            ...village,
            properties: count
          }
        })

        setVillages(updatedVillages)
      } catch (error) {
        console.error("Failed to load property counts:", error)
        // Keep default villages with 0 counts if fetch fails
      }
    }

    loadPropertyCounts()
  }, [])

  const handleChange = (value: string, key: string) => {
    switch (key) {
      case "location":
        setLocation(value)
        break
      case "type":
        setType(value)
        break
      default:
        break
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    
    // if (activeTab !== "all") {
    //   params.set("listingType", activeTab)
    // }
    
    if (location && location !== "all") {
      params.set("city", location)
    }
    
    if (type && type !== "all") {
      params.set("property_type", type)
    }
    
    // if (budget.trim()) {
    //   params.set("price", budget.trim())
    // }
    
    // if (keyword.trim()) {
    //   params.set("keyword", keyword.trim())
    // }
    
    const queryString = params.toString()
    window.location.href = `/properties${queryString ? `?${queryString}` : ""}`
  }




  return (
    <>
      <section className="relative isolate overflow-hidden bg-background py-24">
        <Image
          src="/hero.jpg"
          alt="Luxury modern home"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/80" />

        <div className="relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <div className="mx-auto max-w-3xl text-center text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
              All in One Platform              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Kenya’s Housing, Simplified
              </h1>
              <p className="mt-4 text-lg text-white/80">
                Find your perfect home with our extensive collection of premium properties. Expertly curated listings tailored to match your unique lifestyle and preferences.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 min-w-[170px] gap-2 rounded-full bg-white text-primary hover:bg-white/90"
                  onClick={() => (window.location.href = "/properties")}
                >
                  Explore Listings
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 min-w-[170px] rounded-full border-white/50 bg-transparent text-white hover:bg-white/10"
                  onClick={() => (window.location.href = "/contact")}
                >
                  Contact Agent
                </Button>
              </div>
            </div>

            <div className="mx-auto mt-10 w-full max-w-4xl  rounded-[36px] bg-white/95 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.35)] backdrop-blur">
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {heroTabs.map((tab) => {
                  const isActive = activeTab === tab.value
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setActiveTab(tab.value)}
                      className={`rounded-full px-6 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-black/40 ${
                        isActive ? "bg-primary text-white " : "border border-primary text-gray-500"
                      }`}
                      aria-pressed={isActive}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-[1.3fr_1fr_1fr_1fr_auto_auto] md:items-end">
                <div className="rounded-2xl border border-gray-200 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Keyword
                  </p>
                  <Input
                    className="mt-2 border-0 px-0 text-base text-gray-900 shadow-none focus-visible:ring-0"
                    placeholder="Enter Keyword"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
                <div className="rounded-2xl border border-gray-200 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Location
                  </p>
                  <Select 
                    onValueChange={(value) => handleChange(value, "location")}
                    value={location || getLocationOptions(villages)[0]?.value}
                  >
                    <SelectTrigger className="mt-2 h-auto border-0 px-0 text-base font-medium text-gray-900 shadow-none focus-visible:ring-0">
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {getLocationOptions(villages).map((loc) => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-2xl border border-gray-200 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Type
                  </p>
                  <Select 
                    onValueChange={(value) => handleChange(value, "type")}
                    value={type || propertyTypes[0].value}
                  >
                    <SelectTrigger className="mt-2 h-auto border-0 px-0 text-base font-medium text-gray-900 shadow-none focus-visible:ring-0">
                      <SelectValue placeholder="All Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((propType) => (
                        <SelectItem key={propType.value} value={propType.value}>
                          {propType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-2xl border border-gray-200 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Budget
                  </p>
                  <Input
                    className="mt-2 border-0 px-0 text-base text-gray-900 shadow-none focus-visible:ring-0"
                    placeholder="$1,000 - $3,000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>
           
                <Button
                  onClick={handleSearch}
                  className="group relative h-14 min-w-[160px] overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-10 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.02] hover:from-black hover:to-black focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary">
                  <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10 group-active:opacity-20 bg-white" />
                  <Search className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  <span className="relative">Search</span>
                </Button>
              </div>
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl gap-6 text-center text-white sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-sm text-white/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Premium Locations</p>
              <h2 className="mt-3 text-3xl font-semibold text-foreground">
                Explore Top Neighborhoods
              </h2>
              <p className="mt-2 text-base text-muted-foreground">
                Browse through our handpicked selection of premium neighborhoods, each offering unique lifestyle opportunities and exceptional properties.
              </p>
            </div>
            <Button variant="ghost" className="gap-2 text-sm" asChild>
              <Link href="/cities" className="text-primary hover:text-primary/80 transition-colors">
                View all locations
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {villages.slice(0, 6).map((village) => (
              <Link
                key={village.name}
                href={`/properties?city=${village.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex items-center gap-4 rounded-3xl border border-border/60 bg-card/70 p-4 transition hover:-translate-y-1 hover:border-primary/70"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl flex-shrink-0">
                  <Image
                    src={village.image}
                    alt={village.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-foreground truncate">{village.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {village.properties} {village.properties === 1 ? "property" : "properties"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
