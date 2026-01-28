"use client"

import { useEffect, useMemo, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Banknote, BarChart3, DollarSign, Plus, RefreshCw } from "lucide-react"
import { AccountSummary, createAccount, getAccounts } from "@/services/finance.service"

export function AccountsPage() {
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<AccountSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [initialBalance, setInitialBalance] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadAccounts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAccounts()
      setAccounts(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load accounts"
      setError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  const stats = useMemo(() => {
    const totalAccounts = accounts.length
    const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0)
    const totalIncome = accounts.reduce((sum, a) => sum + (a.totalIncome || 0), 0)
    const totalExpense = accounts.reduce((sum, a) => sum + (a.totalExpense || 0), 0)

    return { totalAccounts, totalBalance, totalIncome, totalExpense }
  }, [accounts])

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation error",
        description: "Account name is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        balance: initialBalance ? Number(initialBalance) : undefined,
      }
      await createAccount(payload)
      setIsDialogOpen(false)
      setName("")
      setInitialBalance("")
      await loadAccounts()
      toast({
        title: "Account created",
        description: "The account was created successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Accounts</h1>
          <p className="text-xs text-muted-foreground">Manage cash, bank, and settlement accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadAccounts} disabled={isLoading}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            New account
          </Button>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Accounts</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <Banknote className="h-3.5 w-3.5 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground">{stats.totalAccounts}</div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Active financial buckets</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Balance</CardTitle>
            <div className="rounded-lg bg-[#2a6f97]/10 p-1.5">
              <DollarSign className="h-3.5 w-3.5 text-[#2a6f97]" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground">
              {stats.totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Sum of all accounts</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Income</CardTitle>
            <div className="rounded-lg bg-emerald-500/10 p-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground">
              {stats.totalIncome.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Recorded inflows</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Expenses</CardTitle>
            <div className="rounded-lg bg-red-500/10 p-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold text-foreground">
              {stats.totalExpense.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Recorded outflows</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Accounts</CardTitle>
          <CardDescription>Overview of all financial accounts and their balances</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading accounts...</div>
          ) : error ? (
            <div className="py-8 text-center text-xs text-destructive">{error}</div>
          ) : accounts.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No accounts yet</EmptyTitle>
                <EmptyDescription>Create your first account to start tracking income and expenses.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 bg-muted/30">
                    <TableHead className="text-xs font-semibold text-foreground">Account</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground">ID</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground text-right">Balance</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground text-right">Total Income</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground text-right">Total Expense</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground text-right">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => {
                    const netPositive = (account.net || 0) >= 0
                    return (
                      <TableRow key={account.id} className="border-b border-border/30">
                        <TableCell className="py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-foreground">{account.name}</span>
                            <Badge variant="outline" className="w-fit text-[10px]">
                              Balance
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="font-mono text-[11px] text-muted-foreground">{account.id}</span>
                        </TableCell>
                        <TableCell className="py-3 text-right text-sm font-semibold">
                          {account.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="py-3 text-right text-sm text-emerald-600">
                          {account.totalIncome.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="py-3 text-right text-sm text-red-600">
                          {account.totalExpense.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="py-3 text-right text-sm">
                          <span
                            className={
                              netPositive
                                ? "inline-flex items-center justify-end rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                                : "inline-flex items-center justify-end rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700"
                            }
                          >
                            {account.net.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="account-name">Name</Label>
              <Input
                id="account-name"
                placeholder="e.g. Operating Account, Rent Collections"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="initial-balance">Initial balance (optional)</Label>
              <Input
                id="initial-balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                This is just a starting value. Future incomes and expenses will adjust the balance automatically.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

