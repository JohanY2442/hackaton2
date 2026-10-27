import { useMemo } from 'react'
import { Link, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { useNewsFeed } from '../hooks/useNewsFeed'
import { useInfiniteSentinel } from '../hooks/useInfiniteSentinel'
import { NEWS_PRIORITIES, NEWS_STATUSES, NEWS_TYPES, type NewsItem } from '../types/api'
import { parseNewsParams, toNewsParams, type NewsFilters } from '../utils/newsParams'
import { formatDate, prettyEnum } from '../utils/format'
import { PriorityBadge, StatusBadge } from '../components/news/NewsBadges'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import LockedState from '../components/ui/LockedState'
import Spinner from '../components/ui/Spinner'

export interface NewsOutletContext {
  reconcile: (item: NewsItem) => void
}

const selectClass = 'mt-1 w-full rounded-lg border border-sand-100/20 bg-sea-950 px-3 py-2 text-sm'

export default function NewsFeedPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const filters = useMemo(() => parseNewsParams(searchParams), [searchParams])
  const { items, hasMore, loading, error, loadNext, reconcile } = useNewsFeed(filters)

  // Centinela: solo activo si hay más páginas y no hay error (el error se reintenta a mano)
  const sentinelRef = useInfiniteSentinel(loadNext, hasMore && !error, items.length)

  const setFilter = (patch: Partial<NewsFilters>) => {
    setSearchParams(toNewsParams({ ...filters, ...patch }))
  }

  const locked = error?.status === 423
  const firstLoad = items.length === 0

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">📰 News Coo · Noticias del mundo</h1>

      <div className="grid gap-3 rounded-xl border border-sand-100/10 bg-sea-900 p-4 sm:grid-cols-3">
        <label className="text-sm"><span className="font-semibold">Tipo</span>
          <select className={selectClass} value={filters.type} onChange={(e) => setFilter({ type: e.target.value as NewsFilters['type'] })}>
            <option value="">Todos</option>
            {NEWS_TYPES.map((t) => <option key={t} value={t}>{prettyEnum(t)}</option>)}
          </select>
        </label>
        <label className="text-sm"><span className="font-semibold">Prioridad</span>
          <select className={selectClass} value={filters.priority} onChange={(e) => setFilter({ priority: e.target.value as NewsFilters['priority'] })}>
            <option value="">Todas</option>
            {NEWS_PRIORITIES.map((p) => <option key={p} value={p}>{prettyEnum(p)}</option>)}
          </select>
        </label>
        <label className="text-sm"><span className="font-semibold">Estado</span>
          <select className={selectClass} value={filters.status} onChange={(e) => setFilter({ status: e.target.value as NewsFilters['status'] })}>
            <option value="">Todos</option>
            {NEWS_STATUSES.map((s) => <option key={s} value={s}>{prettyEnum(s)}</option>)}
          </select>
        </label>
      </div>

      {locked ? (
        <LockedState />
      ) : (
        <>
          {firstLoad && error && <ErrorState message={error.message} onRetry={loadNext} retrying={loading} />}
          {firstLoad && !error && !loading && !hasMore && <EmptyState title="No hay noticias con estos filtros" />}

          <ul className="space-y-3">
            {items.map((news) => (
              <li key={news.id}>
                <Link
                  to={`/news/${news.id}${location.search}`}
                  state={{ fromFeed: true }}
                  className="block rounded-xl border border-sand-100/10 bg-sea-900 p-4 hover:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={news.status} />
                    <PriorityBadge priority={news.priority} />
                    <span className="text-xs opacity-70">{prettyEnum(news.type)} · {news.island}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-bold">{news.title}</h2>
                  <p className="text-sm opacity-85">{news.summary}</p>
                  <p className="mt-1 text-xs opacity-60">{news.source} · {formatDate(news.publishedAt)}</p>
                </Link>
              </li>
            ))}
          </ul>

          {/* Error en una página posterior: lo cargado se queda, se reintenta solo esa página */}
          {!firstLoad && error && <ErrorState message={`No se pudo cargar más noticias: ${error.message}`} onRetry={loadNext} retrying={loading} />}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm"><Spinner /> Cargando noticias...</div>
          )}

          {!hasMore && !firstLoad && <p className="py-6 text-center text-sm opacity-70">— Fin de las noticias —</p>}

          <div ref={sentinelRef} aria-hidden="true" className="h-1" />
        </>
      )}

      {/* Detalle encima del feed: el feed no se desmonta, conserva datos y posición */}
      <Outlet context={{ reconcile } satisfies NewsOutletContext} />
    </div>
  )
}
