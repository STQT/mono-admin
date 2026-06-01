import { api } from "./client"
import { clearTokens, setTokens, type TokenPair } from "./tokens"

export const ADMIN_PERMISSIONS = [
  "core.send_region_messages",
  "core.generate_qrcodes",
  "core.view_qrcode_detail",
  "core.change_status_call_center",
  "core.change_status_agent",
  "core.change_user_type_call_center",
] as const

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number]

export type AdminUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_superuser: boolean
  permissions: AdminPermission[]
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
