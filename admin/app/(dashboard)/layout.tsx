"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { useAuthStore } from "@/store/authStore"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, isHydrated, user } = useAuthStore();
  const router = useRouter();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.replace("/");
    }
  }, [isHydrated, isLoggedIn, router]);

  // Don't render dashboard if user is not logged in (will redirect)
  if (!isHydrated || !isLoggedIn) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <DashboardSidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
        <DashboardHeader />
        <div className="flex-1 overflow-y-auto bg-white">{children}</div>
      </div>
    </div>
  )
}
