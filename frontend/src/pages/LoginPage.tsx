import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@apollo/client'
import { Mail, Lock, Eye, EyeOff, Coins, UserPlus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/AuthContext'
import { LOGIN } from '../graphql/mutations'
import type { User } from '../types'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const [loginMutation, { loading }] = useMutation<{
    login: { token: string; user: User }
  }>(LOGIN)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      const result = await loginMutation({ variables: data })
      if (result.data) {
        login(result.data.login.token, result.data.login.user)
        navigate('/dashboard')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao fazer login'
      setServerError(msg.includes('Invalid credentials') ? 'E-mail ou senha incorretos' : msg)
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
        <h1 className="text-2xl font-bold text-gray-900 text-center">Fazer login</h1>
        <p className="text-gray-500 text-center mt-1 mb-6">Entre na sua conta para continuar</p>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600" />
              <span className="text-sm text-gray-600">Lembrar-me</span>
            </label>
            <button type="button" className="text-sm text-primary-700 hover:underline font-medium">
              Recuperar senha
            </button>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Entrar
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

        <p className="text-sm text-gray-500 text-center mb-3">Ainda não tem uma conta?</p>

        <Link to="/register">
          <Button variant="outline" className="w-full" size="lg">
            <UserPlus size={16} />
            Criar conta
          </Button>
        </Link>
      </div>
    </div>
  )
}
