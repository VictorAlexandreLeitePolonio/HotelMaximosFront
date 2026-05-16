import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { LogOut, Shield, UserCog, UserRound } from 'lucide-react'
import { logoutSession } from '@/lib/auth-session'
import { useAuthStore } from '@/stores/auth-store'

type AppShellProps = {
  title: string
  description: string
  children: ReactNode
}

export function AppShell({ title, description, children }: AppShellProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  async function handleLogout() {
    await logoutSession()
    await navigate({ to: '/login' })
  }

  return (
    <main className="app-shell">
      <aside className="app-sidebar">
        <div className="brand-block">
          <span className="eyebrow">Sprint 1</span>
          <strong>Hotel Maximos</strong>
          <p>Usuarios, acesso e sessao alinhados ao backend.</p>
        </div>

        <nav className="app-nav">
          <NavItem
            to="/dashboard"
            label="Dashboard"
            icon={<Shield size={18} />}
            active={location.pathname === '/dashboard'}
          />
          <NavItem
            to="/perfil"
            label="Meu perfil"
            icon={<UserRound size={18} />}
            active={location.pathname === '/perfil'}
          />
          {user?.perfil === 'Admin' ? (
            <NavItem
              to="/usuarios"
              label="Usuarios"
              icon={<UserCog size={18} />}
              active={location.pathname === '/usuarios'}
            />
          ) : null}
        </nav>

        <button className="ghost-button sidebar-logout" onClick={handleLogout} type="button">
          <LogOut size={18} />
          Sair
        </button>
      </aside>

      <section className="app-content">
        <header className="page-header">
          <div>
            <span className="page-kicker">{user?.perfil || 'Sessao'}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          {user ? (
            <div className="session-badge">
              <strong>{user.nomeCompleto}</strong>
              <span>{user.login}</span>
            </div>
          ) : null}
        </header>

        {children}
      </section>
    </main>
  )
}

type NavItemProps = {
  to: '/dashboard' | '/perfil' | '/usuarios'
  label: string
  icon: ReactNode
  active: boolean
}

function NavItem({ to, label, icon, active }: NavItemProps) {
  return (
    <Link
      to={to}
      className={active ? 'nav-link nav-link-active' : 'nav-link'}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}
