"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Home, MessageCircle, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/properties", label: "Properties" },
    { href: "/pricing", label: "Pricing" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Manzilline</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10">
              <Link href="/contact" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Contact Us
              </Link>
            </Button>
            <Button size="sm" asChild className="bg-primary hover:bg-primary/90 shadow-md">
              <Link href="/properties" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Post Property
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <Button variant="ghost" size="sm" asChild className="w-full hover:bg-primary/10">
                  <Link href="/contact" className="flex items-center gap-2 justify-center">
                    <MessageCircle className="w-4 h-4" />
                    Contact Us
                  </Link>
                </Button>
                <Button size="sm" asChild className="w-full bg-primary hover:bg-primary/90 shadow-md">
                  <Link href="/properties" className="flex items-center gap-2 justify-center">
                    <Upload className="w-4 h-4" />
                    Post Property
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
