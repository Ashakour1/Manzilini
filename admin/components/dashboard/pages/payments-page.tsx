"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { ArrowUpRight, Calendar, Clock3, DollarSign, Download, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react"
import { payments as initialPayments, type Payment, type PaymentStatus } from "@/lib/data/payments"

type PaymentForm = Omit<Payment, "id">

const emptyPayment: PaymentForm = {
  tenant: "",
  property: "",
  amount: "",
  dueDate: "",
  paymentDate: "",
  status: "Pending",
  method: "",
}

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<PaymentForm>(emptyPayment)

  const pendingPayments = useMemo(
    () => payments.filter((payment) => payment.status !== "Completed"),
    [payments],
  )

  const startCreate = () => {
    setEditingId(null)
    setFormData(emptyPayment)
    setIsDialogOpen(true)
  }

  const startEdit = (payment: Payment) => {
    setEditingId(payment.id)
    const { id, ...rest } = payment
    setFormData({ ...rest, paymentDate: rest.paymentDate ?? "" })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete this payment?")) return
    setPayments((prev) => prev.filter((payment) => payment.id !== id))
  }

  const handleSave = () => {
    if (!formData.tenant.trim() || !formData.property.trim() || !formData.amount.trim()) {
      return
    }

    setPayments((prev) => {
      if (editingId) {
        return prev.map((payment) =>
          payment.id === editingId ? { ...payment, ...formData, paymentDate: formData.paymentDate || null } : payment,
        )
      }
      const nextId = prev.length ? Math.max(...prev.map((payment) => payment.id)) + 1 : 1
      return [...prev, { id: nextId, ...formData, paymentDate: formData.paymentDate || null }]
    })

    setIsDialogOpen(false)
    setEditingId(null)
    setFormData(emptyPayment)
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background p-3 sm:p-4 lg:p-5">
      <section className="mb-4">
        <Card className="border-border/80 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Payments</p>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Collections, simplified</h1>
              <p className="text-xs text-muted-foreground max-w-xl">
                Track rent status, keep an eye on collection health, and nudge tenants before balances turn red.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/60 px-3 py-1">
                  <ShieldCheck className="h-4 w-4" />
                  Auto-receipts enabled
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/60 px-3 py-1">
                  <Clock3 className="h-4 w-4" />
                  Same-day payouts active
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" variant="outline" className="border-border text-foreground">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={startCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Record payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Edit payment" : "Record payment"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="tenant">Tenant</Label>
                        <Input
                          id="tenant"
                          value={formData.tenant}
                          onChange={(e) => setFormData({ ...formData, tenant: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="property">Property</Label>
                        <Input
                          id="property"
                          value={formData.property}
                          onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                          placeholder="Apartment 101"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          placeholder="$1,200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="method">Method</Label>
                        <Input
                          id="method"
                          value={formData.method}
                          onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                          placeholder="Bank Transfer"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="dueDate">Due date</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="paymentDate">Payment date</Label>
                        <Input
                          id="paymentDate"
                          type="date"
                          value={formData.paymentDate ?? ""}
                          onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <select
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="mt-4 flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>{editingId ? "Save changes" : "Save payment"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 mb-8">
        {[
          { label: "Collected this month", value: "$5,224", detail: "+12% vs last cycle" },
          { label: "Outstanding balance", value: "$3,700", detail: "$2.5k pending • $1.2k overdue" },
          { label: "Collection rate", value: "81%", detail: "On track for 90% target" },
          { label: "Avg. pay time", value: "2.4 days", detail: "After invoice due date" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-2">{stat.detail}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground/80" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Payment activity</CardTitle>
              <CardDescription>Updated when invoices are created or collected</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="ghost" className="border border-border text-foreground">
                This month
              </Button>
              <Button size="sm" variant="ghost" className="border border-border text-foreground">
                All properties
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Send reminders
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.tenant}</TableCell>
                    <TableCell className="text-muted-foreground">{payment.property}</TableCell>
                    <TableCell className="flex items-center gap-1 font-semibold text-foreground">
                      <DollarSign className="h-4 w-4 text-[#2a6f97]" />
                      {payment.amount}
                    </TableCell>
                    <TableCell className="flex items-center gap-1 text-foreground">
                      <Calendar className="h-4 w-4 text-[#2a6f97]" />
                      {payment.dueDate}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{payment.method}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          payment.status === "Completed"
                            ? "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/60 dark:text-emerald-100"
                            : payment.status === "Pending"
                              ? "border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/60 dark:text-amber-100"
                              : "border-red-200/60 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/60 dark:text-red-100"
                        }
                        variant="outline"
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="ghost" className="text-foreground" asChild>
                        <Link href={`/payments/${payment.id}`}>View</Link>
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1" onClick={() => startEdit(payment)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1 text-destructive"
                        onClick={() => handleDelete(payment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Collection health</CardTitle>
              <CardDescription>Snapshot of this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Collection rate</span>
                <span className="font-semibold text-foreground">81%</span>
              </div>
              <Progress value={81} />
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg border border-border/80 p-3">
                  <p className="text-muted-foreground mb-1">Completed</p>
                  <p className="text-lg font-semibold text-foreground">
                    {payments.filter((p) => p.status === "Completed").length}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Stable</p>
                </div>
                <div className="rounded-lg border border-border/80 p-3">
                  <p className="text-muted-foreground mb-1">Pending</p>
                  <p className="text-lg font-semibold text-foreground">
                    {payments.filter((p) => p.status === "Pending").length}
                  </p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">Send reminder</p>
                </div>
                <div className="rounded-lg border border-border/80 p-3">
                  <p className="text-muted-foreground mb-1">Overdue</p>
                  <p className="text-lg font-semibold text-foreground">
                    {payments.filter((p) => p.status === "Overdue").length}
                  </p>
                  <p className="text-[11px] text-red-600 dark:text-red-400">Escalate</p>
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-border/80 bg-muted/40 p-3 text-xs text-muted-foreground">
                Payments are cleared same-day once marked completed. Auto-reminders fire 48 hours before and after due.
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Due soon & overdue</CardTitle>
              <CardDescription>Prioritize outreach this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-start justify-between rounded-lg border border-border/80 p-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{payment.tenant}</p>
                    <p className="text-xs text-muted-foreground">{payment.property}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <DollarSign className="h-4 w-4 text-[#2a6f97]" />
                      {payment.amount}
                      <Calendar className="ml-2 h-4 w-4 text-muted-foreground" />
                      Due {payment.dueDate}
                    </div>
                  </div>
                  <Badge
                    className={
                      payment.status === "Pending"
                        ? "border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/60 dark:text-amber-100"
                        : "border-red-200/60 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/60 dark:text-red-100"
                    }
                    variant="outline"
                  >
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
