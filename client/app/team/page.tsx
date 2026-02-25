import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BriefcaseBusiness, ShieldCheck, Users2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const teamMembers = [
  {
    name: "Abdishakur Mohamed",
    role: "Chief Executive Officer (CEO) & Chief Technology Officer (CTO)",
    image: "/avatars/abdishakur-fake-avatar.svg",
  },
  {
    name: "Farah Abdi Daud",
    role: "Chief Product Officer (CPO)",
    image: "/avatars/farah-fake-avatar.svg",
  },
  {
    name: "Maryan Noor Shire",
    role: "Chief Operating Officer (COO)",
    image: "/avatars/maryan-fake-avatar.svg",
  },
  {
    name: "Mohamed Ahmed",
    role: "Chief Financial Officer (CFO)",
    image: "/avatars/mohamed-fake-avatar.svg",
  },
]

const principles = [
  {
    icon: Users2,
    title: "People First",
    description: "We design around real needs from tenants, landlords, and homeowners.",
  },
  {
    icon: ShieldCheck,
    title: "Trust by Default",
    description: "Verified listings, transparent communication, and dependable support define our standard.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Execution Focused",
    description: "We move quickly, solve practical problems, and continuously improve the platform.",
  },
]

export default function TeamPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Meet the <span className="text-primary">Manzilini</span> Executive Management
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We are a focused executive management group working to modernize the housing journey in Kenya with trusted listings, practical tools,
              and reliable service partnerships.
            </p>
          </div>
        </div>
      </section>

      <section className=" bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="group relative rounded-none border-none border-border bg-card overflow-hidden transition-all duration-500 ease-out"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={`${member.name} portrait`}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="relative z-20 p-5">
                  <h2 className="text-lg font-semibold text-foreground">{member.name}</h2>
                  <p className="text-sm text-primary mt-1">{member.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">How We Work</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
              Our culture is built around trust, delivery, and user experience.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {principles.map((principle) => {
                const Icon = principle.icon
                return (
                  <div key={principle.title} className="rounded-xl border border-border bg-background p-6">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{principle.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{principle.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Work With Our Executive Management</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Whether you are searching for a home or listing a property, we are here to help you move forward confidently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link href="/properties">
                  Browse Properties
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
