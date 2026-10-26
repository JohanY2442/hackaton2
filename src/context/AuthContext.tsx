import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authService from '../api/auth.service'
import { UNAUTHORIZED_EVENT, isCanceled, toApiError } from '../api/api'
import { tokenStorage } from '../utils/storage'
import type { LoginRequest, LoginResponse, RegisterRequest, Team, User } from '../types/api'

// checking: hay token y se está validando con /auth/me (no mostrar login todavía)
export type AuthStatus = 'checking' | 'authenticated' | 'anonymous' | 'error'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  team: Team | null
  login: (body: LoginRequest) => Promise<void>
  register: (body: RegisterRequest) => Promise<void>
  logout: () => void
  retryRestore: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStorage.get() ? 'checking' : 'anonymous'))
  const [user, setUser] = useState<User | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [restoreAttempt, setRestoreAttempt] = useState(0)

  const clearSession = useCallback(() => {
    tokenStorage.remove()
    setUser(null)
    setTeam(null)
    setExpiresAt(null)
    setStatus('anonymous')
  }, [])

  // Restaurar sesión al cargar la app (F5 o reabrir el navegador)
  useEffect(() => {
    if (!tokenStorage.get()) {
      setStatus('anonymous')
      return
    }
    const controller = new AbortController()
    setStatus('checking')
    authService
      .getMe(controller.signal)
      .then((me) => {
        setUser(me.user)
        setTeam(me.team)
        setExpiresAt(me.expiresAt)
        setStatus('authenticated')
      })
      .catch((error: unknown) => {
        if (isCanceled(error)) return
        const apiError = toApiError(error)
        if (apiError.status === 401) {
          clearSession()
        } else {
          // Servidor caído o sin red: no botamos al usuario, permitimos reintentar
          setStatus('error')
        }
      })
    return () => controller.abort()
  }, [restoreAttempt, clearSession])

  // Si cualquier request devuelve 401, la sesión dejó de ser válida -> login
  useEffect(() => {
    const onUnauthorized = () => clearSession()
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [clearSession])

  // Cerrar sesión automáticamente cuando el token expira
  useEffect(() => {
    if (!expiresAt) return
    const ms = new Date(expiresAt).getTime() - Date.now()
    if (Number.isNaN(ms)) return
    if (ms <= 0) {
      clearSession()
      return
    }
    // setTimeout acepta como máximo ~24.8 días
    const timer = window.setTimeout(clearSession, Math.min(ms, 2_147_000_000))
    return () => window.clearTimeout(timer)
  }, [expiresAt, clearSession])

  const startSession = useCallback((response: LoginResponse) => {
    tokenStorage.set(response.token)
    setUser(response.user)
    setTeam(response.team)
    setExpiresAt(response.expiresAt)
    setStatus('authenticated')
  }, [])

  const login = useCallback(
    async (body: LoginRequest) => {
      startSession(await authService.login(body))
    },
    [startSession],
  )

  const register = useCallback(
    async (body: RegisterRequest) => {
      startSession(await authService.register(body))
    },
    [startSession],
  )

  const retryRestore = useCallback(() => setRestoreAttempt((n) => n + 1), [])

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, team, login, register, logout: clearSession, retryRestore }),
    [status, user, team, login, register, clearSession, retryRestore],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
