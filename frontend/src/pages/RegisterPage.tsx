import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@apollo/client'
import { Mail, Lock, Eye, EyeOff, User, Coins, LogIn } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/AuthContext'
import { REGISTER } from '../graphql/mutations'
import type { User as UserType } from '../types'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const [registerMutation, { loading }] = useMutation<{
    register: { token: string; user: UserType }
  }>(REGISTER)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      const result = await registerMutation({ variables: data })
      if (result.data) {
        login(result.data.register.token, result.data.register.user)
        navigate('/dashboard')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta'
      setServerError(msg.includes('already in use') ? 'Este e-mail já está em uso' : msg)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 text-primary-700 mb-6">
        <Coins size={32} />
        <span className="font-bold text-2xl tracking-widest">FINANCY</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Criar conta</h1>
        <p className="text-gray-500 text-center mt-1 mb-6">Comece a controlar suas finanças ainda hoje</p>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Nome completo</label>
            <Input
              placeholder="Seu nome completo"
              icon={<User size={16} />}
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">E-mail</label>
            <Input
              type="email"
              placeholder="mail@exemplo.com"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Digite sua senha"
              icon={<Lock size={16} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />
            <p className="text-xs text-gray-400">A senha deve ter no mínimo 8 caracteres</p>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Cadastrar
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-sm text-gray-400">ou</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center mb-3">Já tem uma conta?</p>

        <Link to="/">
          <Button variant="outline" className="w-full" size="lg">
            <LogIn size={16} />
            Fazer login
          </Button>
        </Link>
      </div>
    </div>
  )
}
