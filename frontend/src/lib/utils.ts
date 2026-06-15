import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

// Backend serializes Prisma DateTime via String(dateObject) = numeric timestamp string.
// This helper handles both ISO strings ("2025-11-30T...") and timestamp strings ("1732924800000").
export function parseDate(value: string): Date {
  const num = Number(value)
  return isNaN(num) ? new Date(value) : new Date(num)
}

export function formatDate(dateString: string): string {
  const date = parseDate(dateString)
  if (isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(date)
}

export function formatMonthYear(date: Date): string {
  const month = date.toLocaleString('pt-BR', { month: 'long' })
  const year = date.getFullYear()
  return `${month.charAt(0).toUpperCase() + month.slice(1)} / ${year}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function isSameMonthYear(dateString: string, month: number, year: number): boolean {
  const date = parseDate(dateString)
  return date.getMonth() === month && date.getFullYear() === year
}
