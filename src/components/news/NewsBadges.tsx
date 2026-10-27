import type { NewsItem } from '../../types/api'
import { prettyEnum } from '../../utils/format'

const priorityColor: Record<NewsItem['priority'], string> = {
  LOW: 'bg-slate-600',
  MEDIUM: 'bg-sky-700',
  HIGH: 'bg-orange-600',
  CRITICAL: 'bg-red-700',
}

const statusColor: Record<NewsItem['status'], string> = {
  RUMOR: 'bg-amber-500 text-sea-950',
  CONFIRMED: 'bg-emerald-500 text-sea-950',
  DEBUNKED: 'bg-zinc-500 text-white',
}

export function StatusBadge({ status }: { status: NewsItem['status'] }) {
  return <span className={`rounded px-2 py-0.5 text-xs font-bold ${statusColor[status]}`}>{prettyEnum(status)}</span>
}

export function PriorityBadge({ priority }: { priority: NewsItem['priority'] }) {
  return <span className={`rounded px-2 py-0.5 text-xs font-bold text-white ${priorityColor[priority]}`}>{prettyEnum(priority)}</span>
}
