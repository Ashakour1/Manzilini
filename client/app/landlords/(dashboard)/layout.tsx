"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LandlordSidebar } from "@/components/dashboard/landlord-sidebar"
import { LandlordHeader } from "@/components/dashboard/landlord-header"
import { useAuthStore } from "@/store/authStore"

export default function LandlordDashboardLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, isHydrated, user } = useAuthStore();
  const router = useRouter();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.replace("/landlords/login");
    }
  }, [isHydrated, isLoggedIn, router]);

  // Redirect non-landlord users
  useEffect(() => {
    if (isHydrated && user && user.role?.toUpperCase() !== "LANDLORD") {
      router.replace("/");
    }
  }, [isHydrated, user, router]);

  // Don't render dashboard if user is not logged in or not a landlord (will redirect)
  if (!isHydrated || !isLoggedIn || user?.role?.toUpperCase() !== "LANDLORD") {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <LandlordSidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden bg-gray-50/60">
        <LandlordHeader />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
