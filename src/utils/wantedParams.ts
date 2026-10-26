import {
  FRUIT_FILTERS,
  PAGE_SIZES,
  WANTED_SORTS,
  WANTED_STATUSES,
  type FruitFilter,
  type PageSize,
  type WantedSort,
  type WantedStatus,
} from '../types/api'

// Estado completo del listado; la URL es la fuente de verdad
export interface WantedQuery {
  page: number
  size: PageSize
  sort: WantedSort
  status: WantedStatus | ''
  crewId: string
  fruit: FruitFilter | ''
  q: string
}

export const DEFAULT_WANTED_QUERY: WantedQuery = {
  page: 0,
  size: 20,
  sort: 'bounty,desc',
  status: '',
  crewId: '',
  fruit: '',
  q: '',
}

function oneOf<T extends string>(list: readonly T[], value: string | null): T | '' {
  return value !== null && (list as readonly string[]).includes(value) ? (value as T) : ''
}

// URL -> estado. Cualquier valor inválido cae al default (la vista nunca se rompe)
export function parseWantedParams(params: URLSearchParams): WantedQuery {
  const rawPage = Number(params.get('page'))
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0

  const rawSize = Number(params.get('size'))
  const size = (PAGE_SIZES as readonly number[]).includes(rawSize)
    ? (rawSize as PageSize)
    : DEFAULT_WANTED_QUERY.size

  const sort = oneOf(WANTED_SORTS, params.get('sort')) || DEFAULT_WANTED_QUERY.sort
  const q = (params.get('q') ?? '').slice(0, 100)
  const crewId = (params.get('crewId') ?? '').slice(0, 200)

  return {
    page,
    size,
    sort,
    status: oneOf(WANTED_STATUSES, params.get('status')),
    crewId,
    fruit: oneOf(FRUIT_FILTERS, params.get('fruit')),
    q,
  }
}

// Estado -> URL. Solo se escriben los valores distintos al default (URL limpia)
export function toWantedParams(query: WantedQuery): URLSearchParams {
  const params = new URLSearchParams()
  if (query.page !== 0) params.set('page', String(query.page))
  if (query.size !== DEFAULT_WANTED_QUERY.size) params.set('size', String(query.size))
  if (query.sort !== DEFAULT_WANTED_QUERY.sort) params.set('sort', query.sort)
  if (query.status) params.set('status', query.status)
  if (query.crewId) params.set('crewId', query.crewId)
  if (query.fruit) params.set('fruit', query.fruit)
  if (query.q) params.set('q', query.q)
  return params
}
