"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpRight, House, HousePlus, ShieldCheck } from "lucide-react"

function HouseIllustration({ accented = false }: { accented?: boolean }) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
      aria-hidden
    >
      <path d="M20 62L70 26L120 62" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 60V114H108V60" stroke="currentColor" strokeWidth="3" />
      <rect x="54" y="86" width="32" height="28" rx="2" stroke="currentColor" strokeWidth="3" />
      <circle cx="70" cy="75" r="8" stroke="currentColor" strokeWidth="3" />
      {accented && (
        <>
          <path d="M30 48L36 52" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          <path d="M106 48L100 52" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          <path d="M70 26V20" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          <path d="M112 84L116 88" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          <path d="M24 84L28 80" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

const items = [
  {
    title: "Buy a property",
    description:
      "Nullam sollicitudin blandit eros eu pretium. Nullam maximus ultricies auctor.",
    cta: "Find a home",
    variant: "outline" as const,
    icon : <House width={40} height={40}/>
  },
  {
    title: "Sell a property",
    description:
      "Nullam sollicitudin blandit eros eu pretium. Nullam maximus ultricies auctor.",
    cta: "Place an ad",
    variant: "default" as const,
    featured: true,
    icon : <HousePlus width={40} height={40} />
  },
  {
    title: "Rent a property",
    description:
      "Nullam sollicitudin blandit eros eu pretium. Nullam maximus ultricies auctor.",
    cta: "Find a rental",
    variant: "outline" as const,
    icon : <ShieldCheck width={40} height={40} />
  },
]

export default function HelpSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-start mb-14">
          <h2 className="text-3xl md:text-3xl font-bold text-foreground">See How Manzilini Can Help</h2>
          <p className="mt-3 text-muted-foreground">Aliquam lacinia diam quis lacus euismod</p>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          {items.map((it, idx) => (
            <div
              key={idx}
              className={`rounded-2xl bg-card p-8 text-start transition-all duration-300`}
            >
              <h1 className="text-5xl flex justify-start text-primary">{it.icon}</h1>
              <h3 className="mt-6 text-xl font-semibold text-foreground">{it.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{it.description}</p>
              <div className="mt-8 flex justify-start">
                <Button variant={it.variant} className="gap-2">
                  {it.cta}
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


