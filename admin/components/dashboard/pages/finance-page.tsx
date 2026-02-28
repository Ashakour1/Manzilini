"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowUpRight,
  Banknote,
  DollarSign,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  AccountSummary,
  CreateExpenseDto,
  CreateIncomeDto,
  createExpense,
  createIncome,
  deleteExpense,
  deleteIncome,
  getAccounts,
  getExpenses,
  getIncomes,
  updateExpense,
  updateIncome,
} from "@/services/finance.service"

type FinanceMode = "all" | "income" | "expense"

interface FinancePageProps {
  mode?: FinanceMode
}

export function FinancePage({ mode = "all" }: FinancePageProps) {
  const { toast } = useToast()
  const pathname = usePathname()
  const [accounts, setAccounts] = useState<AccountSummary[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string | "all">("all")
  const [incomes, setIncomes] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"income" | "expense">(
    mode === "expense" ? "expense" : "income",
  )

  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [deleteIncomeId, setDeleteIncomeId] = useState<string | null>(null)
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null)
  const [deleteIncomeDialogOpen, setDeleteIncomeDialogOpen] = useState(false)
  const [deleteExpenseDialogOpen, setDeleteExpenseDialogOpen] = useState(false)

  const [incomeForm, setIncomeForm] = useState<CreateIncomeDto>({
    date: new Date().toISOString().split("T")[0],
    source: "",
    amount: 0,
    paymentMethod: "CASH",
    accountId: "",
  })

  const [expenseForm, setExpenseForm] = useState<CreateExpenseDto>({
    date: new Date().toISOString().split("T")[0],
    category: "",
    amount: 0,
    paymentMethod: "CASH",
    accountId: "",
  })

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [accountsRes, incomesRes, expensesRes] = await Promise.all([
        getAccounts(),
        getIncomes(selectedAccountId === "all" ? undefined : selectedAccountId),
        getExpenses(selectedAccountId === "all" ? undefined : selectedAccountId),
      ])
      setAccounts(accountsRes || [])
      setIncomes(incomesRes || [])
      setExpenses(expensesRes || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load finance data"
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Set default tab based on route when in "all" mode
    if (mode === "all") {
      if (pathname.startsWith("/expenses")) {
        setActiveTab("expense")
      } else {
        setActiveTab("income")
      }
    }
  }, [pathname, mode])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId])

  const summary = useMemo(() => {
    const incomeTotal = incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0)
    const expenseTotal = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
    const net = incomeTotal - expenseTotal

    return { incomeTotal, expenseTotal, net }
  }, [incomes, expenses])

  const handleCreateIncome = async () => {
    if (!incomeForm.accountId || !incomeForm.source || !incomeForm.amount) {
      toast({
        title: "Validation error",
        description: "Account, source and amount are required",
        variant: "destructive",
      })
      return
    }

    try {
      await createIncome(incomeForm)
      setIncomeDialogOpen(false)
      await loadData()
      toast({
        title: "Income recorded",
        description: "The income has been added and account balance updated.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create income",
        variant: "destructive",
      })
    }
  }

  const handleCreateExpense = async () => {
    if (!expenseForm.accountId || !expenseForm.category || !expenseForm.amount) {
      toast({
        title: "Validation error",
        description: "Account, category and amount are required",
        variant: "destructive",
      })
      return
    }

    try {
      await createExpense(expenseForm)
      setExpenseDialogOpen(false)
      setEditingExpenseId(null)
      await loadData()
      toast({
        title: "Expense recorded",
        description: "The expense has been added and account balance updated.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create expense",
        variant: "destructive",
      })
    }
  }

  const handleEditIncome = (row: any) => {
    setEditingIncomeId(row.id)
    setIncomeForm({
      date: new Date(row.date).toISOString().split("T")[0],
      source: row.source,
      amount: Number(row.amount),
      paymentMethod: row.paymentMethod || "CASH",
      accountId: row.accountId,
      reference: row.reference || "",
      description: row.description || "",
    })
    setIncomeDialogOpen(true)
  }

  const handleEditExpense = (row: any) => {
    setEditingExpenseId(row.id)
    setExpenseForm({
      date: new Date(row.date).toISOString().split("T")[0],
      category: row.category,
      amount: Number(row.amount),
      paymentMethod: row.paymentMethod || "CASH",
      accountId: row.accountId,
      vendorName: row.vendorName || "",
      reference: row.reference || "",
      description: row.description || "",
    })
    setExpenseDialogOpen(true)
  }

  const handleUpdateIncome = async () => {
    if (!editingIncomeId || !incomeForm.accountId || !incomeForm.source || !incomeForm.amount) {
      toast({
        title: "Validation error",
        description: "Account, source and amount are required",
        variant: "destructive",
      })
      return
    }

    try {
      await updateIncome(editingIncomeId, {
        date: incomeForm.date,
        source: incomeForm.source,
        amount: incomeForm.amount,
        paymentMethod: incomeForm.paymentMethod,
        accountId: incomeForm.accountId,
        reference: incomeForm.reference,
        description: incomeForm.description,
      })
      setIncomeDialogOpen(false)
      setEditingIncomeId(null)
      await loadData()
      toast({
        title: "Income updated",
        description: "The income has been updated and account balance adjusted.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update income",
        variant: "destructive",
      })
    }
  }

  const handleUpdateExpense = async () => {
    if (!editingExpenseId || !expenseForm.accountId || !expenseForm.category || !expenseForm.amount) {
      toast({
        title: "Validation error",
        description: "Account, category and amount are required",
        variant: "destructive",
      })
      return
    }

    try {
      await updateExpense(editingExpenseId, {
        date: expenseForm.date,
        category: expenseForm.category,
        amount: expenseForm.amount,
        paymentMethod: expenseForm.paymentMethod,
        accountId: expenseForm.accountId,
        vendorName: expenseForm.vendorName,
        reference: expenseForm.reference,
        description: expenseForm.description,
      })
      setExpenseDialogOpen(false)
      setEditingExpenseId(null)
      await loadData()
      toast({
        title: "Expense updated",
        description: "The expense has been updated and account balance adjusted.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update expense",
        variant: "destructive",
      })
    }
  }

  const handleDeleteIncome = async () => {
    if (!deleteIncomeId) return
    try {
      await deleteIncome(deleteIncomeId)
      setDeleteIncomeId(null)
      setDeleteIncomeDialogOpen(false)
      await loadData()
      toast({
        title: "Income deleted",
        description: "The income has been removed and account balance adjusted.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete income",
        variant: "destructive",
      })
    }
  }

  const handleDeleteExpense = async () => {
    if (!deleteExpenseId) return
    try {
      await deleteExpense(deleteExpenseId)
      setDeleteExpenseId(null)
      setDeleteExpenseDialogOpen(false)
      await loadData()
      toast({
        title: "Expense deleted",
        description: "The expense has been removed and account balance adjusted.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete expense",
        variant: "destructive",
      })
    }
  }

  const resetIncomeForm = () => {
    setEditingIncomeId(null)
    setIncomeForm({
      date: new Date().toISOString().split("T")[0],
      source: "",
      amount: 0,
      paymentMethod: "CASH",
      accountId: "",
    })
  }

  const resetExpenseForm = () => {
    setEditingExpenseId(null)
    setExpenseForm({
      date: new Date().toISOString().split("T")[0],
      category: "",
      amount: 0,
      paymentMethod: "CASH",
      accountId: "",
    })
  }

  const accountOptions = [{ id: "all", name: "All accounts" }, ...accounts]

  const title =
    mode === "income" ? "Incomes" : mode === "expense" ? "Expenses" : "Finance"
  const subtitle =
    mode === "income"
      ? "Track all recorded income entries"
      : mode === "expense"
        ? "Track all recorded expense entries"
        : "Track income and expenses across accounts"

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Refresh
          </Button>
          {(mode === "all" || mode === "income") && (
            <Button size="sm" onClick={() => setIncomeDialogOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Record income
            </Button>
          )}
          {(mode === "all" || mode === "expense") && (
            <Button
              size="sm"
              variant={mode === "all" ? "outline" : "default"}
              onClick={() => setExpenseDialogOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Record expense
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Label className="text-xs text-muted-foreground">Account</Label>
          <Select
            value={selectedAccountId}
            onValueChange={(value) => setSelectedAccountId(value as "all" | string)}
          >
            <SelectTrigger className="h-9 w-52 text-xs">
              <SelectValue placeholder="Filter by account" />
            </SelectTrigger>
            <SelectContent>
              {accountOptions.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        {(mode === "all" || mode === "income") && (
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Income</CardTitle>
              <div className="rounded-lg bg-emerald-500/10 p-1.5">
                <ArrowDownCircle className="h-3.5 w-3.5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold text-foreground">
                {summary.incomeTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Recorded inflows</p>
            </CardContent>
          </Card>
        )}
        {(mode === "all" || mode === "expense") && (
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Expenses</CardTitle>
              <div className="rounded-lg bg-red-500/10 p-1.5">
                <ArrowUpCircle className="h-3.5 w-3.5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="text-lg font-bold text-foreground">
                {summary.expenseTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Recorded outflows</p>
            </CardContent>
          </Card>
        )}
        {mode === "all" && (
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Net</CardTitle>
              <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
                <Banknote className="h-3.5 w-3.5 text-[#2a6f97]" />
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div
                className={
                  summary.net >= 0
                    ? "text-lg font-bold text-emerald-600"
                    : "text-lg font-bold text-red-600"
                }
              >
                {summary.net.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Income minus expenses</p>
            </CardContent>
          </Card>
        )}
      </div>

      {mode === "all" ? (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "income" | "expense")}>
          <TabsList className="mb-4">
            <TabsTrigger value="income" className="gap-1.5">
              <ArrowDownCircle className="h-3.5 w-3.5" />
              Income
            </TabsTrigger>
            <TabsTrigger value="expense" className="gap-1.5">
              <ArrowUpCircle className="h-3.5 w-3.5" />
              Expenses
            </TabsTrigger>
          </TabsList>
          <TabsContent value="income">
            {/* income table block (unchanged) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Income</CardTitle>
              <CardDescription>All recorded income entries</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading income...</div>
              ) : error ? (
                <div className="py-8 text-center text-xs text-destructive">{error}</div>
              ) : incomes.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>No income records</EmptyTitle>
                    <EmptyDescription>Record your first income to see it here.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/50 bg-muted/30">
                        <TableHead className="text-xs font-semibold text-foreground">Date</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Source</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Account</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Method</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground text-right">
                          Amount
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-foreground text-right w-12">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomes.map((row) => (
                        <TableRow key={row.id.toString()} className="border-b border-border/30">
                          <TableCell className="py-3 text-xs">
                            {new Date(row.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="py-3 text-sm font-medium text-foreground">
                            {row.source}
                          </TableCell>
                          <TableCell className="py-3 text-xs">
                            <div className="flex flex-col gap-0.5">
                              <span>{row.account?.name}</span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {row.accountId}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-xs">
                            <Badge variant="outline" className="text-[10px]">
                              {row.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-right text-sm font-semibold text-emerald-600">
                            <span className="inline-flex items-center gap-1 justify-end">
                              <DollarSign className="h-3.5 w-3.5" />
                              {Number(row.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleEditIncome(row)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => {
                                    setDeleteIncomeId(String(row.id))
                                    setDeleteIncomeDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>
          <TabsContent value="expense">
            {/* expenses table block (unchanged) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Expenses</CardTitle>
              <CardDescription>All recorded expense entries</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading expenses...</div>
              ) : error ? (
                <div className="py-8 text-center text-xs text-destructive">{error}</div>
              ) : expenses.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>No expense records</EmptyTitle>
                    <EmptyDescription>Record your first expense to see it here.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/50 bg-muted/30">
                        <TableHead className="text-xs font-semibold text-foreground">Date</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Category</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Account</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Method</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground text-right">
                          Amount
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-foreground text-right w-12">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((row) => (
                        <TableRow key={row.id.toString()} className="border-b border-border/30">
                          <TableCell className="py-3 text-xs">
                            {new Date(row.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="py-3 text-sm font-medium text-foreground">
                            {row.category}
                          </TableCell>
                          <TableCell className="py-3 text-xs">
                            <div className="flex flex-col gap-0.5">
                              <span>{row.account?.name}</span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {row.accountId}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-xs">
                            <Badge variant="outline" className="text-[10px]">
                              {row.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-right text-sm font-semibold text-red-600">
                            <span className="inline-flex items-center gap-1 justify-end">
                              <DollarSign className="h-3.5 w-3.5" />
                              {Number(row.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleEditExpense(row)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => {
                                    setDeleteExpenseId(String(row.id))
                                    setDeleteExpenseDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>
        </Tabs>
      ) : mode === "income" ? (
        // Income-only view
        <div>
          {/* reuse the income table block directly */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Income</CardTitle>
              <CardDescription>All recorded income entries</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading income...</div>
              ) : error ? (
                <div className="py-8 text-center text-xs text-destructive">{error}</div>
              ) : incomes.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>No income records</EmptyTitle>
                    <EmptyDescription>Record your first income to see it here.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/50 bg-muted/30">
                        <TableHead className="text-xs font-semibold text-foreground">Date</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Source</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Account</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Method</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground text-right">
                          Amount
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-foreground text-right w-12">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomes.map((row) => (
                        <TableRow key={row.id.toString()} className="border-b border-border/30">
                          <TableCell className="py-3 text-xs">
                            {new Date(row.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="py-3 text-sm font-medium text-foreground">
                            {row.source}
                          </TableCell>
                          <TableCell className="py-3 text-xs">
                            <div className="flex flex-col gap-0.5">
                              <span>{row.account?.name}</span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {row.accountId}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-xs">
                            <Badge variant="outline" className="text-[10px]">
                              {row.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-right text-sm font-semibold text-emerald-600">
                            <span className="inline-flex items-center gap-1 justify-end">
                              <DollarSign className="h-3.5 w-3.5" />
                              {Number(row.amount).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleEditIncome(row)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => {
                                    setDeleteIncomeId(String(row.id))
                                    setDeleteIncomeDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        // Expense-only view
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Expenses</CardTitle>
              <CardDescription>All recorded expense entries</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading expenses...</div>
              ) : error ? (
                <div className="py-8 text-center text-xs text-destructive">{error}</div>
              ) : expenses.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>No expense records</EmptyTitle>
                    <EmptyDescription>Record your first expense to see it here.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/50 bg-muted/30">
                        <TableHead className="text-xs font-semibold text-foreground">Date</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Category</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Account</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground">Method</TableHead>
                        <TableHead className="text-xs font-semibold text-foreground text-right">
                          Amount
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-foreground text-right w-12">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((row) => (
                        <TableRow key={row.id.toString()} className="border-b border-border/30">
                          <TableCell className="py-3 text-xs">
                            {new Date(row.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="py-3 text-sm font-medium text-foreground">
                            {row.category}
                          </TableCell>
                          <TableCell className="py-3 text-xs">
                            <div className="flex flex-col gap-0.5">
                              <span>{row.account?.name}</span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {row.accountId}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-xs">
                            <Badge variant="outline" className="text-[10px]">
                              {row.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-right text-sm font-semibold text-red-600">
                            <span className="inline-flex items-center gap-1 justify-end">
                              <DollarSign className="h-3.5 w-3.5" />
                              {Number(row.amount).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleEditExpense(row)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => {
                                    setDeleteExpenseId(String(row.id))
                                    setDeleteExpenseDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog
        open={incomeDialogOpen}
        onOpenChange={(open) => {
          setIncomeDialogOpen(open)
          if (!open) resetIncomeForm()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIncomeId ? "Edit income" : "Record income"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Account</Label>
                <Select
                  value={incomeForm.accountId}
                  onValueChange={(value) => setIncomeForm((f) => ({ ...f, accountId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Input
                  value={incomeForm.source}
                  onChange={(e) => setIncomeForm((f) => ({ ...f, source: e.target.value }))}
                  placeholder="Rent, Commission, Service fee..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={incomeForm.amount || ""}
                  onChange={(e) =>
                    setIncomeForm((f) => ({ ...f, amount: Number(e.target.value || 0) }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Payment method</Label>
                <Select
                  value={incomeForm.paymentMethod}
                  onValueChange={(value) =>
                    setIncomeForm((f) => ({ ...f, paymentMethod: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK">Bank</SelectItem>
                    <SelectItem value="MOBILE_MONEY">Mobile money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Reference (optional)</Label>
                <Input
                  value={incomeForm.reference || ""}
                  onChange={(e) => setIncomeForm((f) => ({ ...f, reference: e.target.value }))}
                  placeholder="Receipt, transaction ID..."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIncomeDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={editingIncomeId ? handleUpdateIncome : handleCreateIncome}
            >
              <ArrowUpRight className="mr-1.5 h-4 w-4" />
              {editingIncomeId ? "Update income" : "Save income"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={expenseDialogOpen}
        onOpenChange={(open) => {
          setExpenseDialogOpen(open)
          if (!open) resetExpenseForm()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpenseId ? "Edit expense" : "Record expense"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Account</Label>
                <Select
                  value={expenseForm.accountId}
                  onValueChange={(value) => setExpenseForm((f) => ({ ...f, accountId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="Maintenance, Marketing, Utilities..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount || ""}
                  onChange={(e) =>
                    setExpenseForm((f) => ({ ...f, amount: Number(e.target.value || 0) }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Payment method</Label>
                <Select
                  value={expenseForm.paymentMethod}
                  onValueChange={(value) =>
                    setExpenseForm((f) => ({ ...f, paymentMethod: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK">Bank</SelectItem>
                    <SelectItem value="MOBILE_MONEY">Mobile money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Vendor (optional)</Label>
                <Input
                  value={expenseForm.vendorName || ""}
                  onChange={(e) =>
                    setExpenseForm((f) => ({ ...f, vendorName: e.target.value }))
                  }
                  placeholder="Supplier, contractor..."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpenseDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={editingExpenseId ? handleUpdateExpense : handleCreateExpense}
            >
              <ArrowUpRight className="mr-1.5 h-4 w-4" />
              {editingExpenseId ? "Update expense" : "Save expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteIncomeDialogOpen}
        onOpenChange={(open) => {
          setDeleteIncomeDialogOpen(open)
          if (!open) setDeleteIncomeId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete income?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the income record and adjust the account balance. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIncome}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteExpenseDialogOpen}
        onOpenChange={(open) => {
          setDeleteExpenseDialogOpen(open)
          if (!open) setDeleteExpenseId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the expense record and adjust the account balance. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExpense}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

