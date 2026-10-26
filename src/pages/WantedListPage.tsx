import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useWantedQuery } from '../hooks/useWantedQuery'
import WantedFilters from '../components/wanted/WantedFilters'
import WantedCard from '../components/wanted/WantedCard'
import Pagination from '../components/wanted/Pagination'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'

const SCROLL_KEY = 'wanted-scroll:'

export default function WantedListPage() {
  const { query, data, error, loading, updateQuery, retry } = useWantedQuery()
  const location = useLocation()
  const restored = useRef(false)

  // Al volver del detalle, se restaura el scroll guardado para esta misma URL
  useEffect(() => {
    if (restored.current || loading || !data) return
    restored.current = true
    const saved = sessionStorage.getItem(SCROLL_KEY + location.search)
    if (saved) window.scrollTo(0, Number(saved))
  }, [loading, data, location.search])

  useEffect(() => {
    const key = SCROLL_KEY + location.search
    const save = () => sessionStorage.setItem(key, String(window.scrollY))
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [location.search])

  const hasResults = data !== null && data.content.length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-2xl font-black">Carteles de "Se Busca"</h1>
        <p className="flex items-center gap-2 text-sm opacity-80" aria-live="polite">
          {loading && <Spinner className="h-4 w-4" />}
          {data && `${data.totalElements} resultados`}
        </p>
      </div>

      <WantedFilters query={query} onChange={updateQuery} />

      {/* Contenedor con altura mínima: loading/error/vacío no mueven el layout */}
      <section className="relative min-h-[60vh]" aria-busy={loading}>
        {error ? (
          <ErrorState message={error.message} onRetry={retry} retrying={loading} />
        ) : !data ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => <div key={i} className="h-80 animate-pulse rounded-lg bg-sea-900" />)}
          </div>
        ) : !hasResults ? (
          !loading && <EmptyState title="Sin resultados" hint="Prueba con otros filtros o búsqueda." />
        ) : (
          // Mientras carga la siguiente consulta se mantienen los datos actuales atenuados
          <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-opacity ${loading ? 'pointer-events-none opacity-50' : ''}`}>
            {data.content.map((w) => <WantedCard key={w.id} wanted={w} />)}
          </div>
        )}
      </section>

      {data && !error && (
        <Pagination page={query.page} totalPages={data.totalPages} disabled={loading} onChange={(page) => {
          updateQuery({ page })
          window.scrollTo({ top: 0 })
        }} />
      )}
    </div>
  )
}
