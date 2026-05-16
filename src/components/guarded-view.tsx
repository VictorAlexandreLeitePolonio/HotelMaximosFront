import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

type GuardedViewProps = {
  children: ReactNode
  requireAdmin?: boolean
}

export function GuardedView({ children, requireAdmin = false }: GuardedViewProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (status === 'anonymous') {
      if (location.pathname === '/login') {
        return
      }

      void navigate({
        to: '/login',
        search: {
          redirect: location.pathname,
        },
        replace: true,
      })
      return
    }

    if (
      status === 'authenticated' &&
      user?.deveAlterarSenha &&
      location.pathname !== '/perfil'
    ) {
      void navigate({ to: '/perfil', replace: true })
      return
    }

    if (
      status === 'authenticated' &&
      requireAdmin &&
      user?.perfil !== 'Admin' &&
      location.pathname !== '/dashboard'
    ) {
      void navigate({ to: '/dashboard', replace: true })
    }
  }, [location.pathname, navigate, requireAdmin, status, user?.deveAlterarSenha, user?.perfil])

  const isLoading = status === 'idle' || status === 'hydrating'
  const isAnonymous = status === 'anonymous'
  const blockedByPassword =
    status === 'authenticated' &&
    Boolean(user?.deveAlterarSenha) &&
    location.pathname !== '/perfil'
  const blockedByProfile =
    status === 'authenticated' &&
    requireAdmin &&
    user?.perfil !== 'Admin'

  if (isLoading || isAnonymous || blockedByPassword || blockedByProfile) {
    return (
      <main className="auth-loading-shell">
        <section className="auth-loading-card">
          <span className="eyebrow">Carregando</span>
          <h1>Validando sua sessao</h1>
          <p>
            O frontend esta conferindo autenticacao, permissao e eventual troca
            obrigatoria de senha antes de abrir a rota.
          </p>
        </section>
      </main>
    )
  }

  return <>{children}</>
}
