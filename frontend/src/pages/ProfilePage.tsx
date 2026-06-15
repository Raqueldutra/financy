import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@apollo/client'
import { User, Mail, LogOut } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/AuthContext'
import { UPDATE_USER } from '../graphql/mutations'
import { getInitials } from '../lib/utils'
import { useNavigate } from 'react-router-dom'
import type { User as UserType } from '../types'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const [updateUserMutation, { loading }] = useMutation<{ updateUser: UserType }>(UPDATE_USER)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '' },
  })

  const onSubmit = async (data: FormData) => {
    setSuccess(false)
    setServerError('')
    try {
      const result = await updateUserMutation({ variables: { name: data.name } })
      if (result.data) {
        updateUser(result.data.updateUser)
        setSuccess(true)
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro ao salvar alterações')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 mb-3">
            {user ? getInitials(user.name) : '?'}
          </div>
          <p className="font-bold text-lg text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>

        <div className="border-t border-gray-100 pt-6">
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              Alterações salvas com sucesso!
            </div>
          )}

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nome completo</label>
              <Input
                icon={<User size={16} />}
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">E-mail</label>
              <Input
                value={user?.email ?? ''}
                icon={<Mail size={16} />}
                disabled
                readOnly
              />
              <p className="text-xs text-gray-400">O e-mail não pode ser alterado</p>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Salvar alterações
            </Button>
          </form>

          <div className="mt-3">
            <Button
              type="button"
              variant="danger"
              className="w-full"
              size="lg"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Sair da conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
