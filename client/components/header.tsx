"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X, MessageCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/properties", label: "Properties" },
    { href: "/partnerships", label: "Partnerships" },
  ]

  const aboutLinks = [
    { href: "/about", label: "About Us" },
    { href: "/team", label: "Executive Management" },
  ]

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    setMobileAboutOpen(false)
  }

  useEffect(() => {
    closeMobileMenu()
  }, [pathname])

  return (
    <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
            <Image src="/logo.png" alt="Manzilini" width={150} height={200} />
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 outline-none"
                >
                  About
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {aboutLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
              <Link href="/landlords/register">
                Access as landlord
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={() => {
              if (mobileMenuOpen) {
                setMobileAboutOpen(false)
              }
              setMobileMenuOpen(!mobileMenuOpen)
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            mobileMenuOpen ? "max-h-[32rem] opacity-100 border-t border-border py-4" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!mobileMenuOpen}
        >
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}
            <div className="space-y-2">
              <button
                type="button"
                className="w-full py-2 text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center justify-between"
                onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                aria-expanded={mobileAboutOpen}
              >
                <span>About</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileAboutOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileAboutOpen && (
                <div className="pl-4 ml-1 border-l border-border flex flex-col gap-3">
                  {aboutLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      onClick={closeMobileMenu}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" asChild className="w-full hover:bg-primary/10">
                <Link href="/contact" className="flex items-center gap-2 justify-center" onClick={closeMobileMenu}>
                  <MessageCircle className="w-4 h-4" />
                  Contact Us
                </Link>
              </Button>
              <Button size="sm" asChild className="w-full bg-primary hover:bg-primary/90 shadow-md">
                <Link href="/landlords/register" className="flex items-center justify-center" onClick={closeMobileMenu}>
                  Access as landlord
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
