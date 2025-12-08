"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function PricingPage() {
  const plans = [
    {
      id: 1,
      name: "Free",
      price: "0",
      description: "Perfect for browsing",
      features: [
        "Browse unlimited properties",
        "Save up to 5 favorites",
        "Basic search filters",
        "View property details",
        "Email support",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      id: 2,
      name: "Premium",
      price: "9.99",
      description: "For serious renters",
      features: [
        "Everything in Free",
        "Save unlimited favorites",
        "Advanced filters & alerts",
        "Direct messaging with landlords",
        "Priority support",
        "Virtual tours",
        "Exclusive early access",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      id: 3,
      name: "Professional",
      price: "29.99",
      description: "For landlords & managers",
      features: [
        "List unlimited properties",
        "Advanced analytics",
        "Tenant screening",
        "Rent payment tracking",
        "24/7 support",
        "Custom branding",
        "Integration with tools",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ]

  return (
    <>
        <div className="bg-card pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-start">
            <h1 className="text-4xl font-bold text-foreground mb-2">Simple, Transparent Pricing</h1>
            <p className="text-muted-foreground">Choose the perfect plan for your needs</p>
          </div>
        </div>

        <section className="py-10 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-lg border transition ${
                    plan.highlighted
                      ? "bg-primary border-primary shadow-lg scale-105 md:scale-110"
                      : "bg-card border-border"
                  }`}
                >
                  <div className="p-8">
                    <h3
                      className={`text-2xl font-bold mb-2 ${plan.highlighted ? "text-primary-foreground" : "text-foreground"}`}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={`mb-4 text-sm ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                    >
                      {plan.description}
                    </p>
                    <div className="mb-6">
                      <span
                        className={`text-4xl font-bold ${plan.highlighted ? "text-primary-foreground" : "text-foreground"}`}
                      >
                        ${plan.price}
                      </span>
                      <span
                        className={`ml-2 ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                      >
                        /month
                      </span>
                    </div>
                    <Button
                      className={`w-full mb-6 ${
                        plan.highlighted
                          ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                          : "bg-primary hover:bg-primary/90"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                    <div className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <Check
                            className={`w-4 h-4 ${plan.highlighted ? "text-primary-foreground" : "text-primary"}`}
                          />
                          <span
                            className={plan.highlighted ? "text-primary-foreground text-sm" : "text-foreground text-sm"}
                          >
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      
    </>
  )
}
