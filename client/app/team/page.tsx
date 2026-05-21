import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BriefcaseBusiness, ShieldCheck, Users2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const teamMembers = [
  {
    name: "Abdishakur Mohamed",
    role: "CEO & CTO",
    fullRole: "Chief Executive Officer & Chief Technology Officer",
    image: "/avatars/abdishakur-fake-avatar.svg",
  },
  {
    name: "Farah Abdi Daud",
    role: "CPO",
    fullRole: "Chief Product Officer",
    image: "/avatars/farah-fake-avatar.svg",
  },
  {
    name: "Mohamed Ahmed",
    role: "CFO",
    fullRole: "Chief Financial Officer",
    image: "/avatars/mohamed-fake-avatar.svg",
  },
  {
    name: "Najat Se'id Farah",
    role: "CMO",
    fullRole: "Chief Marketing Officer",
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
      <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-b from-background via-background to-card">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-6">
              Our Leadership
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
              Meet the <span className="text-primary">Manzilini</span> Executive Team
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              A focused executive group modernizing the housing journey in Kenya with trusted listings, practical tools, and reliable service partnerships.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="group relative rounded-2xl border border-border bg-card overflow-hidden transition-all duration-500 ease-out hover:shadow-xl hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/5 to-muted">
                  <Image
                    src={member.image}
                    alt={`${member.name} portrait`}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="p-5">
                  <div className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-primary mb-2">
                    {member.role}
                  </div>
                  <h2 className="text-lg font-semibold text-foreground leading-tight">
                    {member.name}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {member.fullRole}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-card border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
                How We Work
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our culture is built around trust, delivery, and user experience.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {principles.map((principle) => {
                const Icon = principle.icon
                return (
                  <div
                    key={principle.title}
                    className="group relative rounded-2xl border border-border bg-background p-6 transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {principle.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
              Work With Our Team
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Whether you are searching for a home or listing a property, we are here to help you move forward confidently.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="gap-2 rounded-xl">
                <Link href="/properties">
                  Browse Properties
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-xl">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
