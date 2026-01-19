"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  Search,
  Mail,
  Eye,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertCircle,
  Filter,
  X,
  Plus,
} from "lucide-react"
import { SendEmailDialog } from "@/components/dashboard/send-email-dialog"
import { getEmailLogs, getEmailStats, type EmailLog, type EmailStats } from "@/services/email-logs.service"
import { useToast } from "@/components/ui/use-toast"

type EmailType = "WELCOME" | "PASSWORD_RESET" | "VERIFICATION" | "LANDLORD_APPROVAL" | "LANDLORD_REJECTION" | "LANDLORD_INACTIVE" | "LANDLORD_ACTIVATION" | "TENANT_REQUEST" | "NOTIFICATION" | "USER_CREDENTIALS" | "USER_ACTIVATION" | "USER_DEACTIVATION"
type EmailStatus = "SENT" | "FAILED" | "PENDING"

const emailTypeLabels: Record<EmailType, string> = {
  WELCOME: "Welcome",
  PASSWORD_RESET: "Password Reset",
  VERIFICATION: "Verification",
  LANDLORD_APPROVAL: "Landlord Approval",
  LANDLORD_REJECTION: "Landlord Rejection",
  LANDLORD_INACTIVE: "Landlord Inactive",
  LANDLORD_ACTIVATION: "Landlord Activation",
  TENANT_REQUEST: "Tenant Request",
  NOTIFICATION: "Notification",
  USER_CREDENTIALS: "User Credentials",
  USER_ACTIVATION: "User Activation",
  USER_DEACTIVATION: "User Deactivation",
}

