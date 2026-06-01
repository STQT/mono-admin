import { api } from "./client"

export type AuthPermission = {
  id: number
  codename: string
  full_codename: string // "app_label.codename"
  name: string
  app_label: string
  model: string
}

export type AuthGroup = {
  id: number
  name: string
  permissions: number[] // Permission IDs
  users_count: number
}

export type AuthGroupInput = {
  name?: string
  permissions?: number[]
}

export type AuthUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  groups: number[]
  group_names: string[]
  user_permissions: number[]
  last_login: string | null
  date_joined: string
}

export type AuthUserCreateInput = {
  username: string
  password: string
  email?: string
  first_name?: string
  last_name?: string
  is_active?: boolean
  is_staff?: boolean
  is_superuser?: boolean
  groups?: number[]
  user_permissions?: number[]
}

export type AuthUserUpdateInput = Omit<Partial<AuthUserCreateInput>, "password" | "username">

type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ───── Permissions (read-only, кеш бессрочный)

export async function listAuthPermissions(): Promise<AuthPermission[]> {
  const { data } = await api.get<AuthPermission[]>("/auth-permissions/")
  return data
}

// ───── Groups

export async function listAuthGroups(): Promise<AuthGroup[]> {
  const { data } = await api.get<Paginated<AuthGroup> | AuthGroup[]>("/auth-groups/")
  return Array.isArray(data) ? data : data.results
}

export async function createAuthGroup(input: AuthGroupInput): Promise<AuthGroup> {
  const { data } = await api.post<AuthGroup>("/auth-groups/", input)
  return data
}

export async function updateAuthGroup(id: number, input: AuthGroupInput): Promise<AuthGroup> {
  const { data } = await api.patch<AuthGroup>(`/auth-groups/${id}/`, input)
  return data
}

export async function deleteAuthGroup(id: number): Promise<void> {
  await api.delete(`/auth-groups/${id}/`)
}

// ───── Users

export type AuthUserFilters = {
  page?: number
  q?: string
  is_staff?: "true" | "false" | ""
  is_superuser?: "true" | "false" | ""
  is_active?: "true" | "false" | ""
}

export async function listAuthUsers(
  filters: AuthUserFilters = {}
): Promise<Paginated<AuthUser>> {
  const params: Record<string, string | number> = {}
  if (filters.page) params.page = filters.page
  if (filters.q && filters.q.trim()) params.q = filters.q.trim()
  if (filters.is_staff) params.is_staff = filters.is_staff
  if (filters.is_superuser) params.is_superuser = filters.is_superuser
  if (filters.is_active) params.is_active = filters.is_active

  const { data } = await api.get<Paginated<AuthUser> | AuthUser[]>("/auth-users/", {
    params,
  })
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data }
  }
  return data
}

export async function createAuthUser(input: AuthUserCreateInput): Promise<AuthUser> {
  const { data } = await api.post<AuthUser>("/auth-users/", input)
  return data
}

export async function updateAuthUser(
  id: number,
  input: AuthUserUpdateInput
): Promise<AuthUser> {
  const { data } = await api.patch<AuthUser>(`/auth-users/${id}/`, input)
  return data
}

export async function deleteAuthUser(id: number): Promise<void> {
  await api.delete(`/auth-users/${id}/`)
}

export async function setAuthUserPassword(id: number, password: string): Promise<void> {
  await api.post(`/auth-users/${id}/set-password/`, { password })
}
