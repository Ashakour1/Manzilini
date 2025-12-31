"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Lock, User, BarChart3 } from "lucide-react"

export function SettingsPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-background p-3 sm:p-4 lg:p-5">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-xs text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Account Settings */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#2a6f97]" />
              <div>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Full Name</label>
              <input
                type="text"
                placeholder="John Manager"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Email</label>
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Phone</label>
              <input
                type="tel"
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <Button className="bg-[#2a6f97] hover:bg-[#2a6f97]/90">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#2a6f97]" />
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password and security settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Current Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">New Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Confirm Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">Update Password</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#2a6f97]" />
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Payment Reminders</p>
                <p className="text-sm text-muted-foreground">Get notified when rent is due</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Maintenance Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified of maintenance requests</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Lease Expiry</p>
                <p className="text-sm text-muted-foreground">Get notified of expiring leases</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">Save Preferences</Button>
          </CardContent>
        </Card>

        {/* Reporting Settings */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#2a6f97]" />
              <div>
                <CardTitle>Reports</CardTitle>
                <CardDescription>Manage automated report generation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Monthly Report Email</label>
              <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Report Frequency</label>
              <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Annually</option>
              </select>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">Save Settings</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