export function EmailLogsPage() {
  const { toast } = useToast()
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false)
  const itemsPerPage = 50

  useEffect(() => {
    // Check for landlordId in URL params
    const params = new URLSearchParams(window.location.search)
    const landlordIdParam = params.get("landlordId")
    if (landlordIdParam) {
      setFilterType("all") // Reset filters when viewing landlord-specific logs
      setFilterStatus("all")
      // landlordId will be used in loadEmailLogs
    }
    loadEmailLogs()
    loadStats()
  }, [currentPage, filterType, filterStatus])

  // Get landlordId from URL params
  const getLandlordIdFromUrl = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      return params.get("landlordId")
    }
    return null
  }

  const loadEmailLogs = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      }
      if (filterType !== "all") {
        params.emailType = filterType
      }
      if (filterStatus !== "all") {
        params.status = filterStatus
      }
      if (searchTerm) {
        params.recipientEmail = searchTerm
      }

      // Add landlordId from URL if present
      const landlordId = getLandlordIdFromUrl()
      if (landlordId) {
        params.landlordId = landlordId
      }

      const data = await getEmailLogs(params)
      setEmailLogs(data.emailLogs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load email logs")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load email logs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await getEmailStats()
      setStats(data)
    } catch (err) {
      console.error("Failed to load email stats:", err)
    }
  }

  const handleViewLog = (log: EmailLog) => {
    setSelectedLog(log)
    setViewDialogOpen(true)
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadEmailLogs()
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterType("all")
    setFilterStatus("all")
    setCurrentPage(1)
  }

  const filteredLogs = useMemo(() => {
    if (!searchTerm && filterType === "all" && filterStatus === "all") {
      return emailLogs
    }
    return emailLogs.filter((log) => {
      const matchesSearch = !searchTerm || 
        log.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.subject.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === "all" || log.emailType === filterType
      const matchesStatus = filterStatus === "all" || log.status === filterStatus
      return matchesSearch && matchesType && matchesStatus
    })
  }, [emailLogs, searchTerm, filterType, filterStatus])

  const totalPages = Math.ceil((stats?.total || 0) / itemsPerPage)

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Email Logs</h1>
          <p className="text-xs text-muted-foreground">View and manage all sent emails</p>
        </div>
        <Button
          onClick={() => setSendEmailDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Send Email
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-2 md:grid-cols-4">
          <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Total Emails</CardTitle>
              <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
                <Mail className="h-3 w-3 text-[#2a6f97]" />
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold text-foreground">{stats.total}</div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">All time emails</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Sent</CardTitle>
              <div className="rounded-lg bg-green-100 p-1.5">
                <CheckCircle2 className="h-3 w-3 text-green-700" />
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold text-green-700">{stats.sent}</div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Successfully sent</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Failed</CardTitle>
              <div className="rounded-lg bg-red-100 p-1.5">
                <XCircle className="h-3 w-3 text-red-700" />
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold text-red-700">{stats.failed}</div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Failed deliveries</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Success Rate</CardTitle>
              <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
                <Send className="h-3 w-3 text-[#2a6f97]" />
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold text-foreground">
                {stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0}%
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Delivery success</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Email Logs</CardTitle>
              <CardDescription className="mt-1">View all sent email messages</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-10 pl-10 transition-all focus:border-[#2a6f97] focus:ring-[#2a6f97]"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Email Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="WELCOME">Welcome</SelectItem>
                <SelectItem value="PASSWORD_RESET">Password Reset</SelectItem>
                <SelectItem value="VERIFICATION">Verification</SelectItem>
                <SelectItem value="LANDLORD_APPROVAL">Landlord Approval</SelectItem>
                <SelectItem value="LANDLORD_REJECTION">Landlord Rejection</SelectItem>
                <SelectItem value="LANDLORD_INACTIVE">Landlord Inactive</SelectItem>
                <SelectItem value="LANDLORD_ACTIVATION">Landlord Activation</SelectItem>
                <SelectItem value="TENANT_REQUEST">Tenant Request</SelectItem>
                <SelectItem value="NOTIFICATION">Notification</SelectItem>
                <SelectItem value="USER_CREDENTIALS">User Credentials</SelectItem>
                <SelectItem value="USER_ACTIVATION">User Activation</SelectItem>
                <SelectItem value="USER_DEACTIVATION">User Deactivation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || filterType !== "all" || filterStatus !== "all") && (
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <Empty>
              <Mail className="h-8 w-8 text-muted-foreground" />
              <EmptyHeader>
                <EmptyTitle>No email logs found</EmptyTitle>
                <EmptyDescription>
                  {searchTerm || filterType !== "all" || filterStatus !== "all"
                    ? "Try adjusting your filters"
                    : "No emails have been sent yet"}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 bg-muted/30 hover:bg-muted/30">
                      <TableHead className="h-12 font-semibold text-foreground">Recipient</TableHead>
                      <TableHead className="h-12 font-semibold text-foreground">Subject</TableHead>
                      <TableHead className="h-12 font-semibold text-foreground">Type</TableHead>
                      <TableHead className="h-12 font-semibold text-foreground">Status</TableHead>
                      <TableHead className="h-12 font-semibold text-foreground">Landlord</TableHead>
                      <TableHead className="h-12 font-semibold text-foreground">
                        <button
                          className="flex items-center gap-2 transition-colors hover:text-[#2a6f97]"
                        >
                          Sent At
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </TableHead>
                      <TableHead className="h-12 text-right font-semibold text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="border-b border-border/30 transition-colors hover:bg-muted/20"
                      >
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-[#2a6f97]" />
                              <span className="text-sm font-medium text-foreground">{log.recipientEmail}</span>
                            </div>
                            {log.recipientName && (
                              <span className="text-xs text-muted-foreground">{log.recipientName}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm">{log.subject}</span>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant="outline" className="font-medium">
                            {emailTypeLabels[log.emailType] || log.emailType}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          {log.status === "SENT" ? (
                            <Badge variant="default" className="gap-1.5 bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Sent
                            </Badge>
                          ) : log.status === "FAILED" ? (
                            <Badge variant="destructive" className="gap-1.5">
                              <XCircle className="h-3 w-3" />
                              Failed
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1.5">
                              <Clock className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          {log.landlord ? (
                            <div className="space-y-1">
                              <span className="text-sm font-medium">{log.landlord.name}</span>
                              <div className="text-xs text-muted-foreground">{log.landlord.email}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            <span className="text-[10px]">
                              {new Date(log.createdAt).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewLog(log)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{emailLogs.length}</span> of{" "}
                    <span className="font-medium text-foreground">{stats?.total || 0}</span> emails
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-9 px-4 transition-colors"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-9 px-4 transition-colors"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Email Log Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Log Details</DialogTitle>
            <DialogDescription>View complete email message details</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Recipient Email</Label>
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedLog.recipientEmail}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Recipient Name</Label>
                  <p className="p-2 rounded-md bg-muted text-sm">
                    {selectedLog.recipientName || "-"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <p className="p-2 rounded-md bg-muted text-sm">{selectedLog.subject}</p>
                </div>
                <div className="space-y-2">
                  <Label>Email Type</Label>
                  <Badge variant="outline" className="p-2">
                    {emailTypeLabels[selectedLog.emailType] || selectedLog.emailType}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  {selectedLog.status === "SENT" ? (
                    <Badge variant="default" className="gap-1.5 bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Sent
                    </Badge>
                  ) : selectedLog.status === "FAILED" ? (
                    <Badge variant="destructive" className="gap-1.5">
                      <XCircle className="h-3 w-3" />
                      Failed
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1.5">
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Sent At</Label>
                  <p className="p-2 rounded-md bg-muted text-sm">
                    {new Date(selectedLog.createdAt).toLocaleString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {selectedLog.landlord && (
                <div className="space-y-2">
                  <Label>Related Landlord</Label>
                  <div className="p-3 rounded-md bg-muted space-y-1">
                    <p className="text-sm font-medium">{selectedLog.landlord.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedLog.landlord.email}</p>
                  </div>
                </div>
              )}

              {selectedLog.errorMessage && (
                <div className="space-y-2">
                  <Label className="text-destructive">Error Message</Label>
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{selectedLog.errorMessage}</p>
                  </div>
                </div>
              )}

              {selectedLog.resendId && (
                <div className="space-y-2">
                  <Label>Resend Message ID</Label>
                  <p className="p-2 rounded-md bg-muted text-sm font-mono text-xs">{selectedLog.resendId}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Email Message Content</Label>
                <div className="p-4 rounded-md bg-muted max-h-96 overflow-y-auto border">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedLog.message }}
                  />
                </div>
              </div>

              {selectedLog.metadata && (
                <div className="space-y-2">
                  <Label>Metadata</Label>
                  <pre className="p-3 rounded-md bg-muted text-xs overflow-x-auto">
                    {JSON.stringify(JSON.parse(selectedLog.metadata), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <SendEmailDialog
        open={sendEmailDialogOpen}
        onOpenChange={setSendEmailDialogOpen}
        onSuccess={() => {
          loadEmailLogs()
          loadStats()
        }}
      />
    </div>
  )
}
