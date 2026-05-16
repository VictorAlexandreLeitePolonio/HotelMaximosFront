import { createFileRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { PasswordInput } from '@/components/password-input'
import { loginSession } from '@/lib/auth-session'
import { ApiError } from '@/lib/api-core'
import { useAuthStore } from '@/stores/auth-store'

const loginSchema = z.object({
  login: z.string().trim().min(1, 'Informe o login.'),
  senha: z.string().min(1, 'Informe a senha.'),
})

export const Route = createFileRoute('/(public)/login')({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const search = Route.useSearch()
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const destination = useMemo(() => {
    if (user?.deveAlterarSenha) {
      return '/perfil' as const
    }

    return (
      search.redirect as
        | '/dashboard'
        | '/perfil'
        | '/usuarios'
        | '/hospedes'
        | '/categorias'
        | '/flats'
        | undefined
    ) || '/dashboard'
  }, [search.redirect, user?.deveAlterarSenha])

  useEffect(() => {
    if (status === 'authenticated' && location.pathname === '/login') {
      void navigate({ to: destination, replace: true })
    }
  }, [destination, location.pathname, navigate, status])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsed = loginSchema.safeParse({ login, senha })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Dados invalidos.')
      return
    }

    setIsSubmitting(true)

    try {
      await loginSession(parsed.data)
    } catch (submissionError) {
      setError(
        submissionError instanceof ApiError
          ? submissionError.message
          : 'Nao foi possivel autenticar.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-shell">
      <section className="login-copy">
        <span className="eyebrow">Hotel Maximos</span>
        <h1>Controle de acesso alinhado ao backend da Sprint 1.</h1>
        <p>
          Login por <strong>login + senha</strong>, refresh em <strong>401</strong>,
          bloqueio por perfil e troca obrigatoria de senha quando
          <code>deveAlterarSenha</code> vier ativa.
        </p>
      </section>

      <motion.section
        className="login-panel"
        initial={{ opacity: 0, rotateY: -12, x: 36 }}
        animate={{ opacity: 1, rotateY: 0, x: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="door-glow" />
        <div className="panel-header">
          <span className="page-kicker">Acesso institucional</span>
          <h2>Entrar</h2>
          <p>Use o mesmo contrato ja validado no backend.</p>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Login</span>
            <input
              autoComplete="username"
              name="login"
              onChange={(event) => setLogin(event.target.value)}
              placeholder="admin"
              value={login}
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <PasswordInput
              autoComplete="current-password"
              name="senha"
              onChange={setSenha}
              placeholder="••••••••"
              value={senha}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </motion.section>
    </main>
  )
}
