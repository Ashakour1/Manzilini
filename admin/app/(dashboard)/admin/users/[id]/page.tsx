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

export default function AdminUserDetailsPage() {
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
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/users")} className="px-0">
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
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/users")} className="px-0">
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/users")} className="px-0">
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
          <div className="lg:col-span-2 space-y-6">
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
          </div>

          <div className="space-y-6">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
