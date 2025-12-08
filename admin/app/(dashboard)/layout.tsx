import type { ReactNode } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
