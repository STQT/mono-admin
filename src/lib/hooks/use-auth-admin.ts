"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createAuthGroup,
  createAuthUser,
  deleteAuthGroup,
  deleteAuthUser,
  listAuthGroups,
  listAuthPermissions,
  listAuthUsers,
  setAuthUserPassword,
  updateAuthGroup,
  updateAuthUser,
  type AuthGroupInput,
  type AuthUserCreateInput,
  type AuthUserFilters,
  type AuthUserUpdateInput,
} from "@/lib/api/auth-admin"

// ───── Permissions: один запрос на всю сессию

export const authPermissionsKey = ["auth-permissions"] as const

export function useAuthPermissions() {
  return useQuery({
    queryKey: authPermissionsKey,
    queryFn: listAuthPermissions,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

// ───── Groups

export const authGroupsKey = ["auth-groups"] as const

export function useAuthGroups() {
  return useQuery({ queryKey: authGroupsKey, queryFn: listAuthGroups })
}

export function useCreateAuthGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AuthGroupInput) => createAuthGroup(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authGroupsKey })
      toast.success("Guruh yaratildi")
    },
    onError: (e: unknown) => toast.error(extractError(e, "Saqlashda xatolik")),
  })
}

export function useUpdateAuthGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AuthGroupInput }) =>
      updateAuthGroup(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authGroupsKey })
      toast.success("Yangilandi")
    },
    onError: (e: unknown) => toast.error(extractError(e, "Yangilashda xatolik")),
  })
}

export function useDeleteAuthGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAuthGroup(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authGroupsKey })
      toast.success("O'chirildi")
    },
    onError: (e: unknown) => toast.error(extractError(e, "O'chirishda xatolik")),
  })
}

// ───── Users

export const authUsersKey = (filters: AuthUserFilters) =>
  ["auth-users", filters] as const

export function useAuthUsers(filters: AuthUserFilters) {
  return useQuery({
    queryKey: authUsersKey(filters),
    queryFn: () => listAuthUsers(filters),
    placeholderData: keepPreviousData,
  })
}

export function useCreateAuthUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AuthUserCreateInput) => createAuthUser(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth-users"] })
      toast.success("Foydalanuvchi yaratildi")
    },
    onError: (e: unknown) => toast.error(extractError(e, "Saqlashda xatolik")),
  })
}

export function useUpdateAuthUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AuthUserUpdateInput }) =>
      updateAuthUser(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth-users"] })
      toast.success("Yangilandi")
    },
    onError: (e: unknown) => toast.error(extractError(e, "Yangilashda xatolik")),
  })
}

export function useDeleteAuthUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAuthUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth-users"] })
      toast.success("O'chirildi")
    },
    onError: (e: unknown) => toast.error(extractError(e, "O'chirishda xatolik")),
  })
}

export function useSetAuthUserPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      setAuthUserPassword(id, password),
    onSuccess: () => {
      toast.success("Parol yangilandi")
    },
    onError: (e: unknown) => toast.error(extractError(e, "Parolni o'zgartirib bo'lmadi")),
  })
}

function extractError(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: Record<string, unknown> }; message?: string }
  const data = err.response?.data
  if (!data) return err.message ?? fallback
  if (typeof data === "string") return data
  if (typeof data.detail === "string") return data.detail
  const firstField = Object.values(data)[0]
  if (Array.isArray(firstField) && typeof firstField[0] === "string") return firstField[0]
  return fallback
}
