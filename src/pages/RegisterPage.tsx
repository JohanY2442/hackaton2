import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { toApiError } from '../api/api'
import AuthCard from '../components/AuthCard'
import TextField from '../components/ui/TextField'
import type { RedirectState } from '../routes/PrivateRoute'

type Field = 'teamName' | 'email' | 'password'
type FieldErrors = Partial<Record<Field, string>>

function validate(teamName: string, email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  if (teamName.trim().length < 3 || teamName.length > 40) errors.teamName = 'Entre 3 y 40 caracteres.'
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 120) errors.email = 'Email inválido.'
  if (password.length < 8 || password.length > 72) errors.password = 'Entre 8 y 72 caracteres.'
  return errors
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as RedirectState | null)?.from

  const [teamName, setTeamName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    const localErrors = validate(teamName, email, password)
    setFieldErrors(localErrors)
    if (Object.keys(localErrors).length > 0) return

    setSubmitting(true)
    try {
      await register({ teamName: teamName.trim(), email: email.trim(), password })
      // El registro ya devuelve el token: entra directo con sesión iniciada
      navigate(from && from.startsWith('/') ? from : '/dashboard', { replace: true })
    } catch (err) {
      const apiError = toApiError(err)
      const serverErrors: FieldErrors = {}
      // 400 VALIDATION_ERROR: details trae el campo exacto
      for (const detail of apiError.details) {
        const field = detail.field.split('.').pop() as Field
        if (field === 'teamName' || field === 'email' || field === 'password') serverErrors[field] = detail.message
      }
      // Conflictos (409): email o nombre ya registrados
      if (apiError.status === 409) {
        const text = `${apiError.code} ${apiError.message}`.toLowerCase()
        if (text.includes('email')) serverErrors.email = apiError.message
        else serverErrors.teamName = apiError.message
      }
      setFieldErrors(serverErrors)
      if (Object.keys(serverErrors).length === 0) setFormError(apiError.message)
      setSubmitting(false)
    }
  }

  return (
    <AuthCard title="Registrar tripulación" subtitle="Crea la cuenta de tu equipo de cazarrecompensas">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <TextField label="Nombre de la tripulación" name="teamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} error={fieldErrors.teamName} maxLength={40} />
        <TextField label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} />
        <TextField label="Contraseña" name="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} />
        {formError && (
          <p role="alert" className="rounded-lg bg-red-950/60 p-2 text-sm text-red-200">
            {formError}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-gold-400 py-2 font-bold text-sea-950 hover:brightness-110 disabled:opacity-50"
        >
          {submitting ? 'Registrando...' : 'Registrar y zarpar'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        ¿Ya tienen cuenta?{' '}
        <Link to="/login" state={location.state} className="font-semibold text-gold-400 underline">
          Inicia sesión
        </Link>
      </p>
    </AuthCard>
  )
}
