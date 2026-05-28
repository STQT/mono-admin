/**
 * Хранилище JWT-токенов. localStorage: простой, переживает рестарт вкладки.
 * Доступ через JS, поэтому строго HTTPS в проде. Альтернатива (cookies +
 * middleware-guard) — следующая итерация, когда подключим SSR-страницы.
 */

const ACCESS_KEY = "mona-admin.access"
const REFRESH_KEY = "mona-admin.refresh"

export type TokenPair = {
  access: string
  refresh: string
}

const isBrowser = () => typeof window !== "undefined"

export function getAccessToken(): string | null {
  if (!isBrowser()) return null
  return window.localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null
  return window.localStorage.getItem(REFRESH_KEY)
}

export function setTokens(pair: TokenPair) {
  if (!isBrowser()) return
  window.localStorage.setItem(ACCESS_KEY, pair.access)
  window.localStorage.setItem(REFRESH_KEY, pair.refresh)
}

export function setAccessToken(access: string) {
  if (!isBrowser()) return
  window.localStorage.setItem(ACCESS_KEY, access)
}

export function clearTokens() {
  if (!isBrowser()) return
  window.localStorage.removeItem(ACCESS_KEY)
  window.localStorage.removeItem(REFRESH_KEY)
}

export function hasTokens(): boolean {
  return Boolean(getAccessToken() && getRefreshToken())
}
