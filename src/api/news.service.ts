import apiClient from './api'
import type { NewsDetail, NewsFeed } from '../types/api'
import type { NewsFilters } from '../utils/newsParams'

export const NEWS_PAGE_LIMIT = 20

export async function getNewsFeed(
  filters: NewsFilters,
  cursor: string | null,
  signal?: AbortSignal,
): Promise<NewsFeed> {
  const params: Record<string, string | number> = { limit: NEWS_PAGE_LIMIT }
  if (cursor) params.cursor = cursor
  if (filters.type) params.type = filters.type
  if (filters.priority) params.priority = filters.priority
  if (filters.status) params.status = filters.status

  const { data } = await apiClient.get<NewsFeed>('/news/feed', { params, signal })
  return data
}

export async function getNewsById(id: string, signal?: AbortSignal): Promise<NewsDetail> {
  const { data } = await apiClient.get<NewsDetail>(`/news/${encodeURIComponent(id)}`, { signal })
  return data
}

export async function verifyNews(id: string, status: 'CONFIRMED' | 'DEBUNKED'): Promise<NewsDetail> {
  const { data } = await apiClient.patch<NewsDetail>(`/news/${encodeURIComponent(id)}/status`, { status })
  return data
}
