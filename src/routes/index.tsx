import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  const navigate = useNavigate()
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (status === 'authenticated') {
      void navigate({ to: user?.deveAlterarSenha ? '/perfil' : '/dashboard' })
      return
    }

    if (status === 'anonymous') {
      void navigate({ to: '/login' })
    }
  }, [navigate, status, user?.deveAlterarSenha])

  return (
    <main className="auth-loading-shell">
      <section className="auth-loading-card">
        <span className="eyebrow">Hotel Maximos</span>
        <h1>Preparando a Sprint 1</h1>
        <p>Redirecionando voce para a rota correta de autenticacao ou dashboard.</p>
      </section>
    </main>
  )
}
