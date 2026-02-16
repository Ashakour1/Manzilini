"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutGrid, 
  Building2, 
  FileText, 
  ClipboardList,
  Settings, 
  LogOut, 
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/authStore"
import { useMemo, useState, useEffect } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import Image from "next/image"

const menuItems = [
  { id: "dashboard", icon: LayoutGrid, label: "Dashboard", href: "/landlords/dashboard" },
  { id: "properties", icon: Building2, label: "My Properties", href: "/landlords/properties" },
  { id: "applications", icon: ClipboardList, label: "Applications", href: "/landlords/applications" },
  { id: "documents", icon: FileText, label: "Documents", href: "/landlords/documents" },
  { id: "settings", icon: Settings, label: "Settings", href: "/landlords/settings" },
]

export function LandlordSidebar() {
  const pathname = usePathname()
  const { user, logout, isHydrated } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)

    try {
      const API_URL = "http://localhost:4000/api/v1"
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to logout')
      }
      logout()
      window.location.href = '/'
    } catch (error) {
      console.error('Error logging out:', error)
      logout()
      window.location.href = '/'
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return 'L'
  }

  const avatarSrc = useMemo(() => {
    const initials = getUserInitials()
    const displayName = user?.name || "Landlord"
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2a6f97"/>
      <stop offset="1" stop-color="#3a7fa7"/>
    </linearGradient>
  </defs>
  <rect width="96" height="96" rx="48" fill="url(#g)"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
    font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
    font-size="34" font-weight="700" fill="white" letter-spacing="1">${initials}</text>
  <title>${displayName.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</title>
</svg>`
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  }, [user?.name, user?.email])

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      {/* Brand Header */}
      <div className="px-4 pt-4 pb-4">
        <Link href="/" onClick={onLinkClick}>
          <Image src="/icon-logo.png" alt="Manzilini" width={100} height={100} />
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pt-1">
        {menuItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onLinkClick}
              className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-all duration-150 ${
                active
                  ? "bg-[#2a6f97]/8 text-[#2a6f97] font-semibold shadow-sm"
                  : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#2a6f97]" />
              )}
              <item.icon 
                className={`h-4 w-4 flex-shrink-0 transition-colors ${
                  active ? "text-[#2a6f97]" : "text-gray-400 group-hover:text-gray-600"
                }`} 
              />
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-100 px-2 py-3 space-y-2">
        <div className="flex items-center gap-2.5 px-1">
          <Avatar className="h-8 w-8 border border-gray-200 shadow-sm">
            <AvatarImage src={avatarSrc} alt={user?.name || "Landlord"} />
            <AvatarFallback className="bg-[#2a6f97] text-white text-xs font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {user?.name || "Landlord"}
            </p>
            <p className="text-[10px] text-gray-400 truncate">
              {user?.email || "Landlord"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full justify-start gap-2 rounded-lg px-2.5 py-2 text-xs text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="flex-1 text-left truncate">{isLoggingOut ? "Logging out..." : "Log out"}</span>
        </Button>
      </div>
    </>
  )

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-50 lg:hidden rounded-lg bg-white shadow-md border border-gray-200 hover:bg-gray-50"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </Button>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-0 bg-white">
            <div className="flex h-full flex-col">
              <SidebarContent onLinkClick={() => setIsMobileMenuOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Desktop sidebar
  return (
    <aside className="relative hidden lg:flex h-screen w-48 flex-col overflow-hidden border-r border-gray-200 bg-white">
      <SidebarContent />
    </aside>
  )
}
