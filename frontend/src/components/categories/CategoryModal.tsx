import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@apollo/client'
import { Tag } from 'lucide-react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { ICON_MAP, ICON_LIST, CATEGORY_COLORS } from '../ui/CategoryIcon'
import { CREATE_CATEGORY, UPDATE_CATEGORY } from '../../graphql/mutations'
import { GET_CATEGORIES } from '../../graphql/queries'
import type { Category } from '../../types'
import { cn } from '../../lib/utils'

const schema = z.object({
  name: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  icon: z.string().default('tag'),
  color: z.string().default('#16A34A'),
})

type FormData = z.infer<typeof schema>

interface CategoryModalProps {
  open: boolean
  onClose: () => void
  category?: Category | null
}

export function CategoryModal({ open, onClose, category }: CategoryModalProps) {
  const isEditing = !!category

  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }],
  })

  const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }],
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      icon: 'tag',
      color: '#16A34A',
    },
  })

  const selectedIcon = watch('icon')
  const selectedColor = watch('color')

  useEffect(() => {
    if (open && category) {
      reset({
        name: category.name,
        description: category.description ?? '',
        icon: category.icon,
        color: category.color,
      })
    } else if (open) {
      reset({ name: '', description: '', icon: 'tag', color: '#16A34A' })
    }
  }, [open, category, reset])

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateCategory({
          variables: { id: category.id, ...data },
        })
      } else {
        await createCategory({ variables: data })
      }
      onClose()
    } catch {
      // handled by Apollo error
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar categoria' : 'Nova categoria'}
      description="Organize suas transações com categorias"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Título */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Título</label>
          <Input placeholder="Ex. Alimentação" error={errors.name?.message} {...register('name')} />
        </div>

        {/* Descrição */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Descrição</label>
          <Input placeholder="Descrição da categoria" {...register('description')} />
          <p className="text-xs text-gray-400">Opcional</p>
        </div>

        {/* Ícone */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Ícone</label>
          <div className="grid grid-cols-8 gap-1.5">
            {ICON_LIST.map((iconId) => {
              const Icon = ICON_MAP[iconId] ?? Tag
              const isSelected = selectedIcon === iconId
              return (
                <button
                  key={iconId}
                  type="button"
                  onClick={() => setValue('icon', iconId)}
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all',
                    isSelected
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50',
                  )}
                >
                  <Icon size={18} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Cor */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Cor</label>
          <div className="flex items-center gap-2">
            {CATEGORY_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={cn(
                  'w-9 h-9 rounded-lg transition-all',
                  selectedColor === color
                    ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                    : 'hover:scale-105',
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
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
