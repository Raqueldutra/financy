import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Plus, Trash2, Pencil, Tag, ArrowUpDown } from 'lucide-react'
import { GET_CATEGORIES, GET_TRANSACTIONS } from '../graphql/queries'
import { DELETE_CATEGORY } from '../graphql/mutations'
import type { Category, Transaction } from '../types'
import { CategoryIconBadge, CategoryBadge } from '../components/ui/CategoryIcon'
import { Button } from '../components/ui/Button'
import { CategoryModal } from '../components/categories/CategoryModal'

export default function CategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)

  const { data: catData, loading } = useQuery<{ categories: Category[] }>(GET_CATEGORIES)
  const { data: txData } = useQuery<{ transactions: Transaction[] }>(GET_TRANSACTIONS)
  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }],
  })

  const categories = catData?.categories ?? []
  const transactions = txData?.transactions ?? []

  const totalTransactions = transactions.length

  const mostUsedCategory = categories
    .map((cat) => ({
      ...cat,
      count: transactions.filter((t) => t.category?.id === cat.id).length,
    }))
    .sort((a, b) => b.count - a.count)[0]

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? As transações vinculadas não serão apagadas.')) return
    await deleteCategory({ variables: { id } })
  }

  const handleEdit = (cat: Category) => {
    setEditingCat(cat)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingCat(null)
  }

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-500 text-sm mt-1">Organize suas transações por categorias</p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="md">
          <Plus size={16} />
          Nova categoria
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <Tag size={24} className="text-gray-400" />
          <div>
            <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total de Categorias</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <ArrowUpDown size={24} className="text-gray-400" />
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total de Transações</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          {mostUsedCategory ? (
            <CategoryIconBadge icon={mostUsedCategory.icon} color={mostUsedCategory.color} size="lg" />
          ) : (
            <Tag size={24} className="text-gray-300" />
          )}
          <div>
            <p className="text-xl font-bold text-gray-900 truncate">
              {mostUsedCategory?.name ?? '—'}
            </p>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Categoria Mais Utilizada</p>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-2xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Tag size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhuma categoria criada</p>
          <p className="text-gray-400 text-sm mt-1">Crie sua primeira categoria para organizar transações</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              transactionCount={transactions.filter((t) => t.category?.id === cat.id).length}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CategoryModal open={modalOpen} onClose={handleCloseModal} category={editingCat} />
    </>
  )
}

function CategoryCard({
  category,
  transactionCount,
  onEdit,
  onDelete,
}: {
  category: Category
  transactionCount: number
  onEdit: (cat: Category) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <CategoryIconBadge icon={category.icon} color={category.color} size="md" />
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDelete(category.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-red-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => onEdit(category)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Pencil size={13} />
          </button>
        </div>
      </div>

      <div>
        <p className="font-semibold text-gray-900">{category.name}</p>
        {category.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{category.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <CategoryBadge name={category.name} color={category.color} />
        <span className="text-xs text-gray-400">
          {transactionCount} {transactionCount === 1 ? 'item' : 'itens'}
        </span>
      </div>
    </div>
  )
}
