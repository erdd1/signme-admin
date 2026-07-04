import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import type { ApiEnvelope } from '@/core/api/types'
import { env } from '@/core/config/env'
import { useAuthStore } from '@/features/auth/store/authStore'

export const httpClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
})

httpClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface RefreshResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState()
  if (!refreshToken) return null

  try {
    const { data } = await axios.post<ApiEnvelope<RefreshResponse>>(
      `${env.VITE_API_BASE_URL}/v1/auth/refresh`,
      { refresh_token: refreshToken },
    )
    useAuthStore.getState().setTokens(data.data.access_token, data.data.refresh_token)
    return data.data.access_token
  } catch {
    return null
  }
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      refreshPromise ??= refreshAccessToken()
      const newAccessToken = await refreshPromise
      refreshPromise = null

      if (newAccessToken) {
        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`)
        return httpClient(originalRequest)
      }

      useAuthStore.getState().clear()
    }

    return Promise.reject(error)
  },
)
