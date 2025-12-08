"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutGrid, Building2, Users, CreditCard, Wrench, FileText, BarChart3, Settings, UserCheck, LogOut, User } from "lucide-react"
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

const menuItems = [
  { id: "dashboard", icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
  { id: "properties", icon: Building2, label: "Properties", href: "/properties" },
  { id: "landlords", icon: UserCheck, label: "Landlords", href: "/landlords" },
  { id: "tenants", icon: Users, label: "Tenants", href: "/tenants" },
  { id: "payments", icon: CreditCard, label: "Payments", href: "/payments" },
  { id: "maintenance", icon: Wrench, label: "Maintenance", href: "/maintenance" },
  { id: "documents", icon: FileText, label: "Documents", href: "/documents" },
  { id: "reports", icon: BarChart3, label: "Reports", href: "/reports" },
  { id: "settings", icon: Settings, label: "Settings", href: "/settings" },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
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

  return (
    <aside className="relative flex h-screen w-72 flex-col overflow-hidden border-r border-gray-200 bg-white text-gray-900">
      <div className="relative mb-8 px-5 pt-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-300 bg-gray-50 text-lg font-bold text-gray-900 shadow-sm">
            PM
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">PropManager</p>
            <p className="text-xs text-gray-500">Operating system</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1 px-4">
        {menuItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all ${
                active
                  ? "border-gray-400 bg-gray-100 text-gray-900 shadow-sm"
                  : "border-transparent text-gray-700 hover:-translate-y-0.5 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full transition-all ${
                  active ? "bg-gray-900" : "bg-transparent group-hover:bg-gray-300"
                }`}
              />
              <item.icon className={`h-4 w-4 ${active ? "text-gray-900" : "text-gray-700"}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto px-4 pb-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left hover:bg-gray-50"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt={user?.name || "User"} />
                <AvatarFallback className="bg-gray-900 text-white">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start">
                <p className="text-sm font-semibold text-gray-900">{user?.name || "User"}</p>
                <p className="text-xs text-gray-500">{user?.email || ""}</p>
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
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
