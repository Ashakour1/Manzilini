"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

const faqs = [
  {
    question: "How do I search for properties on PropertyHub?",
    answer:
      "You can search by location, property type, price range, and more using our advanced filter system. Simply enter your preferences and browse through available properties.",
  },
  {
    question: "Are all landlords verified on PropertyHub?",
    answer:
      "Yes, we verify all landlords on our platform to ensure authenticity and credibility. This protects our renters and ensures secure transactions.",
  },
  {
    question: "How do I apply for a property?",
    answer:
      "Create an account, complete your profile, and click 'Apply' on any property. You can submit applications with your personal information and documents.",
  },
  {
    question: "What should I include in my rental application?",
    answer:
      "Typically, you'll need government-issued ID, proof of income, references, and employment history. Check specific property requirements as they may vary.",
  },
  {
    question: "Is it safe to message landlords through PropertyHub?",
    answer:
      "Yes, our messaging system is secure and private. All communications are encrypted, and you can chat with landlords directly through our platform.",
  },
  {
    question: "What are the fees for using PropertyHub?",
    answer:
      "For renters, PropertyHub is completely free. We only charge landlords a listing fee. This keeps our service accessible to everyone seeking rental properties.",
  },
  {
    question: "How long does it take to hear back from a landlord?",
    answer:
      "Response times vary, but most landlords respond within 24-48 hours. Premium members often get faster responses.",
  },
  {
    question: "Can I save my favorite properties?",
    answer:
      "Yes, you can bookmark properties and create lists to compare your top choices later. Access your saved properties anytime from your profile.",
  },
]

export default function FAQ() {
  const [expanded, setExpanded] = useState(null)

  return (
    <>
        <section className="py-20 md:py-28 bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about PropertyHub and renting.
            </p>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-border rounded-lg bg-card overflow-hidden">
                  <button
                    onClick={() => setExpanded(expanded === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary/5 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-foreground text-left">{faq.question}</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                        expanded === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expanded === index && (
                    <div className="px-6 py-4 border-t border-border bg-primary/5">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
    </>
  )
}
