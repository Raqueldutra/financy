import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'flex items-center justify-center gap-2 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        {
          primary: 'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900',
          outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100',
          danger: 'border border-gray-300 text-red-600 bg-white hover:bg-red-50 active:bg-red-100',
        }[variant],
        {
          sm: 'h-9 px-3 text-sm',
          md: 'h-11 px-4 text-sm',
          lg: 'h-12 px-6 text-base',
        }[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        children
      )}
    </button>
  )
}
