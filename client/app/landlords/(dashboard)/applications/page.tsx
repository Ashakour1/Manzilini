"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuthStore } from "@/store/authStore"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ClipboardList,
  User,
  Phone,
  Mail,
  MessageSquare,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react"
import {
  getPropertyApplicationsByLandlord,
  updatePropertyApplicationStatus,
  type PropertyApplication,
} from "@/services/property-applications.service"
import { getLandlordIdFromProperties } from "@/services/landlords.service"

type StatusFilter = "ALL" | "PENDING" | "CONTACTED" | "APPROVED" | "REJECTED" | "CLOSED"

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CLOSED", label: "Closed" },
]

function getStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200"
    case "CONTACTED":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-200"
    case "CLOSED":
      return "bg-gray-100 text-gray-600 border-gray-200"
    default:
      return "bg-gray-100 text-gray-600 border-gray-200"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "PENDING":
      return <Clock className="h-3 w-3" />
    case "CONTACTED":
      return <Phone className="h-3 w-3" />
    case "APPROVED":
      return <CheckCircle2 className="h-3 w-3" />
    case "REJECTED":
      return <XCircle className="h-3 w-3" />
    case "CLOSED":
      return <Eye className="h-3 w-3" />
    default:
      return <Clock className="h-3 w-3" />
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function LandlordApplicationsPage() {
  const { user, isLoggedIn } = useAuthStore()
  const [applications, setApplications] = useState<PropertyApplication[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [landlordId, setLandlordId] = useState<string | null>(null)
  const [isLoadingLandlordId, setIsLoadingLandlordId] = useState(true)

  // Fetch landlord ID first
  useEffect(() => {
    const fetchLandlordId = async () => {
      if (!isLoggedIn || !user?.token) return
      setIsLoadingLandlordId(true)
      try {
        const id = await getLandlordIdFromProperties(user.token)
        setLandlordId(id)
      } catch (err) {
        console.error("Failed to get landlord ID:", err)
        setError("Unable to load your landlord profile")
      } finally {
        setIsLoadingLandlordId(false)
      }
    }
    fetchLandlordId()
  }, [isLoggedIn, user?.token])

  const fetchApplications = useCallback(async () => {
    if (!isLoggedIn || !user?.token || !landlordId) return
    setIsLoading(true)
    setError(null)

    try {
      const filterStatus = statusFilter === "ALL" ? undefined : statusFilter
      const data = await getPropertyApplicationsByLandlord(landlordId, user.token, filterStatus)
      setApplications(data)
    } catch (err: any) {
      setError(err.message || "Failed to load applications")
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, user?.token, landlordId, statusFilter])

  useEffect(() => {
    if (landlordId && !isLoadingLandlordId) {
      fetchApplications()
    }
  }, [fetchApplications, landlordId, isLoadingLandlordId])

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: string
  ) => {
    if (!user?.token) return
    setUpdatingId(applicationId)

    try {
      const updated = await updatePropertyApplicationStatus(applicationId, user.token, {
        status: newStatus,
      })
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? updated : app))
      )
    } catch (err: any) {
      console.error("Failed to update application:", err)
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const hasApplications = applications && applications.length > 0

  // Status counts
  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="p-5 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Property Applications
          </h1>
          <p className="text-sm text-gray-500">
            Review and manage tenant applications for your properties
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchApplications}
          disabled={isLoading}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {hasApplications && (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
          {(["PENDING", "CONTACTED", "APPROVED", "REJECTED", "CLOSED"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() =>
                  setStatusFilter((prev) => (prev === status ? "ALL" : status))
                }
                className={`rounded-lg border p-3 text-left transition-all ${
                  statusFilter === status
                    ? "ring-2 ring-[#2a6f97] border-[#2a6f97]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(status)}
                  <span className="text-xs font-medium text-gray-500 capitalize">
                    {status.toLowerCase()}
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {statusCounts[status] || 0}
                </p>
              </button>
            )
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              statusFilter === option.value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <Card className="border-gray-200/80 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Applications</CardTitle>
          <CardDescription className="text-xs">
            {statusFilter === "ALL"
              ? `Showing all ${applications.length} applications`
              : `Showing ${applications.length} ${statusFilter.toLowerCase()} applications`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(isLoading || isLoadingLandlordId) && (
            <div className="py-8 text-center text-gray-500">
              <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin text-gray-400" />
              {isLoadingLandlordId ? "Loading your profile..." : "Loading applications..."}
            </div>
          )}

          {!isLoading && !isLoadingLandlordId && error && (
            <div className="py-8 text-center text-red-500 text-sm">{error}</div>
          )}

          {!isLoading && !isLoadingLandlordId && !landlordId && !error && (
            <div className="py-8 text-center text-gray-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500 mb-1">Unable to load applications</p>
              <p className="text-xs text-gray-400">
                Please ensure you have created at least one property first
              </p>
            </div>
          )}

          {!isLoading && !error && !hasApplications && (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No applications yet</p>
              <p className="text-sm text-gray-400">
                Applications from tenants will appear here
              </p>
            </div>
          )}

          {!isLoading && !error && hasApplications && (
            <div className="space-y-3">
              {applications.map((app) => {
                const isExpanded = expandedId === app.id
                const isUpdating = updatingId === app.id

                return (
                  <div
                    key={app.id}
                    className="rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-sm"
                  >
                    {/* Main Row */}
                    <button
                      onClick={() => toggleExpand(app.id)}
                      className="w-full text-left px-4 py-3 flex items-center gap-4"
                    >
                      {/* Applicant Avatar */}
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {app.fullName}
                          </span>
                          <Badge
                            className={`text-[10px] px-1.5 py-0 border ${getStatusColor(
                              app.status
                            )}`}
                          >
                            {app.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {app.property && (
                            <span className="flex items-center gap-1 truncate">
                              <Building2 className="h-3 w-3" />
                              {app.property.title}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(app.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Expand indicator */}
                      <div className="flex-shrink-0 text-gray-400">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-4 space-y-4">
                        {/* Contact Info */}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{app.phone}</span>
                          </div>
                          {app.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{app.email}</span>
                            </div>
                          )}
                        </div>

                        {/* Message */}
                        {app.message && (
                          <div className="flex items-start gap-2 text-sm text-gray-700">
                            <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                            <p className="leading-relaxed">{app.message}</p>
                          </div>
                        )}

                        {/* Property Details */}
                        {app.property && (
                          <div className="rounded-md border border-gray-200 bg-white p-3">
                            <div className="flex items-center gap-3">
                              {app.property.images &&
                                app.property.images.length > 0 && (
                                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={app.property.images[0].url}
                                      alt={app.property.title}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {app.property.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {app.property.city} &bull; {app.property.address}
                                </p>
                                <p className="text-xs font-medium text-gray-900 mt-0.5">
                                  KES {app.property.price.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Remarks */}
                        {app.remarks && (
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Remarks:</span>{" "}
                            {app.remarks}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {app.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleStatusUpdate(app.id, "CONTACTED")
                                }
                                className="text-xs gap-1.5"
                              >
                                <Phone className="h-3 w-3" />
                                Mark Contacted
                              </Button>
                              <Button
                                size="sm"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleStatusUpdate(app.id, "APPROVED")
                                }
                                className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleStatusUpdate(app.id, "REJECTED")
                                }
                                className="text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <XCircle className="h-3 w-3" />
                                Reject
                              </Button>
                            </>
                          )}
                          {app.status === "CONTACTED" && (
                            <>
                              <Button
                                size="sm"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleStatusUpdate(app.id, "APPROVED")
                                }
                                className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleStatusUpdate(app.id, "REJECTED")
                                }
                                className="text-xs gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <XCircle className="h-3 w-3" />
                                Reject
                              </Button>
                            </>
                          )}
                          {(app.status === "APPROVED" ||
                            app.status === "REJECTED") && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isUpdating}
                              onClick={() =>
                                handleStatusUpdate(app.id, "CLOSED")
                              }
                              className="text-xs gap-1.5"
                            >
                              Close Application
                            </Button>
                          )}
                          {isUpdating && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Updating...
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
