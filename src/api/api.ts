import axios, { AxiosError } from 'axios'
import type { ApiErrorBody } from '../types/api'
import { tokenStorage } from '../utils/storage'

// La URL base solo viene de la variable de entorno (regla del enunciado)
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  timeout: 20000,
})

// Request interceptor: agrega el JWT a cada petición si existe
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Evento global para avisar al AuthContext que la sesión ya no es válida
export const UNAUTHORIZED_EVENT = 'logpose:unauthorized'

// Response interceptor: un 401 fuera de login/register significa sesión inválida o expirada
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const url = error.config?.url ?? ''
    const isAuthForm = url.includes('/auth/login') || url.includes('/auth/register')
    if (error.response?.status === 401 && !isAuthForm) {
      tokenStorage.remove()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    return Promise.reject(error)
  },
)

export default apiClient

// ===== Normalización de errores =====
export class ApiError extends Error {
  status: number
  code: string
  details: { field: string; message: string }[]
  body: ApiErrorBody | null

  constructor(status: number, code: string, message: string, body: ApiErrorBody | null) {
    super(message)
    this.status = status
    this.code = code
    this.details = body?.details ?? []
    this.body = body
  }
}

// true si la request fue cancelada por un AbortController (no es un error real)
export function isCanceled(error: unknown): boolean {
  return axios.isCancel(error)
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data ?? null
    if (error.response) {
      return new ApiError(error.response.status, body?.code ?? 'HTTP_ERROR', body?.message ?? `Error ${error.response.status}`, body)
    }
    return new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar con el servidor', null)
  }
  return new ApiError(0, 'UNKNOWN', 'Error inesperado', null)
}
