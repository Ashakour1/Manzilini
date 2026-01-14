"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AgentSidebar } from "@/components/dashboard/agent-sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { useAuthStore } from "@/store/authStore"

export default function AgentLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, isHydrated, user } = useAuthStore();
  const router = useRouter();

  // Redirect unauthenticated users to agent login
  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.replace("/agent-login");
    }
  }, [isHydrated, isLoggedIn, router]);

  // Redirect non-agents to admin login
  useEffect(() => {
    if (isHydrated && isLoggedIn && user) {
      const role = user.role?.toUpperCase();
      if (role !== "AGENT") {
        router.replace("/");
      }
    }
  }, [isHydrated, isLoggedIn, user, router]);

  // Don't render dashboard if user is not logged in or not an agent (will redirect)
  if (!isHydrated || !isLoggedIn || user?.role?.toUpperCase() !== "AGENT") {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <AgentSidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
        <DashboardHeader />
        <div className="flex-1 overflow-y-auto bg-white">{children}</div>
      </div>
    </div>
  )
}
