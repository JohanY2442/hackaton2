import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { getWantedById } from '../api/wanted.service'
import ErrorState from '../components/ui/ErrorState'
import Spinner from '../components/ui/Spinner'
import { formatBerries, formatDate, prettyEnum } from '../utils/format'

export default function WantedDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const { data, error, loading, reload } = useFetch((signal) => getWantedById(id, signal), [id])

  // Volver al listado exactamente como estaba (misma URL con filtros y página)
  const goBack = () => {
    if (from) navigate(-1)
    else navigate('/wanted')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button type="button" onClick={goBack} className="text-sm font-semibold underline">
        ← Volver a los carteles
      </button>

      {loading && !data && <div className="flex items-center gap-2"><Spinner /> Cargando cartel...</div>}
      {error && (
        <ErrorState message={error.status === 404 ? 'Este cartel no existe.' : error.message} onRetry={error.status === 404 ? undefined : reload} retrying={loading} />
      )}

      {data && !error && (
        <article className="wanted-poster rounded-xl p-6 shadow-xl">
          <p className="text-center font-serif text-4xl font-black tracking-[0.3em]">WANTED</p>
          <p className="text-center text-xs uppercase tracking-widest">Dead or alive</p>
          <h1 className="mt-4 text-center text-3xl font-black uppercase">{data.name}</h1>
          <p className="text-center italic">"{data.epithet}"</p>
          <p className="mt-2 text-center font-mono text-3xl font-black">{formatBerries(data.bounty)}</p>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div><dt className="font-bold">Estado</dt><dd>{prettyEnum(data.status)}</dd></div>
            <div><dt className="font-bold">Tripulación</dt><dd>{data.crew.name}</dd></div>
            <div><dt className="font-bold">Rol</dt><dd>{prettyEnum(data.role)}</dd></div>
            <div><dt className="font-bold">Fruta</dt><dd>{data.devilFruit ? `${data.devilFruit.name} (${prettyEnum(data.devilFruit.type)})` : 'Ninguna'}</dd></div>
            <div><dt className="font-bold">Edad</dt><dd>{data.age} años</dd></div>
            <div><dt className="font-bold">Altura</dt><dd>{data.heightCm} cm</dd></div>
            <div><dt className="font-bold">Amenaza</dt><dd>{data.threatLevel} / 5</dd></div>
            <div className="col-span-2"><dt className="font-bold">Visto por última vez</dt><dd>{data.lastSeen.island} · {formatDate(data.lastSeen.seenAt)}</dd></div>
          </dl>

          <p className="mt-6 leading-relaxed">{data.bio}</p>

          <h2 className="mt-6 font-bold">Historial de recompensas</h2>
          <ol className="mt-2 space-y-1 text-sm">
            {data.bountyHistory.map((b) => (
              <li key={b.issuedAt + b.amount} className="flex justify-between border-b border-[#3b2a14]/20 py-1">
                <span>{formatDate(b.issuedAt)}</span>
                <strong className="font-mono">{formatBerries(b.amount)}</strong>
              </li>
            ))}
          </ol>
        </article>
      )}
    </div>
  )
}
