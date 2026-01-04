"use client"

import { useAuthStore } from "@/store/authStore"

export default function AgentDashboardPage() {
  const { user } = useAuthStore()
  const userName = user?.name || "User"

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      <div className="flex h-full items-center p-4">
        <div className="text-start">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome {userName}</h1>
          <p className="text-sm text-gray-500">You are logged in as an agent</p>
          <p className="text-sm text-gray-500">You can manage your properties and tenants here</p>
          
        </div>
      </div>
    </main>
  );
}
