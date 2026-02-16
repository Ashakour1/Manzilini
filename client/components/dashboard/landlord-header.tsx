'use client'

import { Bell, HelpCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function LandlordHeader() {
  const pathname = usePathname()

  const getPageTitle = () => {
    const routes: Record<string, string> = {
      '/landlords/dashboard': 'Dashboard',
      '/landlords/properties': 'My Properties',
      '/landlords/applications': 'Applications',
      '/landlords/documents': 'Documents',
      '/landlords/settings': 'Settings',
    }
    
    for (const [path, title] of Object.entries(routes)) {
      if (pathname === path || pathname.startsWith(`${path}/`)) {
        return title
      }
    }
    return 'Dashboard'
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-5">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-semibold text-gray-900">
            {getPageTitle()}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            title="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            title="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </Button>
        </div>
      </div>
    </header>
  )
}
