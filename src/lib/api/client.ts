import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios"

import { stripBasePath, withBasePath } from "../base-path"

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setTokens,
} from "./tokens"

/**
 * Редирект на login после 401: учитываем basePath (например `/new`),
 * который nginx подставляет в URL. `next` сохраняем как относительный путь
 * без basePath — потом login-форма прокинет его через router.replace, и
 * Next сам приклеит basePath.
 */
function redirectToLogin(): void {
  if (typeof window === "undefined") return
  const loginPath = withBasePath("/login")
  if (window.location.pathname === loginPath) return
  const relative = stripBasePath(window.location.pathname) + window.location.search
  const next = encodeURIComponent(relative)
  window.location.assign(`${loginPath}?next=${next}`)
}

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
        redirectToLogin()
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
      redirectToLogin()
      throw refreshError
    }
  }
)
