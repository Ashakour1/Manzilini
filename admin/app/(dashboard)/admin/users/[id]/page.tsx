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
  CheckCircle2,
  XCircle,
  Users,
  Clock,
  Hash,
  UserX,
  Phone,
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
  status?: string
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
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push(`/admin/users/${userId}/edit`)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
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

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-4">Account Information</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">User ID</p>
                          <p className="text-sm font-mono text-foreground mt-1 break-all">{user.id}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email Address</p>
                          <a href={`mailto:${user.email}`} className="text-sm font-medium text-primary hover:underline mt-1 block">
                            {user.email}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</p>
                          <div className="mt-1">
                            <Badge variant={getRoleBadgeVariant(user.role)} className="font-medium">
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                        {user.status === "ACTIVE" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account Status</p>
                          <div className="mt-1">
                            <Badge 
                              variant={user.status === "ACTIVE" ? "default" : "secondary"} 
                              className={`font-medium ${
                                user.status === "ACTIVE" 
                                  ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                              }`}
                            >
                              {user.status === "ACTIVE" ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Active
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <XCircle className="h-3 w-3" />
                                  Inactive
                                </span>
                              )}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>User activity and counts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>Properties</span>
                    </div>
                    <p className="text-lg font-bold text-foreground pl-6">{user._count?.properties || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Applications</span>
                    </div>
                    <p className="text-lg font-bold text-foreground pl-6">{user._count?.property_applications || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {user.agent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Assigned Field Agent
                  </CardTitle>
                  <CardDescription>Field agent assigned to this user</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    {user.agent.image ? (
                      <Avatar className="h-16 w-16 border-2 border-primary">
                        <AvatarImage src={user.agent.image} alt={user.agent.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {user.agent.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-foreground">{user.agent.name}</p>
                      <p className="text-sm text-muted-foreground">Field Agent</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${user.agent.email}`} className="text-sm font-medium text-primary hover:underline">
                        {user.agent.email}
                      </a>
                    </div>
                    {user.agent.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${user.agent.phone}`} className="text-sm font-medium text-primary hover:underline">
                          {user.agent.phone}
                        </a>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => router.push(`/admin/field-agents/${user.agentId}`)}
                  >
                    View Agent Details
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>Account creation and updates</CardDescription>
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
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </p>
                </div>
                {user.updatedAt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Last Updated</span>
                    </div>
                    <p className="text-sm font-medium text-foreground pl-6">
                      {new Date(user.updatedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
