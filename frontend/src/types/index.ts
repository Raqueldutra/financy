export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  icon: string
  color: string
  createdAt: string
  updatedAt: string
}

export type TransactionType = 'INCOME' | 'EXPENSE'

export interface Transaction {
  id: string
  title: string
  amount: number
  type: TransactionType
  category?: Category | null
  date: string
  createdAt: string
  updatedAt: string
}
