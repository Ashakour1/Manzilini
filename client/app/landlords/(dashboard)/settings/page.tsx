"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/store/authStore"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function LandlordSettingsPage() {
  const { user } = useAuthStore()

  return (
    <div className="p-5 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          Settings
        </h1>
        <p className="text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-gray-200/80 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Profile Information</CardTitle>
            <CardDescription className="text-xs">Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-gray-600">Full Name</Label>
              <Input id="name" defaultValue={user?.name || ""} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-gray-600">Email Address</Label>
              <Input id="email" type="email" defaultValue={user?.email || ""} disabled className="h-9 text-sm bg-gray-50" />
            </div>
            <Button className="w-full bg-[#2a6f97] hover:bg-[#235d7f] text-white shadow-sm text-xs">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-200/80 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Security</CardTitle>
            <CardDescription className="text-xs">Manage your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current-password" className="text-xs text-gray-600">Current Password</Label>
              <Input id="current-password" type="password" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-xs text-gray-600">New Password</Label>
              <Input id="new-password" type="password" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs text-gray-600">Confirm New Password</Label>
              <Input id="confirm-password" type="password" className="h-9 text-sm" />
            </div>
            <Button className="w-full bg-[#2a6f97] hover:bg-[#235d7f] text-white shadow-sm text-xs">
              Update Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
