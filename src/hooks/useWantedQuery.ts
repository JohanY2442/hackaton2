import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getWanted } from '../api/wanted.service'
import { isCanceled, toApiError, type ApiError } from '../api/api'
import type { WantedPage } from '../types/api'
import { parseWantedParams, toWantedParams, type WantedQuery } from '../utils/wantedParams'

export function useWantedQuery() {
  const [searchParams, setSearchParams] = useSearchParams()

  // 1) La URL es la fuente de verdad: se parsea y valida en cada render
  const query = useMemo(() => parseWantedParams(searchParams), [searchParams])
  const queryKey = toWantedParams(query).toString()

  const [data, setData] = useState<WantedPage | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)
  const lastRequestId = useRef(0)

  // 2) Si la URL trae valores inválidos (ej. ?page=abc&size=7), se reemplaza por la versión limpia
  useEffect(() => {
    if (searchParams.toString() !== queryKey) {
      setSearchParams(new URLSearchParams(queryKey), { replace: true })
    }
  }, [searchParams, queryKey, setSearchParams])

  // 3) Cambiar filtros/búsqueda/orden/tamaño reinicia a la página 0; cambiar página no
  const updateQuery = useCallback(
    (patch: Partial<WantedQuery>) => {
      const resetsPage = Object.keys(patch).some((key) => key !== 'page')
      const next: WantedQuery = { ...query, ...patch, page: resetsPage ? 0 : (patch.page ?? query.page) }
      setSearchParams(toWantedParams(next))
    },
    [query, setSearchParams],
  )

  // 4) Request al backend; la respuesta vieja se aborta y además se descarta por id
  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++lastRequestId.current
    setLoading(true)
    setError(null)

    getWanted(query, controller.signal)
      .then((page) => {
        if (requestId !== lastRequestId.current) return // llegó tarde: se ignora
        // Si la página pedida ya no existe (ej. ?page=99), se lleva a la última válida
        if (query.page > 0 && query.page >= page.totalPages) {
          setSearchParams(toWantedParams({ ...query, page: Math.max(0, page.totalPages - 1) }), { replace: true })
          return
        }
        setData(page)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (isCanceled(err) || requestId !== lastRequestId.current) return
        setError(toApiError(err))
        setLoading(false)
      })

    return () => controller.abort()
    // queryKey resume todo el estado de la query
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { query, data, error, loading, updateQuery, retry }
}
