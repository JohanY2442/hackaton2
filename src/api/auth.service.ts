import apiClient from './api'
import type { LoginRequest, LoginResponse, MeResponse, RegisterRequest } from '../types/api'

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', body)
  return data
}

export async function register(body: RegisterRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/register', body)
  return data
}

export async function getMe(signal?: AbortSignal): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>('/auth/me', { signal })
  return data
}
