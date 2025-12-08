import { Search, FileCheck, Home, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Search & Discover",
    description:
      "Browse thousands of properties using our advanced filters. Find homes that match your needs and budget.",
  },
  {
    icon: FileCheck,
    title: "Apply",
    description:
      "Complete your rental application with your information. Our process is simple and takes just a few minutes.",
  },
  {
    icon: Home,
    title: "Connect",
    description: "Message landlords directly, schedule viewings, and ask questions about the property.",
  },
  {
    icon: CheckCircle,
    title: "Move In",
    description: "After approval, finalize the lease and move into your new home. Welcome to your new place!",
  },
]

export default function HowItWorks() {
  return (
    <>
        <section className="py-20 md:py-28 bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">How It Works</h1>
            <p className="text-lg text-muted-foreground">Four simple steps to find and rent your perfect home.</p>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="relative">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border-2 border-primary">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-full w-full h-1 bg-gradient-to-r from-primary to-transparent -z-10" />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-20 pt-20 border-t border-border">
              <h2 className="text-2xl font-bold text-foreground mb-12 text-center">Why Renters Trust PropertyHub</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "25,000+ Properties",
                    description: "Access the largest collection of rental properties across the country.",
                  },
                  {
                    title: "150,000+ Happy Renters",
                    description: "Join a community of satisfied renters who found their perfect home.",
                  },
                  {
                    title: "98% Success Rate",
                    description: "Our users have a 98% success rate in finding their ideal rental property.",
                  },
                ].map((stat, index) => (
                  <div key={index} className="p-8 rounded-lg border border-border bg-card text-center">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{stat.title}</h3>
                    <p className="text-muted-foreground">{stat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
    </>
  )
}
