"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchCurrentUser, login as apiLogin, logout as apiLogout } from "@/lib/api/auth"
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
