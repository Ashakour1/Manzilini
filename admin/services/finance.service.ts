import { API_URL } from "../lib/api";
import { getAuthHeaders } from "../lib/api";

export interface AccountSummary {
  id: string;
  name: string;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  net: number;
}

export interface CreateAccountDto {
  name: string;
  balance?: number;
}

export interface IncomeDto {
  id: bigint;
  date: string;
  source: string;
  amount: string;
  paymentMethod: string;
  accountId: string;
  reference?: string | null;
  description?: string | null;
}

export interface CreateIncomeDto {
  date: string;
  source: string;
  amount: number;
  paymentMethod: string;
  accountId: string;
  propertyId?: string;
  landlordId?: string;
  reference?: string;
  description?: string;
}

export interface ExpenseDto {
  id: bigint;
  date: string;
  category: string;
  amount: string;
  paymentMethod: string;
  accountId: string;
  vendorName?: string | null;
  reference?: string | null;
  description?: string | null;
}

export interface CreateExpenseDto {
  date: string;
  category: string;
  amount: number;
  paymentMethod: string;
  accountId: string;
  vendorName?: string;
  propertyId?: string;
  landlordId?: string;
  reference?: string;
  description?: string;
}

export const getAccounts = async (): Promise<AccountSummary[]> => {
  const res = await fetch(`${API_URL}/accounts`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to load accounts");
  }
  return res.json();
};

export const createAccount = async (data: CreateAccountDto): Promise<AccountSummary> => {
  const res = await fetch(`${API_URL}/accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create account");
  }
  return res.json();
};

export const getIncomes = async (accountId?: string) => {
  const url = new URL(`${API_URL}/incomes`);
  if (accountId) url.searchParams.set("accountId", accountId);

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to load incomes");
  }
  return res.json();
};

export const createIncome = async (data: CreateIncomeDto) => {
  const res = await fetch(`${API_URL}/incomes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create income");
  }
  return res.json();
};

export const deleteIncome = async (id: bigint | number | string) => {
  const res = await fetch(`${API_URL}/incomes/${id.toString()}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to delete income");
  }
  return res.json();
};

export const getExpenses = async (accountId?: string) => {
  const url = new URL(`${API_URL}/expenses`);
  if (accountId) url.searchParams.set("accountId", accountId);

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to load expenses");
  }
  return res.json();
};

export const createExpense = async (data: CreateExpenseDto) => {
  const res = await fetch(`${API_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create expense");
  }
  return res.json();
};

export const deleteExpense = async (id: bigint | number | string) => {
  const res = await fetch(`${API_URL}/expenses/${id.toString()}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to delete expense");
  }
  return res.json();
};

