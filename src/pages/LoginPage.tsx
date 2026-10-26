import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { toApiError } from '../api/api'
import AuthCard from '../components/AuthCard'
import TextField from '../components/ui/TextField'
import type { RedirectState } from '../routes/PrivateRoute'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as RedirectState | null)?.from

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login({ email: email.trim(), password })
      // Vuelve exactamente a la ruta privada que se intentó abrir
      navigate(from && from.startsWith('/') ? from : '/dashboard', { replace: true })
    } catch (err) {
      const apiError = toApiError(err)
      setError(apiError.status === 401 ? 'Email o contraseña incorrectos.' : apiError.message)
      setSubmitting(false)
    }
  }

  return (
    <AuthCard title="Zarpar" subtitle="Inicia sesión con la cuenta de tu tripulación">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextField label="Email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Contraseña" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && (
          <p role="alert" className="rounded-lg bg-red-950/60 p-2 text-sm text-red-200">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting || !email || !password}
          className="w-full rounded-lg bg-gold-400 py-2 font-bold text-sea-950 hover:brightness-110 disabled:opacity-50"
        >
          {submitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        ¿Nueva tripulación?{' '}
        <Link to="/register" state={location.state} className="font-semibold text-gold-400 underline">
          Regístrala
        </Link>
      </p>
    </AuthCard>
  )
}
