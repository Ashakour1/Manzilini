"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/partnerships", label: "Partnerships" },
  { href: "/contact", label: "Contact" },
]

const aboutLinks = [
  { href: "/about", label: "About Us" },
  { href: "/team", label: "Executive Management" },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    setMobileAboutOpen(false)
  }

  useEffect(() => {
    closeMobileMenu()
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname?.startsWith(href)
  }
  const isAboutActive = aboutLinks.some((l) => pathname?.startsWith(l.href))

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/80 bg-background/85 backdrop-blur-md shadow-sm"
          : "border-b border-transparent bg-background/60 backdrop-blur"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            onClick={closeMobileMenu}
          >
            <Image src="/logo.png" alt="Manzilini" width={140} height={40} priority />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "text-primary"
                      : "text-foreground/80 hover:text-primary"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </Link>
              )
            })}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`relative inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors outline-none ${
                    isAboutActive
                      ? "text-primary"
                      : "text-foreground/80 hover:text-primary"
                  }`}
                >
                  About
                  <ChevronDown className="h-3.5 w-3.5 transition-transform data-[state=open]:rotate-180" />
                  {isAboutActive && (
                    <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl">
                {aboutLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild className="rounded-lg">
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="rounded-full">
              <Link href="https://manage.manzilini.com/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="gap-1.5 rounded-full shadow-sm">
              <Link href="https://manage.manzilini.com/signup">
                List a Property
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            onClick={() => {
              if (mobileMenuOpen) setMobileAboutOpen(false)
              setMobileMenuOpen(!mobileMenuOpen)
            }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            mobileMenuOpen
              ? "max-h-[32rem] opacity-100 border-t border-border py-4"
              : "max-h-0 opacity-0"
          }`}
          aria-hidden={!mobileMenuOpen}
        >
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              )
            })}

            <div>
              <button
                type="button"
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isAboutActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
                onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                aria-expanded={mobileAboutOpen}
              >
                <span>About</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    mobileAboutOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  mobileAboutOpen ? "max-h-40 mt-1" : "max-h-0"
                }`}
              >
                <div className="ml-3 flex flex-col gap-0.5 border-l border-border pl-3">
                  {aboutLinks.map((link) => {
                    const active = pathname?.startsWith(link.href)
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`rounded-lg px-2 py-1.5 text-sm transition-colors ${
                          active
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={closeMobileMenu}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <Button variant="outline" size="sm" asChild className="w-full rounded-xl">
                <Link
                  href="https://manage.manzilini.com/login"
                  className="flex items-center justify-center"
                  onClick={closeMobileMenu}
                >
                  Sign in
                </Link>
              </Button>
              <Button size="sm" asChild className="w-full gap-1.5 rounded-xl shadow-sm">
                <Link
                  href="https://manage.manzilini.com/signup"
                  className="flex items-center justify-center"
                  onClick={closeMobileMenu}
                >
                  List a Property
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
