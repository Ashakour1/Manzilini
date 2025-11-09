"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { Star, Quote } from "lucide-react"
import Image from "next/image"

export default function TestimonialsPage() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Wanjiku",
      role: "First-time Renter",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      text: "Manzilline made finding my dream apartment in Nairobi so easy. The platform is intuitive and the team was incredibly helpful throughout the process. I found my perfect home in just one week!",
      rating: 5,
      title: "Great Work",
    },
    {
      id: 2,
      name: "Michael Kamau",
      role: "Landlord",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      text: "As a landlord, I appreciate how Manzilline connects me with qualified tenants efficiently. It saves me time and hassle. The verification process gives me confidence in my tenants.",
      rating: 5,
      title: "Excellent Service",
    },
    {
      id: 3,
      name: "Emily Achieng",
      role: "Property Manager",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      text: "The management tools are fantastic. I can handle multiple properties across Kenya without any stress. Highly recommended for property managers!",
      rating: 5,
      title: "Perfect Platform",
    },
    {
      id: 4,
      name: "David Ochieng",
      role: "Young Professional",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
      text: "Found a beautiful apartment in Westlands in just two days. The filtering options are exactly what I needed. The process was smooth from start to finish.",
      rating: 5,
      title: "Quick & Easy",
    },
    {
      id: 5,
      name: "Lisa Muthoni",
      role: "Relocating Professional",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      text: "Moving to Nairobi was overwhelming, but Manzilline simplified the entire search process. The city guides and neighborhood insights were incredibly helpful.",
      rating: 5,
      title: "Life Saver",
    },
    {
      id: 6,
      name: "James Otieno",
      role: "Real Estate Agent",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      text: "Great platform for showcasing properties across Kenya. My clients love the detailed listings and high-quality images. It's become an essential tool for my business.",
      rating: 5,
      title: "Professional Tool",
    },
    {
      id: 7,
      name: "Grace Njeri",
      role: "Student",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
      text: "As a student, finding affordable housing near campus was challenging. Manzilline helped me find a great shared apartment in a safe neighborhood. The price filters were perfect!",
      rating: 4,
      title: "Student Friendly",
    },
    {
      id: 8,
      name: "Peter Mwangi",
      role: "Family Man",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      text: "We needed a family home with good schools nearby. Manzilline's location insights helped us find the perfect house in a great neighborhood. Highly recommend!",
      rating: 5,
      title: "Family Approved",
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className="bg-card border-b border-border py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Quote className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">What Our Users Say</h1>
              <p className="text-lg text-muted-foreground">
                Real stories from satisfied renters, landlords, and property managers across Kenya
              </p>
            </div>
          </div>
        </div>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <h3 className="text-lg font-bold text-foreground mb-3">{testimonial.title}</h3>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-none text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
