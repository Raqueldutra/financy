import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@apollo/client'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { CREATE_TRANSACTION, UPDATE_TRANSACTION } from '../../graphql/mutations'
import { GET_TRANSACTIONS, GET_CATEGORIES } from '../../graphql/queries'
import type { Transaction, Category } from '../../types'
import { cn, parseDate } from '../../lib/utils'

const schema = z.object({
  title: z.string().min(1, 'Descrição é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
  type: z.enum(['EXPENSE', 'INCOME']),
  categoryId: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface TransactionModalProps {
  open: boolean
  onClose: () => void
  transaction?: Transaction | null
}

export function TransactionModal({ open, onClose, transaction }: TransactionModalProps) {
  const isEditing = !!transaction

  const { data: categoriesData } = useQuery<{ categories: Category[] }>(GET_CATEGORIES)

  const [createTransaction, { loading: creating }] = useMutation(CREATE_TRANSACTION, {
    refetchQueries: [{ query: GET_TRANSACTIONS }],
  })

  const [updateTransaction, { loading: updating }] = useMutation(UPDATE_TRANSACTION, {
    refetchQueries: [{ query: GET_TRANSACTIONS }],
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'EXPENSE',
      amount: 0,
    },
  })

  const selectedType = watch('type')

  useEffect(() => {
    if (open && transaction) {
      reset({
        title: transaction.title,
        date: parseDate(transaction.date).toISOString().split('T')[0],
        amount: transaction.amount,
        type: transaction.type,
        categoryId: transaction.category?.id ?? '',
      })
    } else if (open) {
      reset({ type: 'EXPENSE', amount: 0, title: '', date: '', categoryId: '' })
    }
  }, [open, transaction, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const variables = {
        title: data.title,
        amount: data.amount,
        type: data.type,
        date: new Date(data.date).toISOString(),
        categoryId: data.categoryId || undefined,
      }

      if (isEditing) {
        await updateTransaction({ variables: { id: transaction.id, ...variables } })
      } else {
        await createTransaction({ variables })
      }
      onClose()
    } catch {
      // handled by Apollo error
    }
  }

  const categoryOptions = (categoriesData?.categories ?? []).map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar transação' : 'Nova transação'}
      description="Registre sua despesa ou receita"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setValue('type', 'EXPENSE')}
            className={cn(
              'flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
              selectedType === 'EXPENSE'
                ? 'bg-white text-red-500 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <TrendingDown size={16} />
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setValue('type', 'INCOME')}
            className={cn(
              'flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
              selectedType === 'INCOME'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <TrendingUp size={16} />
            Receita
          </button>
        </div>

        {/* Descrição */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Descrição</label>
          <Input
            placeholder="Ex. Almoço no restaurante"
            error={errors.title?.message}
            {...register('title')}
          />
        </div>

        {/* Data e Valor */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Data</label>
            <Input type="date" error={errors.date?.message} {...register('date')} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Valor</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">
                R$
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                className="pl-9"
                placeholder="0,00"
                error={errors.amount?.message}
                {...register('amount')}
              />
            </div>
          </div>
        </div>

        {/* Categoria */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Categoria</label>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                options={categoryOptions}
                placeholder="Selecione"
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={creating || updating}
        >
          Salvar
        </Button>
      </form>
    </Dialog>
  )
}
