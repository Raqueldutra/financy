import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { Wallet, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import { GET_TRANSACTIONS, GET_CATEGORIES } from '../graphql/queries'
import type { Transaction, Category } from '../types'
import { formatCurrency, formatDate, isSameMonthYear } from '../lib/utils'
import { CategoryIconBadge, CategoryBadge } from '../components/ui/CategoryIcon'
import { TransactionModal } from '../components/transactions/TransactionModal'

export default function DashboardPage() {
  const [transactionModal, setTransactionModal] = useState(false)

  const { data: txData, loading: txLoading, error: txError } = useQuery<{ transactions: Transaction[] }>(GET_TRANSACTIONS)
  const { data: catData } = useQuery<{ categories: Category[] }>(GET_CATEGORIES)

  const transactions = txData?.transactions ?? []
  const categories = catData?.categories ?? []

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const stats = useMemo(() => {
    const totalBalance = transactions.reduce(
      (sum, t) => (t.type === 'INCOME' ? sum + t.amount : sum - t.amount),
      0,
    )
    const monthly = transactions.filter((t) => isSameMonthYear(t.date, currentMonth, currentYear))
    const monthlyIncome = monthly.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
    const monthlyExpenses = monthly.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
    return { totalBalance, monthlyIncome, monthlyExpenses }
  }, [transactions, currentMonth, currentYear])

  const recentTransactions = transactions.slice(0, 5)

  const categoryStats = useMemo(() => {
    return categories
      .map((cat) => {
        const catTxs = transactions.filter((t) => t.category?.id === cat.id)
        const total = catTxs.reduce((s, t) => (t.type === 'EXPENSE' ? s + t.amount : s), 0)
        return { ...cat, count: catTxs.length, total }
      })
      .filter((c) => c.count > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [categories, transactions])

  if (txError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600 font-medium">Erro ao carregar dados</p>
        <p className="text-red-500 text-sm mt-1">{txError.message}</p>
        <p className="text-gray-500 text-xs mt-3">Verifique se o servidor backend está rodando em <code className="bg-gray-100 px-1 rounded">http://localhost:4000</code></p>
      </div>
    )
  }

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="SALDO TOTAL"
          value={formatCurrency(stats.totalBalance)}
          icon={<Wallet size={20} />}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />
        <StatCard
          label="RECEITAS DO MÊS"
          value={formatCurrency(stats.monthlyIncome)}
          icon={<TrendingUp size={20} />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          valueColor="text-green-600"
        />
        <StatCard
          label="DESPESAS DO MÊS"
          value={formatCurrency(stats.monthlyExpenses)}
          icon={<TrendingDown size={20} />}
          iconBg="bg-red-100"
          iconColor="text-red-500"
          valueColor="text-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
              Transações Recentes
            </h2>
            <Link
              to="/transactions"
              className="text-sm text-primary-700 font-medium flex items-center gap-1 hover:underline"
            >
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>

          {txLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Nenhuma transação encontrada</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentTransactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Categorias</h2>
            <Link
              to="/categories"
              className="text-sm text-primary-700 font-medium flex items-center gap-1 hover:underline"
            >
              Gerenciar <ChevronRight size={14} />
            </Link>
          </div>

          {categoryStats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sem categorias com transações</p>
          ) : (
            <div className="space-y-3">
              {categoryStats.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <CategoryBadge name={cat.name} color={cat.color} />
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs text-gray-400">{cat.count} {cat.count === 1 ? 'item' : 'itens'}</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(cat.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TransactionModal open={transactionModal} onClose={() => setTransactionModal(false)} />
    </>
  )
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  valueColor = 'text-gray-900',
}: {
  label: string
  value: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  valueColor?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  )
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === 'INCOME'
  const Icon = isIncome ? TrendingUp : TrendingDown

  return (
    <div className="flex items-center gap-3 py-3">
      <CategoryIconBadge
        icon={transaction.category?.icon ?? 'tag'}
        color={transaction.category?.color ?? '#94A3B8'}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{transaction.title}</p>
        <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
      </div>
      {transaction.category && (
        <CategoryBadge name={transaction.category.name} color={transaction.category.color} />
      )}
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
        <span className={`text-sm font-semibold ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
          {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
        </span>
        <Icon size={16} className={isIncome ? 'text-green-500' : 'text-red-400'} />
      </div>
    </div>
  )
}
