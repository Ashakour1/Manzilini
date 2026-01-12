"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { DashboardContent } from "@/components/dashboard/pages/dashboard-content"

export default function DashboardPage() {
  const { user, isHydrated, logout } = useAuthStore()
  const router = useRouter()

  // Block agents from accessing admin dashboard
  useEffect(() => {
    if (isHydrated && user) {
      const role = user.role?.toUpperCase()
      if (role === "AGENT") {
        logout()
        router.replace("/")
      }
    }
  }, [isHydrated, user, router, logout])

  // Don't render if user is an agent (will redirect)
  if (isHydrated && user?.role?.toUpperCase() === "AGENT") {
    return null
  }

  return <DashboardContent />
}
