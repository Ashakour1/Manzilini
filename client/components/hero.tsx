"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Search, MapPin, Home, Wallet } from "lucide-react"
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
  { label: "For Sale", value: "sale" },
  { label: "For Rent", value: "rent" },
]

const propertyTypes = [
  { value: "all", label: "All Types" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOUSE", label: "House" },
  { value: "STUDIO", label: "Studio" },
  { value: "OFFICE", label: "Office" },
  { value: "LAND", label: "Land" },
]

const heroStats = [
  { value: "47+", label: "Counties" },
  { value: "4,300+", label: "Properties" },
  { value: "10K+", label: "Active users" },
  { value: "24/7", label: "Support" },
]

const nairobiVillages = [
  { name: "Nairobi", properties: 0, image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop" },
  { name: "Mombasa", properties: 0, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop" },
  { name: "Kisumu", properties: 0, image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop" },
  { name: "Nakuru", properties: 0, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop" },
  { name: "Eldoret", properties: 0, image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop" },
  { name: "Thika", properties: 0, image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop" },
  { name: "Malindi", properties: 0, image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop" },
  { name: "Nyeri", properties: 0, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop" },
  { name: "Embu", properties: 0, image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop" },
  { name: "Meru", properties: 0, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop" },
  { name: "Kitale", properties: 0, image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop" },
  { name: "Kakamega", properties: 0, image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop" },
  { name: "Garissa", properties: 0, image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop" },
  { name: "Lamu", properties: 0, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop" },
  { name: "Machakos", properties: 0, image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop" },
  { name: "Kericho", properties: 0, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop" },
  { name: "Naivasha", properties: 0, image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop" },
  { name: "Nanyuki", properties: 0, image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop" },
  { name: "Kiambu", properties: 0, image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop" },
  { name: "Ruiru", properties: 0, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop" },
  { name: "Athi River", properties: 0, image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop" },
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

  useEffect(() => {
    const loadPropertyCounts = async () => {
      try {
        const cityCounts = await fetchPropertyCountsByCity()
        const countsMap = new Map<string, number>()
        cityCounts.forEach((item: { city: string; count: number }) => {
          const cityName = item.city?.trim()
          if (cityName) {
            countsMap.set(cityName.toLowerCase(), item.count)
          }
        })

        const updatedVillages = nairobiVillages.map((village) => {
          const count = countsMap.get(village.name.toLowerCase()) || 0
          return { ...village, properties: count }
        })

        setVillages(updatedVillages)
      } catch (error) {
        console.error("Failed to load property counts:", error)
      }
    }

    loadPropertyCounts()
  }, [])

  const handleChange = (value: string, key: string) => {
    if (key === "location") setLocation(value)
    else if (key === "type") setType(value)
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location && location !== "all") params.set("city", location)
    if (type && type !== "all") params.set("property_type", type)
    if (activeTab && activeTab !== "all") params.set("status", activeTab)
    const queryString = params.toString()
    window.location.href = `/properties${queryString ? `?${queryString}` : ""}`
  }

  return (
    <>
      <section className="relative isolate overflow-hidden bg-background pb-20 pt-20 md:pt-28 md:pb-28">
        {/* Background image + overlay */}
        <Image
          src="/hero.jpg"
          alt="Modern Kenyan home"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/80" />
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute -top-20 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero copy */}
            <div className="mx-auto max-w-3xl text-center text-white">
              <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
                All-In-One Real Estate Platform
              </span>

              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Kenya&apos;s Housing,
                <span className="block bg-gradient-to-r from-primary via-primary/80 to-white bg-clip-text text-transparent">
                  Simplified.
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base text-white/80 md:text-lg">
                Discover verified homes, apartments, and rentals across Kenya. Find your next place with confidence — fast, secure, and transparent.
              </p>

              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 min-w-[170px] gap-2 rounded-full bg-white text-foreground hover:bg-white/90"
                  onClick={() => (window.location.href = "/properties")}
                >
                  Explore Listings
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 min-w-[170px] rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  onClick={() => (window.location.href = "/contact")}
                >
                  Talk to us
                </Button>
              </div>
            </div>

            {/* Search card */}
            <div className="mx-auto mt-12 w-full max-w-5xl">
              {/* Tabs */}
              <div className="flex justify-center md:justify-start">
                <div className="inline-flex rounded-t-2xl bg-white/95 p-1 backdrop-blur">
                  {heroTabs.map((tab) => {
                    const isActive = activeTab === tab.value
                    return (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setActiveTab(tab.value)}
                        className={`rounded-xl px-5 py-2 text-sm font-semibold transition focus:outline-none ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        aria-pressed={isActive}
                      >
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Search form */}
              <div className="rounded-2xl rounded-tl-none bg-white/95 p-3 backdrop-blur md:p-4">
                <div className="grid gap-2 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-stretch">
                  {/* Location */}
                  <div className="rounded-xl bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                      <MapPin className="h-3 w-3" />
                      Location
                    </p>
                    <Select
                      onValueChange={(value) => handleChange(value, "location")}
                      value={location}
                    >
                      <SelectTrigger className="mt-1 h-auto border-0 bg-transparent px-0 text-base font-medium text-gray-900 shadow-none focus-visible:ring-0">
                        <SelectValue placeholder="Anywhere in Kenya" />
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

                  {/* Type */}
                  <div className="rounded-xl bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                      <Home className="h-3 w-3" />
                      Property Type
                    </p>
                    <Select
                      onValueChange={(value) => handleChange(value, "type")}
                      value={type}
                    >
                      <SelectTrigger className="mt-1 h-auto border-0 bg-transparent px-0 text-base font-medium text-gray-900 shadow-none focus-visible:ring-0">
                        <SelectValue placeholder="Any type" />
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

                  {/* Budget */}
                  <div className="rounded-xl bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                      <Wallet className="h-3 w-3" />
                      Budget
                    </p>
                    <Input
                      className="mt-1 border-0 bg-transparent px-0 text-base text-gray-900 shadow-none focus-visible:ring-0"
                      placeholder="Any budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </div>

                  {/* Search button */}
                  <Button
                    onClick={handleSearch}
                    className="h-auto min-h-[64px] gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-6 text-center text-white sm:grid-cols-4">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold tabular-nums md:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-white/70 md:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top Neighborhoods */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                Premium Locations
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Explore Top Neighborhoods
              </h2>
              <p className="mt-3 text-muted-foreground">
                Browse handpicked premium neighborhoods, each offering unique lifestyle opportunities and exceptional properties.
              </p>
            </div>
            <Link
              href="/cities"
              className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:text-primary"
            >
              View all locations
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {villages.slice(0, 6).map((village) => (
              <Link
                key={village.name}
                href={`/properties?city=${village.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-all hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="relative h-14 w-14 overflow-hidden rounded-xl flex-shrink-0">
                  <Image
                    src={village.image}
                    alt={village.name}
                    fill
                    sizes="56px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{village.name}</p>
                  <p className="text-xs text-muted-foreground">
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
