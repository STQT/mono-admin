import { api } from "./client"
import { clearTokens, setTokens, type TokenPair } from "./tokens"

export type AdminUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_superuser: boolean
}

export async function login(username: string, password: string): Promise<TokenPair> {
  const { data } = await api.post<TokenPair>("/auth/token/", { username, password })
  setTokens(data)
  return data
}

export function logout() {
  clearTokens()
}

export async function fetchCurrentUser(): Promise<AdminUser> {
  const { data } = await api.get<AdminUser>("/auth/me/")
  return data
}
