"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit,
  Mail,
  Shield,
  User,
  Calendar,
  Building2,
  FileText,
  UserCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserById } from "@/services/users.service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type User = {
  id: string
  name: string
  email: string
  role: string
  image?: string
  createdAt?: string
  updatedAt?: string
  agentId?: string | null
  agent?: {
    id: string
    name: string
    email: string
    phone?: string
    image?: string
  } | null
  _count?: {
    property_applications: number
    properties?: number
  }
}

const getRoleBadgeVariant = (role: string) => {
  const upperRole = role.toUpperCase()
  if (upperRole === "ADMIN") return "destructive"
  if (upperRole === "LANDLORD") return "default"
  if (upperRole === "AGENT") return "secondary"
  return "outline"
}

const getUserInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getUserById(userId)
        setUser(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [userId])

  if (isLoading)
    return (
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="space-y-4 w-full max-w-2xl">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </main>
    )

  if (error) {
    return (
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="flex-1 p-3 sm:p-4 lg:p-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="px-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">User Details</h1>
              <p className="text-sm text-muted-foreground">View complete information about this user</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Basic details about the user</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  {user.image ? (
                    <Avatar className="h-24 w-24 border-2 border-[#2a6f97]">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback className="bg-[#2a6f97] text-white text-xl font-semibold">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-24 w-24 rounded-full border-2 border-[#2a6f97] bg-[#2a6f97]/10 flex items-center justify-center">
                      <User className="h-12 w-12 text-[#2a6f97]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                    <div className="mt-2">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="font-medium">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">Email</span>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-6">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">Role</span>
                    </div>
                    <div className="pl-6">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="font-medium">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>User activity and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <FileText className="h-5 w-5 text-[#2a6f97]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Property Applications
                      </p>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {user._count?.property_applications || 0}
                      </p>
                    </div>
                  </div>

                  {user._count?.properties !== undefined && (
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Building2 className="h-5 w-5 text-[#2a6f97]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Properties
                        </p>
                        <p className="mt-1 text-2xl font-bold text-foreground">
                          {user._count.properties || 0}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Agent Assignment Card */}
            {user.agent && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Field Agent</CardTitle>
                  <CardDescription>Field agent assigned to this user</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    {user.agent.image ? (
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.agent.image} alt={user.agent.name} />
                        <AvatarFallback className="bg-[#2a6f97] text-white">
                          {getUserInitials(user.agent.name)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-[#2a6f97]/10 flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-[#2a6f97]" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{user.agent.name}</p>
                      <p className="text-sm text-muted-foreground">{user.agent.email}</p>
                      {user.agent.phone && (
                        <p className="text-sm text-muted-foreground">{user.agent.phone}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/field-agents/${user.agent?.id}`)}
                    >
                      View Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Created</span>
                  </div>
                  <p className="text-sm font-medium text-foreground pl-6">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>

                {user.updatedAt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Last Updated</span>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-6">
                      {new Date(user.updatedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span>Profile Image</span>
                  </div>
                  <Badge variant={user.image ? "default" : "secondary"} className="ml-6">
                    {user.image ? "Uploaded" : "Not uploaded"}
                  </Badge>
                </div>

                {user.agentId && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Agent Assigned</span>
                    </div>
                    <Badge variant="default" className="ml-6">
                      Yes
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/users`)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to List
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

