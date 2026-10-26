import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/wanted', label: 'Se Busca' },
  { to: '/news', label: 'News Coo' },
  { to: '/sagas', label: 'Sagas' },
]

export default function AppLayout() {
  const { team, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-sand-100/10 bg-sea-900/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <span className="mr-4 font-black tracking-wide text-gold-400">🧭 Log Pose Console</span>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-semibold ${isActive ? 'bg-gold-400 text-sea-950' : 'hover:bg-sea-700'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="ml-auto flex items-center gap-3 text-sm">
            {team && (
              <span className="opacity-80">
                {team.name} · <strong>{team.code}</strong>
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-sand-100/30 px-3 py-1.5 font-semibold hover:bg-sea-700"
            >
              Salir
            </button>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
