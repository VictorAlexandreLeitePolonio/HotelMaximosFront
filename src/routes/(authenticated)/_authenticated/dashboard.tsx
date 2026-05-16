import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/components/app-shell'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/(authenticated)/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <AppShell
      title="Dashboard"
      description="Entrada protegida da Sprint 1, usada como destino padrao apos login bem-sucedido."
    >
      <section className="content-grid">
        <article className="stat-card">
          <span className="page-kicker">Sessao</span>
          <strong>{user?.perfil || '-'}</strong>
          <p>O acesso atual respeita guard por autenticacao, perfil e senha obrigatoria.</p>
        </article>

        <article className="stat-card">
          <span className="page-kicker">Login</span>
          <strong>{user?.login || '-'}</strong>
          <p>O frontend consome diretamente a API Fastify ja existente em `/api/auth/*`.</p>
        </article>

        <article className="stat-card">
          <span className="page-kicker">Decisao pendente</span>
          <strong>Dashboard operacional</strong>
          <p>
            A Sprint 1 do backend ainda nao expunha `GET /dashboard/operacional`,
            entao esta tela permanece como landing protegida do modulo de acesso.
          </p>
        </article>
      </section>
    </AppShell>
  )
}
