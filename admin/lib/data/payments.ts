export type PaymentStatus = "Completed" | "Pending" | "Overdue"

export type Payment = {
  id: number
  tenant: string
  property: string
  amount: string
  dueDate: string
  paymentDate: string | null
  status: PaymentStatus
  method: string
}

export const payments: Payment[] = [
  {
    id: 1,
    tenant: "John Doe",
    property: "Apartment 101",
    amount: "$1,200",
    dueDate: "2024-11-01",
    paymentDate: "2024-11-25",
    status: "Completed",
    method: "Bank Transfer",
  },
  {
    id: 2,
    tenant: "Jane Smith",
    property: "House 5B",
    amount: "$1,500",
    dueDate: "2024-11-01",
    paymentDate: "2024-11-24",
    status: "Completed",
    method: "Credit Card",
  },
  {
    id: 3,
    tenant: "Mike Johnson",
    property: "Commercial 3",
    amount: "$2,500",
    dueDate: "2024-11-01",
    paymentDate: null,
    status: "Pending",
    method: "Pending",
  },
  {
    id: 4,
    tenant: "Sarah Wilson",
    property: "Apartment 202",
    amount: "$1,200",
    dueDate: "2024-11-01",
    paymentDate: null,
    status: "Overdue",
    method: "Not Paid",
  },
]
