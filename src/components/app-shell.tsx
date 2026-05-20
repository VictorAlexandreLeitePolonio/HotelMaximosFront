import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  BedDouble,
  Building2,
  CalendarDays,
  KeyRound,
  LogIn,
  LogOut,
  Shapes,
  Shield,
  UserCog,
  UserRound,
} from 'lucide-react'
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
          <span className="eyebrow">Sprint 5</span>
          <strong>Hotel Maximos</strong>
          <p>Operacao de reservas, check-in e estadias ativas sobre a base de hospedes e flats.</p>
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
              active={location.pathname.startsWith('/usuarios')}
            />
          ) : null}
          {user?.perfil === 'Admin' ? (
            <NavItem
              to="/categorias"
              label="Categorias"
              icon={<Shapes size={18} />}
              active={location.pathname.startsWith('/categorias')}
            />
          ) : null}
          {user?.perfil === 'Admin' ? (
            <NavItem
              to="/flats"
              label="Flats"
              icon={<Building2 size={18} />}
              active={location.pathname.startsWith('/flats')}
            />
          ) : null}
          <NavItem
            to="/hospedes"
            label="Hospedes"
            icon={<BedDouble size={18} />}
            active={location.pathname.startsWith('/hospedes')}
          />
          <NavItem
            to="/reservas"
            label="Reservas"
            icon={<CalendarDays size={18} />}
            active={location.pathname.startsWith('/reservas')}
          />
          <NavItem
            to="/check-in"
            label="Check-in do dia"
            icon={<LogIn size={18} />}
            active={location.pathname.startsWith('/check-in')}
          />
          <NavItem
            to="/estadias-ativas"
            label="Estadias ativas"
            icon={<KeyRound size={18} />}
            active={location.pathname.startsWith('/estadias-ativas')}
          />
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
  to:
    | '/dashboard'
    | '/perfil'
    | '/usuarios'
    | '/categorias'
    | '/flats'
    | '/hospedes'
    | '/reservas'
    | '/check-in'
    | '/estadias-ativas'
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
