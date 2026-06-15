import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Plus, Search, Trash2, Pencil, TrendingUp, TrendingDown } from 'lucide-react'
import { GET_TRANSACTIONS, GET_CATEGORIES } from '../graphql/queries'
import { DELETE_TRANSACTION } from '../graphql/mutations'
import type { Transaction, Category, TransactionType } from '../types'
import { formatCurrency, formatDate, formatMonthYear, parseDate } from '../lib/utils'
import { CategoryBadge, CategoryIconBadge } from '../components/ui/CategoryIcon'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { TransactionModal } from '../components/transactions/TransactionModal'

export default function TransactionsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [periodFilter, setPeriodFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  const { data: txData, loading, error } = useQuery<{ transactions: Transaction[] }>(GET_TRANSACTIONS)
  const { data: catData } = useQuery<{ categories: Category[] }>(GET_CATEGORIES)
  const [deleteTransaction] = useMutation(DELETE_TRANSACTION, {
    refetchQueries: [{ query: GET_TRANSACTIONS }],
  })

  const transactions = txData?.transactions ?? []
  const categories = catData?.categories ?? []

  const availableMonths = useMemo(() => {
    const months = new Set(
      transactions.map((t) => {
        const d = parseDate(t.date)
        return `${d.getFullYear()}-${d.getMonth()}`
      }),
    )
    const now = new Date()
    months.add(`${now.getFullYear()}-${now.getMonth()}`)
    return [...months].sort((a, b) => b.localeCompare(a))
  }, [transactions])

  const periodOptions = availableMonths.map((key) => {
    const [year, month] = key.split('-').map(Number)
    const d = new Date(year, month)
    return { value: key, label: formatMonthYear(d) }
  })

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
      if (typeFilter && t.type !== typeFilter) return false
      if (categoryFilter && t.category?.id !== categoryFilter) return false
      if (periodFilter) {
        const [year, month] = periodFilter.split('-').map(Number)
        const d = parseDate(t.date)
        if (d.getFullYear() !== year || d.getMonth() !== month) return false
      }
      return true
    })
  }, [transactions, search, typeFilter, categoryFilter, periodFilter])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return
    await deleteTransaction({ variables: { id } })
  }

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingTx(null)
  }

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600 font-medium">Erro ao carregar transações</p>
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
        <p className="text-gray-500 text-xs mt-3">Verifique se o servidor backend está rodando em <code className="bg-gray-100 px-1 rounded">http://localhost:4000</code></p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie todas as suas transações financeiras</p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="md">
          <Plus size={16} />
          Nova transação
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Buscar</label>
            <Input
              placeholder="Buscar por descrição"
              icon={<Search size={15} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Tipo</label>
            <Select
              options={[
                { value: 'EXPENSE', label: 'Despesa' },
                { value: 'INCOME', label: 'Receita' },
              ]}
              placeholder="Todos"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TransactionType | '')}
              className="h-10"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Categoria</label>
            <Select
              options={categoryOptions}
              placeholder="Todas"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Período</label>
            <Select
              options={periodOptions}
              placeholder="Todos os períodos"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="h-10"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-6 py-4">
                    <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                  Nenhuma transação encontrada
                </td>
              </tr>
            ) : (
              filtered.map((tx) => <TransactionRow key={tx.id} tx={tx} onEdit={handleEdit} onDelete={handleDelete} />)
            )}
          </tbody>
        </table>
      </div>

      <TransactionModal open={modalOpen} onClose={handleCloseModal} transaction={editingTx} />
    </>
  )
}

function TransactionRow({
  tx,
  onEdit,
  onDelete,
}: {
  tx: Transaction
  onEdit: (tx: Transaction) => void
  onDelete: (id: string) => void
}) {
  const isIncome = tx.type === 'INCOME'

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <CategoryIconBadge
            icon={tx.category?.icon ?? 'tag'}
            color={tx.category?.color ?? '#94A3B8'}
            size="sm"
          />
          <span className="text-sm font-medium text-gray-900">{tx.title}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(tx.date)}</td>
      <td className="px-6 py-4">
        {tx.category ? (
          <CategoryBadge name={tx.category.name} color={tx.category.color} />
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-medium ${
            isIncome ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {isIncome ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {isIncome ? 'Entrada' : 'Saída'}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <span className={`text-sm font-semibold ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
          {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onDelete(tx.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-red-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => onEdit(tx)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Pencil size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}
