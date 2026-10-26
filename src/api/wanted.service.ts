import apiClient from './api'
import type { Crew, WantedDetail, WantedPage } from '../types/api'
import type { WantedQuery } from '../utils/wantedParams'

export async function getWanted(query: WantedQuery, signal?: AbortSignal): Promise<WantedPage> {
  // Solo se envían los filtros que tienen valor; el backend hace búsqueda/filtros/orden
  const params: Record<string, string | number> = {
    page: query.page,
    size: query.size,
    sort: query.sort,
  }
  if (query.status) params.status = query.status
  if (query.crewId) params.crewId = query.crewId
  if (query.fruit) params.fruit = query.fruit
  if (query.q) params.q = query.q

  const { data } = await apiClient.get<WantedPage>('/wanted', { params, signal })
  return data
}

export async function getWantedById(id: string, signal?: AbortSignal): Promise<WantedDetail> {
  const { data } = await apiClient.get<WantedDetail>(`/wanted/${encodeURIComponent(id)}`, { signal })
  return data
}

export async function getCrews(signal?: AbortSignal): Promise<Crew[]> {
  const { data } = await apiClient.get<Crew[]>('/crews', { signal })
  return data
}
