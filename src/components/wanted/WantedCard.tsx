import { Link, useLocation } from 'react-router-dom'
import type { WantedSummary } from '../../types/api'
import { formatBerries, prettyEnum } from '../../utils/format'

const statusColor: Record<WantedSummary['status'], string> = {
  AT_LARGE: 'bg-red-700',
  CAPTURED: 'bg-emerald-700',
  MISSING: 'bg-slate-600',
}

export default function WantedCard({ wanted }: { wanted: WantedSummary }) {
  const location = useLocation()
  return (
    <Link
      to={`/wanted/${wanted.id}`}
      // Guardamos la URL del listado para volver exactamente igual
      state={{ from: location.pathname + location.search }}
      className="wanted-poster block rounded-lg p-4 shadow-lg ring-gold-400 transition hover:-translate-y-1 hover:ring-2 focus:outline-none focus:ring-2"
    >
      <p className="text-center font-serif text-2xl font-black tracking-widest">WANTED</p>
      <div className="mx-auto my-3 grid h-24 w-24 place-items-center rounded border-4 border-[#3b2a14]/60 bg-[#3b2a14]/10 text-4xl font-black">
        {wanted.name.charAt(0)}
      </div>
      <p className="text-center text-lg font-black uppercase leading-tight">{wanted.name}</p>
      <p className="text-center text-sm italic">"{wanted.epithet}"</p>
      <p className="mt-2 text-center font-mono text-lg font-bold">{formatBerries(wanted.bounty)}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-1 text-xs">
        <span className={`rounded px-2 py-0.5 font-semibold text-white ${statusColor[wanted.status]}`}>{prettyEnum(wanted.status)}</span>
        <span className="rounded bg-[#3b2a14]/15 px-2 py-0.5">{wanted.crew.name}</span>
        <span className="rounded bg-[#3b2a14]/15 px-2 py-0.5">
          {wanted.devilFruit ? `${wanted.devilFruit.name} (${prettyEnum(wanted.devilFruit.type)})` : 'Sin fruta'}
        </span>
      </div>
      <p className="mt-2 text-center text-xs" aria-label={`Amenaza ${wanted.threatLevel} de 5`}>
        {'☠'.repeat(wanted.threatLevel)}
        <span className="opacity-30">{'☠'.repeat(Math.max(0, 5 - wanted.threatLevel))}</span>
      </p>
    </Link>
  )
}
