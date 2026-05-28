import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios"

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setTokens,
} from "./tokens"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8010"

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/admin`,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type RetriableRequest = AxiosRequestConfig & { _retry?: boolean }

let refreshInFlight: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error("no refresh token")

  // Сырой axios — чтобы не зайти в interceptor рекурсивно.
  const response = await axios.post<{ access: string; refresh?: string }>(
    `${API_BASE_URL}/api/admin/auth/token/refresh/`,
    { refresh },
    { headers: { "Content-Type": "application/json" } }
  )

  // SimpleJWT с ROTATE_REFRESH_TOKENS=True возвращает и новый refresh.
  if (response.data.refresh) {
    setTokens({ access: response.data.access, refresh: response.data.refresh })
  } else {
    setAccessToken(response.data.access)
  }
  return response.data.access
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequest | undefined
    const status = error.response?.status

    if (!original || status !== 401 || original._retry) {
      // Не пытаемся рефрешить если это уже был ретрай или не 401.
      if (status === 401 && original?._retry) {
        clearTokens()
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          const next = encodeURIComponent(window.location.pathname + window.location.search)
          window.location.assign(`/login?next=${next}`)
        }
      }
      throw error
    }

    // Не рефрешим сам /auth/token/ и /auth/token/refresh/.
    const url = original.url ?? ""
    if (url.startsWith("/auth/token")) {
      throw error
    }

    original._retry = true

    try {
      refreshInFlight = refreshInFlight ?? refreshAccessToken()
      const newAccess = await refreshInFlight
      refreshInFlight = null

      original.headers = original.headers ?? {}
      ;(original.headers as Record<string, string>).Authorization = `Bearer ${newAccess}`
      return api.request(original)
    } catch (refreshError) {
      refreshInFlight = null
      clearTokens()
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        const next = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.assign(`/login?next=${next}`)
      }
      throw refreshError
    }
  }
)
