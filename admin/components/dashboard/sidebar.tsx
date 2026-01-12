"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutGrid, 
  Building2, 
  Users, 
  CreditCard, 
  Wrench, 
  FileText, 
  BarChart3, 
  Settings, 
  UserCheck, 
  LogOut, 
  Shield, 
  MapPin,
  Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/authStore"
import { API_URL } from "@/lib/api"
import { useMemo, useState, useEffect } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import Image from "next/image"

const menuItems = [
  { id: "dashboard", icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
  { id: "properties", icon: Building2, label: "Properties", href: "/properties" },
  { id: "landlords", icon: UserCheck, label: "Landlords", href: "/landlords" },
  { id: "tenants", icon: Users, label: "Tenants", href: "/tenants" },
  { id: "field-agents", icon: MapPin, label: "Field Agents", href: "/field-agents" },
  { id: "users", icon: Shield, label: "Users", href: "/users" },
  { id: "payments", icon: CreditCard, label: "Payments", href: "/payments" },
  { id: "maintenance", icon: Wrench, label: "Maintenance", href: "/maintenance" },
  { id: "documents", icon: FileText, label: "Documents", href: "/documents" },
  { id: "reports", icon: BarChart3, label: "Reports", href: "/reports" },
  { id: "settings", icon: Settings, label: "Settings", href: "/settings" },
]

export function DashboardSidebar() {
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
    return 'U'
  }

  const getUserRole = () => {
    return user?.role || "Admin"
  }

  // Filter menu items based on user role
  const filteredMenuItems = useMemo(() => {
    // Default to most restrictive view (AGENT) until role is loaded
    // This prevents showing all items briefly before filtering
    if (!isHydrated || !user?.role) {
      // Return AGENT view (most restrictive) while loading
      return menuItems.filter(item => 
        item.id === "properties" || item.id === "landlords"
      )
    }
    
    // const userRole = user.role.toUpperCase()
    
    // if (userRole === "AGENT") {
    //   // AGENT role only sees Properties and Landlords
    //   return menuItems.filter(item => 
    //     item.id === "properties" || item.id === "landlords"
    //   )
    // }
    
    // All other roles see all menu items
    return menuItems
  }, [user?.role, isHydrated])

  const avatarSrc = useMemo(() => {
    const initials = getUserInitials()
    const displayName = user?.name || "User"
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
       <Image src="/logo.png" alt="Manzilini" width={100} height={100} />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2">
        {filteredMenuItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onLinkClick}
              className={`group relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors ${
                active
                  ? "bg-blue-50 text-[#2a6f97] font-medium"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon 
                className={`h-4 w-4 flex-shrink-0 ${
                  active ? "text-[#2a6f97]" : "text-gray-500 group-hover:text-gray-700"
                }`} 
              />
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 px-2 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border border-gray-200">
            <AvatarImage src={avatarSrc} alt={user?.name || "User"} />
            <AvatarFallback className="bg-[#2a6f97] text-white text-xs font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-gray-500 truncate">
              {user?.role || "Admin"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full justify-start gap-2 rounded-lg px-2.5 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-4 w-4 text-gray-500" />
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
