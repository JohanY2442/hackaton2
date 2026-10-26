import {
  NEWS_PRIORITIES,
  NEWS_STATUSES,
  NEWS_TYPES,
  type NewsPriority,
  type NewsStatus,
  type NewsType,
} from '../types/api'

export interface NewsFilters {
  type: NewsType | ''
  priority: NewsPriority | ''
  status: NewsStatus | ''
}

function oneOf<T extends string>(list: readonly T[], value: string | null): T | '' {
  return value !== null && (list as readonly string[]).includes(value) ? (value as T) : ''
}

export function parseNewsParams(params: URLSearchParams): NewsFilters {
  return {
    type: oneOf(NEWS_TYPES, params.get('type')),
    priority: oneOf(NEWS_PRIORITIES, params.get('priority')),
    status: oneOf(NEWS_STATUSES, params.get('status')),
  }
}

export function toNewsParams(filters: NewsFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.status) params.set('status', filters.status)
  return params
}

// Clave estable de los filtros: identifica a qué "feed" pertenece cada respuesta
export function newsFiltersKey(filters: NewsFilters): string {
  return toNewsParams(filters).toString()
}

// ¿La noticia sigue cumpliendo los filtros activos?
export function matchesNewsFilters(item: { type: NewsType; priority: NewsPriority; status: NewsStatus }, f: NewsFilters): boolean {
  return (!f.type || item.type === f.type) && (!f.priority || item.priority === f.priority) && (!f.status || item.status === f.status)
}
