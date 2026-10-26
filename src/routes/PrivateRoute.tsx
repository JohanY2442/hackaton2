import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import FullScreenLoader from '../components/ui/FullScreenLoader'
import ErrorState from '../components/ui/ErrorState'

export interface RedirectState {
  from?: string
}

export default function PrivateRoute() {
  const { status, retryRestore } = useAuth()
  const location = useLocation()

  // Mientras se valida el token NO se muestra el login (evita el parpadeo tras F5)
  if (status === 'checking') return <FullScreenLoader label="Verificando sesión..." />

  if (status === 'error') {
    return (
      <div className="min-h-screen grid place-items-center p-4">
        <ErrorState message="No se pudo verificar tu sesión." onRetry={retryRestore} />
      </div>
    )
  }

  if (status === 'anonymous') {
    // Guardamos a dónde quería ir (ruta + query) para volver después del login
    const from = location.pathname + location.search + location.hash
    return <Navigate to="/login" replace state={{ from } satisfies RedirectState} />
  }

  return <Outlet />
}
