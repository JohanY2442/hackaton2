import { Link } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { getDashboardSummary, getLogPose } from '../api/dashboard.service'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import { formatBerries, formatDate, prettyEnum } from '../utils/format'
import { FRUIT_FILTERS, WANTED_STATUSES } from '../types/api'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-sand-100/10 bg-sea-900 p-4">
      <p className="text-xs uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-black text-gold-400">{value}</p>
    </div>
  )
}

function LogPoseCard() {
  const { data, error, loading, reload } = useFetch((signal) => getLogPose(signal), [])
  return (
    <section className="rounded-xl border border-sand-100/10 bg-sea-900 p-4">
      <h2 className="font-bold">🧭 Estado del Log Pose</h2>
      {loading && !data && (
        <div className="mt-3 flex items-center gap-2 text-sm"><Spinner /> Consultando...</div>
      )}
      {error && <div className="mt-3"><ErrorState message={error.message} onRetry={reload} retrying={loading} /></div>}
      {data && !error && (
        <div className="mt-3">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
              data.grandLineUnlocked ? 'bg-emerald-500 text-sea-950' : 'bg-amber-500 text-sea-950'
            }`}
          >
            {data.grandLineUnlocked ? 'UNLOCKED · Grand Line abierto' : 'LOCKED · Grand Line bloqueado'}
          </span>
          <p className="mt-2 text-sm opacity-90">{data.message}</p>
          {data.unlockedAt && <p className="mt-1 text-xs opacity-70">Desbloqueado: {formatDate(data.unlockedAt)}</p>}
          <button type="button" onClick={reload} className="mt-2 text-xs underline opacity-80">
            Actualizar estado
          </button>
        </div>
      )}
    </section>
  )
}

export default function DashboardPage() {
  const { data, error, loading, reload } = useFetch((signal) => getDashboardSummary(signal), [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Indicadores de la tripulación</h1>

      <LogPoseCard />

      {loading && !data && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-busy="true">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-sea-900" />
          ))}
        </div>
      )}

      {error && <ErrorState message={error.message} onRetry={reload} retrying={loading} />}

      {data && !error && (
        <>
          {data.wanted.total === 0 ? (
            <EmptyState title="Aún no hay carteles en tu workspace" />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard label="Carteles" value={data.wanted.total} />
                <StatCard label="Recompensa total" value={formatBerries(data.wanted.totalBounty)} />
                <StatCard label="Recompensa promedio" value={formatBerries(data.wanted.averageBounty)} />
                <StatCard label="Tripulaciones" value={data.crews.total} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <section className="rounded-xl border border-sand-100/10 bg-sea-900 p-4">
                  <h2 className="mb-2 font-bold">Por estado</h2>
                  <ul className="space-y-1 text-sm">
                    {WANTED_STATUSES.map((s) => (
                      <li key={s} className="flex justify-between"><span>{prettyEnum(s)}</span><strong>{data.wanted.byStatus[s] ?? 0}</strong></li>
                    ))}
                  </ul>
                </section>
                <section className="rounded-xl border border-sand-100/10 bg-sea-900 p-4">
                  <h2 className="mb-2 font-bold">Por fruta del diablo</h2>
                  <ul className="space-y-1 text-sm">
                    {FRUIT_FILTERS.map((f) => (
                      <li key={f} className="flex justify-between"><span>{f === 'NONE' ? 'Sin fruta' : prettyEnum(f)}</span><strong>{data.wanted.byFruit[f] ?? 0}</strong></li>
                    ))}
                  </ul>
                </section>
              </div>

              {data.crews.mostWanted && (
                <section className="rounded-xl border border-sand-100/10 bg-sea-900 p-4">
                  <h2 className="font-bold">Tripulación más buscada</h2>
                  <p className="mt-1 flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ background: data.crews.mostWanted.jollyRogerColor }} />
                    <strong>{data.crews.mostWanted.name}</strong> · {data.crews.mostWanted.shipName} ·{' '}
                    {formatBerries(data.crews.mostWanted.totalBounty)}
                  </p>
                </section>
              )}

              <section className="rounded-xl border border-sand-100/10 bg-sea-900 p-4">
                <h2 className="mb-2 font-bold">Top recompensas</h2>
                {data.topBounties.length === 0 ? (
                  <p className="text-sm opacity-70">Sin datos.</p>
                ) : (
                  <ol className="space-y-1 text-sm">
                    {data.topBounties.map((w, i) => (
                      <li key={w.id} className="flex justify-between gap-2">
                        <Link to={`/wanted/${w.id}`} className="hover:underline">
                          {i + 1}. {w.name} <span className="opacity-70">"{w.epithet}"</span>
                        </Link>
                        <strong>{formatBerries(w.bounty)}</strong>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
              <p className="text-xs opacity-60">Generado: {formatDate(data.generatedAt)}</p>
            </>
          )}
        </>
      )}
    </div>
  )
}
