import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import FullScreenLoader from '../components/ui/FullScreenLoader'
import type { RedirectState } from './PrivateRoute'

// Login y registro: si ya hay sesión, se va directo a donde quería ir (o al dashboard)
export default function PublicOnlyRoute() {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'checking') return <FullScreenLoader label="Verificando sesión..." />
  if (status === 'authenticated') {
    const from = (location.state as RedirectState | null)?.from
    return <Navigate to={from && from.startsWith('/') ? from : '/dashboard'} replace />
  }
  return <Outlet />
}
