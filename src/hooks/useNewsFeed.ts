import { useCallback, useEffect, useRef, useState } from 'react'
import { getNewsFeed } from '../api/news.service'
import { isCanceled, toApiError, type ApiError } from '../api/api'
import type { NewsItem } from '../types/api'
import { matchesNewsFilters, newsFiltersKey, type NewsFilters } from '../utils/newsParams'

interface FeedState {
  items: NewsItem[]
  nextCursor: string | null
  hasMore: boolean
}

const EMPTY: FeedState = { items: [], nextCursor: null, hasMore: true }

// Infinite scroll con cursor: dedup por id, 1 carga en vuelo, descarte de respuestas obsoletas
export function useNewsFeed(filters: NewsFilters) {
  const key = newsFiltersKey(filters)
  const [feed, setFeed] = useState<FeedState>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  // Refs: no provocan render y siempre tienen el valor actual
  const inFlight = useRef<AbortController | null>(null)
  const activeKey = useRef(key)
  const feedRef = useRef(feed)
  feedRef.current = feed

  const loadNext = useCallback(() => {
    const current = feedRef.current
    // Regla: una sola carga en vuelo y nada más si ya no hay páginas
    if (inFlight.current || !current.hasMore) return

    const controller = new AbortController()
    inFlight.current = controller
    const requestKey = activeKey.current
    setLoading(true)
    setError(null)

    getNewsFeed(filters, current.nextCursor, controller.signal)
      .then((page) => {
        // Si los filtros cambiaron mientras tanto, esta respuesta no se mezcla
        if (requestKey !== activeKey.current) return
        setFeed((prev) => {
          // Regla de Nami: ninguna noticia se cuenta dos veces
          const seen = new Set(prev.items.map((n) => n.id))
          const fresh = page.items.filter((n) => !seen.has(n.id))
          return {
            items: [...prev.items, ...fresh],
            nextCursor: page.nextCursor,
            hasMore: page.hasMore && page.nextCursor !== null,
          }
        })
      })
      .catch((err: unknown) => {
        if (isCanceled(err) || requestKey !== activeKey.current) return
        // El error no borra lo ya cargado; se puede reintentar la misma página
        setError(toApiError(err))
      })
      .finally(() => {
        if (inFlight.current === controller) {
          inFlight.current = null
          setLoading(false)
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Cambio real de filtros: se cancela lo pendiente, se reinicia el cursor y se carga la primera página
  useEffect(() => {
    activeKey.current = key
    inFlight.current?.abort()
    inFlight.current = null
    feedRef.current = EMPTY
    setFeed(EMPTY)
    setError(null)
    setLoading(false)
    loadNext()
    return () => {
      inFlight.current?.abort()
      inFlight.current = null
    }
  }, [key, loadNext])

  // Tras verificar una noticia: se actualiza en el feed o se retira si ya no cumple el filtro
  const reconcile = useCallback(
    (updated: NewsItem) => {
      setFeed((prev) => ({
        ...prev,
        items: matchesNewsFilters(updated, filters)
          ? prev.items.map((n) => (n.id === updated.id ? { ...n, ...updated } : n))
          : prev.items.filter((n) => n.id !== updated.id),
      }))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )

  return { ...feed, loading, error, loadNext, reconcile }
}
