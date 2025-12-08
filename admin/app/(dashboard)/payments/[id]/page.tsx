import type { ElementType } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Calendar, CheckCircle2, Clock3, DollarSign, Download, MapPin, ShieldCheck, TimerReset } from "lucide-react"
import Link from "next/link"
import { payments, type PaymentStatus } from "@/lib/data/payments"

const timelineByStatus: Record<PaymentStatus, { label: string; date: string; icon: ElementType }[]> = {
  Completed: [
    { label: "Invoice issued", date: "2024-10-01", icon: TimerReset },
    { label: "Reminder sent", date: "2024-10-28", icon: Clock3 },
    { label: "Payment received", date: "2024-11-24", icon: CheckCircle2 },
    { label: "Receipt issued", date: "2024-11-25", icon: ShieldCheck },
  ],
  Pending: [
    { label: "Invoice issued", date: "2024-10-01", icon: TimerReset },
    { label: "Reminder scheduled", date: "2024-11-28", icon: Clock3 },
  ],
  Overdue: [
    { label: "Invoice issued", date: "2024-10-01", icon: TimerReset },
    { label: "Reminder sent", date: "2024-11-03", icon: Clock3 },
    { label: "Escalation pending", date: "2024-11-09", icon: ShieldCheck },
  ],
}

function statusBadgeClasses(status: PaymentStatus) {
  if (status === "Completed") {
    return "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/60 dark:text-emerald-100"
  }
  if (status === "Pending") {
    return "border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/60 dark:text-amber-100"
  }
  return "border-red-200/60 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/60 dark:text-red-100"
}

export default function PaymentDetailPage({ params }: { params: { id: string } }) {
  const payment = payments.find((p) => p.id.toString() === params.id)

  if (!payment) {
    return (
      <main className="flex-1 overflow-y-auto bg-background p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/payments">
              <ArrowLeft className="h-4 w-4" />
              Back to payments
            </Link>
          </Button>
          <Badge variant="outline" className="border-border text-muted-foreground">
            Not found
          </Badge>
        </div>
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Payment not found</CardTitle>
            <CardDescription>The requested payment could not be located. Please return to the list.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/payments">Back to payments</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  const timeline = timelineByStatus[payment.status] ?? []
  const collectionRate = payment.status === "Completed" ? 100 : payment.status === "Pending" ? 65 : 30

  return (
    <main className="flex-1 overflow-y-auto bg-background p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/payments">
            <ArrowLeft className="h-4 w-4" />
            Back to payments
          </Link>
        </Button>
        <Badge className={statusBadgeClasses(payment.status)} variant="outline">
          {payment.status}
        </Badge>
        <span className="text-muted-foreground text-sm">Payment #{payment.id}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-2xl">{payment.tenant}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {payment.property}
                <Separator orientation="vertical" className="mx-1 h-4" />
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Due {payment.dueDate}
                {payment.paymentDate ? (
                  <>
                    <Separator orientation="vertical" className="mx-1 h-4" />
                    <Clock3 className="h-4 w-4 text-muted-foreground" />
                    Paid {payment.paymentDate}
                  </>
                ) : null}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="border-border">
                <Download className="mr-2 h-4 w-4" />
                Receipt
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Send reminder
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border/80 p-4">
                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                <p className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  {payment.amount}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Rent, month of November</p>
              </div>
              <div className="rounded-lg border border-border/80 p-4">
                <p className="text-xs text-muted-foreground mb-1">Method</p>
                <p className="text-lg font-semibold text-foreground">{payment.method}</p>
                <p className="text-xs text-muted-foreground mt-1">Auto-deposit preferred</p>
              </div>
              <div className="rounded-lg border border-border/80 p-4">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Badge className={statusBadgeClasses(payment.status)} variant="outline">
                  {payment.status}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {payment.paymentDate ? `Cleared on ${payment.paymentDate}` : "Awaiting settlement"}
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border/80 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Collection health</p>
                    <p className="text-xs text-muted-foreground">Progress toward monthly collection goal</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">{collectionRate}%</span>
              </div>
              <Progress value={collectionRate} />
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>Auto-reminders enabled</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Same-day settlement after confirmation</span>
              </div>
            </div>

            <div className="rounded-lg border border-border/80 p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Activity timeline</p>
              <div className="space-y-3">
                {timeline.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                      {index < timeline.length - 1 ? (
                        <div className="ml-auto hidden text-xs text-muted-foreground sm:block">In progress</div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Breakdown</CardTitle>
              <CardDescription>Charges and adjustments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Base rent</span>
                <span className="font-semibold text-foreground">{payment.amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Utilities</span>
                <span className="font-semibold text-foreground">$120</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Late fee</span>
                <span className="font-semibold text-foreground">{payment.status === "Overdue" ? "$50" : "$0"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total due</span>
                <span>
                  {payment.status === "Overdue"
                    ? "$1,370"
                    : payment.status === "Pending"
                      ? "$1,320"
                      : payment.amount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Next steps</CardTitle>
              <CardDescription>Stay ahead of this invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {payment.status !== "Completed" ? (
                <>
                  <div className="flex items-start gap-3 rounded-lg border border-border/80 p-3">
                    <Clock3 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-foreground">Send gentle reminder</p>
                      <p className="text-xs text-muted-foreground">Email and SMS with payment link and due details.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-border/80 p-3">
                    <TimerReset className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-foreground">Schedule follow-up</p>
                      <p className="text-xs text-muted-foreground">Set a check-in if unpaid after 3 days.</p>
                    </div>
                  </div>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Send reminder
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 rounded-lg border border-border/80 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-foreground">Payment received</p>
                      <p className="text-xs text-muted-foreground">Receipt issued automatically to tenant.</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-border">
                    Download receipt
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
