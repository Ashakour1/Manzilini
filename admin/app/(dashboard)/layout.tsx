"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { useAuthStore } from "@/store/authStore"
import { getDashboardPath, canAccessRoute } from "@/lib/role-utils"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, isHydrated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.replace("/");
      return;
    }

    // If logged in, check role and redirect to appropriate dashboard
    if (isHydrated && isLoggedIn && user) {
      const role = user.role?.toUpperCase();
      
      // Redirect agents to agent login
      if (role === "AGENT") {
        router.replace("/agent-login");
        return;
      }

      // Handle ADMIN users
      if (role === "ADMIN") {
        // Get the appropriate dashboard path based on role
        const dashboardPath = getDashboardPath(user.role);
        
        // If user is on root dashboard or old routes, redirect to admin dashboard
        if (pathname === "/dashboard" || (!pathname.startsWith("/admin/") && pathname.startsWith("/"))) {
          router.replace(dashboardPath);
          return;
        }

        // Check if user has access to current route
        if (!canAccessRoute(user.role, pathname)) {
          // Redirect to their dashboard if they don't have access
          router.replace(dashboardPath);
          return;
        }
      } 
      // Handle SUPER_ADMIN users
      else if (role === "SUPER_ADMIN") {
        // Get the appropriate dashboard path based on role
        const dashboardPath = getDashboardPath(user.role);
        
        // If user is on admin dashboard, redirect to /dashboard
        if (pathname === "/admin/dashboard") {
          router.replace(dashboardPath);
          return;
        }

        // Check if user has access to current route
        if (!canAccessRoute(user.role, pathname)) {
          // Redirect to their dashboard if they don't have access
          router.replace(dashboardPath);
          return;
        }
      } else {
        // Non-admin users should not access admin routes - redirect to home
        if (pathname.startsWith("/admin/")) {
          router.replace("/");
          return;
        }
      }
    }
  }, [isHydrated, isLoggedIn, user, router, pathname]);

  // Don't render dashboard if user is not logged in (will redirect)
  if (!isHydrated || !isLoggedIn) {
    return null;
  }

  // Don't render if user doesn't have access (will redirect)
  // Only check for ADMIN and SUPER_ADMIN users
  if (user) {
    const role = user.role?.toUpperCase();
    if (role === "ADMIN" && !canAccessRoute(user.role, pathname)) {
      return null;
    }
    if (role === "SUPER_ADMIN" && !canAccessRoute(user.role, pathname)) {
      return null;
    }
    // Non-admin users should not access admin routes
    if (role !== "ADMIN" && role !== "SUPER_ADMIN" && pathname.startsWith("/admin/")) {
      return null;
    }
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
