import { useCallback, useEffect, useState, type DependencyList } from 'react'
import { isCanceled, toApiError, type ApiError } from '../api/api'

interface FetchState<T> {
  data: T | null
  error: ApiError | null
  loading: boolean
  reload: () => void
}

// Petición simple con cancelación: si cambian las deps, se aborta la anterior
export function useFetch<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: DependencyList): FetchState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetcher(controller.signal)
      .then((result) => setData(result))
      .catch((err: unknown) => {
        if (!isCanceled(err)) setError(toApiError(err))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  return { data, error, loading, reload }
}
