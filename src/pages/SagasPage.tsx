import { Link } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { getSagas } from '../api/sagas.service'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import LockedState from '../components/ui/LockedState'
import Spinner from '../components/ui/Spinner'

export default function SagasPage() {
  const { data, error, loading, reload } = useFetch((signal) => getSagas(signal), [])
  const sagas = data ? [...data].sort((a, b) => a.order - b.order) : []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">📜 Poneglyph · Sagas del Grand Line</h1>

      {loading && !data && <div className="flex items-center gap-2"><Spinner /> Cargando sagas...</div>}
      {error && (error.status === 423 ? <LockedState /> : <ErrorState message={error.message} onRetry={reload} retrying={loading} />)}
      {data && !error && sagas.length === 0 && <EmptyState title="No hay sagas disponibles" />}

      <div className="grid gap-4 md:grid-cols-2">
        {sagas.map((saga) => (
          <Link
            key={saga.id}
            to={`/sagas/${saga.id}`}
            // View Transition API: React Router la usa si el navegador la soporta; si no, navegación normal
            viewTransition
            className="block rounded-2xl p-5 shadow-lg ring-gold-400 transition hover:-translate-y-1 hover:ring-2 focus:outline-none focus:ring-2"
            style={{ background: saga.palette.surface, color: saga.palette.text, viewTransitionName: `saga-${saga.id}` }}
          >
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: saga.palette.accent }}>Saga {saga.order}</p>
            <h2 className="text-2xl font-black" style={{ color: saga.palette.primary }}>{saga.title}</h2>
            <p className="text-sm italic opacity-90">{saga.subtitle}</p>
            <p className="mt-3 text-sm leading-relaxed">{saga.synopsis}</p>
            <p className="mt-3 text-xs opacity-80">
              {saga.firstIsland} → {saga.lastIsland} · {saga.stageCount} etapas · {saga.totalDistanceNm.toLocaleString('es-PE')} nm
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
