"use client"

import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Manzilini</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted platform for finding the perfect property. Browse, filter, and connect with landlords easily.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition">
                  Browse Properties
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition">
                  Post Property
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition">
                  My Favorites
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition">
                  My Applications
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/policy" className="text-sm text-muted-foreground hover:text-primary transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                support@manzilini.com
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                1-800-PROPERTY
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
              Kenya, Nairobi
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media */}
        <div className="py-6 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">© 2025 Manzilini. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/profile.php?id=61586517446007" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/manzilinihq/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
