"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  fetchCurrentUser,
  login as apiLogin,
  logout as apiLogout,
  type AdminPermission,
} from "@/lib/api/auth"
import { hasTokens } from "@/lib/api/tokens"

export const currentUserKey = ["auth", "me"] as const

export function useCurrentUser(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: fetchCurrentUser,
    enabled: options?.enabled ?? hasTokens(),
    staleTime: 5 * 60_000,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      apiLogin(username, password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: currentUserKey })
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return () => {
    apiLogout()
    qc.clear()
  }
}

/**
 * Хук-помощник для условного рендера/disabled. Возвращает функцию `has`,
 * которая проверяет наличие любой из перечисленных пермишенов (codename'ы
 * совпадают с Django). Суперюзеры всегда получают true — бэкенд кладёт им
 * все codename'ы в /auth/me/.
 *
 * `loaded` отличает «ещё не загрузилось» от «загрузилось и нет права» —
 * для skeleton/loading UI.
 */
export function usePermissions() {
  const { data, isLoading } = useCurrentUser()
  const perms = data?.permissions ?? []
  return {
    loaded: !isLoading && Boolean(data),
    isSuperUser: data?.is_superuser ?? false,
    has: (...required: AdminPermission[]) =>
      required.some((p) => perms.includes(p)),
  }
}
