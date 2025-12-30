"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Building2, Users, CreditCard, Wrench, FileText, BarChart3, Settings, UserCheck, LogOut, User, Shield, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/authStore"
import { API_URL } from "@/lib/api"
import { useMemo, useState } from "react"

const menuGroups = [
  {
    title: "Overview",
    items: [
      { id: "dashboard", icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Properties & People",
    items: [
      { id: "properties", icon: Building2, label: "Properties", href: "/properties" },
      { id: "landlords", icon: UserCheck, label: "Landlords", href: "/landlords" },
      { id: "tenants", icon: Users, label: "Tenants", href: "/tenants" },
      { id: "field-agents", icon: MapPin, label: "Field Agents", href: "/field-agents" },
      { id: "users", icon: Shield, label: "Users", href: "/users" },
    ],
  },
  {
    title: "Operations",
    items: [
      { id: "payments", icon: CreditCard, label: "Payments", href: "/payments" },
      { id: "maintenance", icon: Wrench, label: "Maintenance", href: "/maintenance" },
      { id: "documents", icon: FileText, label: "Documents", href: "/documents" },
    ],
  },
  {
    title: "Analytics & Settings",
    items: [
      { id: "reports", icon: BarChart3, label: "Reports", href: "/reports" },
      { id: "settings", icon: Settings, label: "Settings", href: "/settings" },
    ],
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

   function clearAuthCookie() {
    if (typeof document === "undefined") return;
  
    document.cookie = `manzilini=; path=/; max-age=0`;
  }
  
  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)

    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to logout')
      }
      logout()
      clearAuthCookie()
      window.location.href = '/'
    } catch (error) {
      console.error('Error logging out:', error)
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
  <rect width="96" height="96" rx="24" fill="url(#g)"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
    font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
    font-size="34" font-weight="700" fill="white" letter-spacing="1">${initials}</text>
  <title>${displayName.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</title>
</svg>`
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  }, [user?.name, user?.email])

  return (
    <aside className="relative flex h-screen w-72 flex-col overflow-hidden border-r border-[#2a6f97]/20 bg-[#2a6f97] text-white">
      <div className="relative mb-8 px-5 pt-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-lg font-bold text-white">
            MZ
          </div>
          <div>
            <p className="text-sm font-semibold text-white">manzilini</p>
            <p className="text-xs text-white/70">manzilini</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-white/70">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`group relative flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all ${
                      active
                        ? "border-white/30 bg-white/20 text-white"
                        : "border-transparent text-white/80 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full transition-all ${
                        active ? "bg-white" : "bg-transparent group-hover:bg-white/30"
                      }`}
                    />
                    <item.icon className={`h-4 w-4 ${active ? "text-white" : "text-white/70"}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto px-4 pb-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-left hover:bg-white/20 hover:border-white/30 disabled:opacity-70"
              disabled={isLoggingOut}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarSrc} alt={user?.name || "User"} />
                <AvatarFallback className="bg-white/20 text-white border border-white/30">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start">
                <p className="text-sm font-semibold text-white">{user?.name || "User"}</p>
                <p className="text-xs text-white/70">{user?.email || ""}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4 text-[#2a6f97]" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4 text-[#2a6f97]" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
