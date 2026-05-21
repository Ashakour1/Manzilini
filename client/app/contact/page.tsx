"use client"

import { Button } from "@/components/ui/button"
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log("Form submitted:", formData)
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
      setSubmitStatus("success")

      setTimeout(() => setSubmitStatus("idle"), 5000)
    } catch (error) {
      setSubmitStatus("error")
      setTimeout(() => setSubmitStatus("idle"), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      primary: "info@manzilini.com",
      secondary: "support@manzilini.com",
      action: "mailto:info@manzilini.com",
    },
    {
      icon: Phone,
      title: "Call Us",
      primary: "+254 118 723 979",
      secondary: "Mon - Sat",
      action: "tel:+254118723979",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      primary: "Westlands, Nairobi",
      secondary: "Kenya",
      action: "#",
    },
  ]

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61586517446007", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "https://www.instagram.com/manzilinihq/", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-b from-background via-background to-card">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <MessageSquare className="h-3.5 w-3.5" />
              Contact Us
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Have a question or need help? Reach out through any of the channels below or send us a message — we typically respond within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="pb-12 md:pb-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-5 ">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <Link
                  key={index}
                  href={info.action}
                  className="group rounded-2xl border border-border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1.5">{info.title}</h3>
                  <p className="text-sm font-medium text-foreground">{info.primary}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{info.secondary}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Form + Sidebar */}
      <section className="pb-20 md:pb-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8  mx-auto">
            {/* Form */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1.5">Send us a message</h2>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">We typically respond within 24 hours</p>
                </div>
              </div>

              {submitStatus === "success" && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
                  <p className="font-medium">Thank you for your message!</p>
                  <p className="text-sm mt-0.5">We&apos;ll get back to you soon.</p>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                  <p className="font-medium">Something went wrong</p>
                  <p className="text-sm mt-0.5">Please try again or contact us directly.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                      placeholder="+254 118 723 979"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="property">Property Listing</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    placeholder="Tell us how we can help you..."
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 rounded-xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Office Hours */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-foreground">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </span>
                  Office Hours
                </h3>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Mon – Fri</span>
                    <span className="font-medium text-foreground">9:00 AM – 6:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Saturday</span>
                    <span className="font-medium text-foreground">10:00 AM – 4:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium text-foreground">Closed</span>
                  </li>
                </ul>
              </div>

              {/* Social */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 text-base font-semibold text-foreground">Follow Us</h3>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon
                    return (
                      <Link
                        key={index}
                        href={social.href}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:scale-105"
                        aria-label={social.label}
                      >
                        <Icon className="h-4 w-4" />
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Quick Links */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 text-base font-semibold text-foreground">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  {[
                    { href: "/properties", label: "Browse Properties" },
                    { href: "/about", label: "About Us" },
                    { href: "/team", label: "Our Team" },
                    { href: "/pricing", label: "Pricing" },
                    { href: "/testimonials", label: "Testimonials" },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
