import apiClient from './api'
import type { DashboardSummary, LogPose } from '../types/api'

export async function getDashboardSummary(signal?: AbortSignal): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>('/dashboard/summary', { signal })
  return data
}

export async function getLogPose(signal?: AbortSignal): Promise<LogPose> {
  const { data } = await apiClient.get<LogPose>('/log-pose', { signal })
  return data
}
