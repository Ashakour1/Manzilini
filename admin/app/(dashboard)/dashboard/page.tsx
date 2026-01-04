"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { DashboardContent } from "@/components/dashboard/pages/dashboard-content"

export default function DashboardPage() {
  const { user, isHydrated } = useAuthStore()
  const router = useRouter()

  // Redirect agents to their own dashboard
  useEffect(() => {
    if (isHydrated && user) {
      const role = user.role?.toUpperCase()
      if (role === "AGENT") {
        router.replace("/agent/dashboard")
      }
    }
  }, [isHydrated, user, router])

  // Don't render if user is an agent (will redirect)
  if (isHydrated && user?.role?.toUpperCase() === "AGENT") {
    return null
  }

  return <DashboardContent />
}
