"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import {
  getTelegramUserAdmin,
  listTelegramUsersAdmin,
  patchTelegramUserAdmin,
  type TelegramUserFilters,
  type TelegramUserPatch,
} from "@/lib/api/telegram-users-admin"

export const telegramUsersAdminKey = (filters: TelegramUserFilters) =>
  ["telegram-users-admin", filters] as const

export const telegramUserAdminDetailKey = (id: number) =>
  ["telegram-users-admin", "detail", id] as const

export function useTelegramUsersAdmin(filters: TelegramUserFilters) {
  return useQuery({
    queryKey: telegramUsersAdminKey(filters),
    queryFn: () => listTelegramUsersAdmin(filters),
    placeholderData: keepPreviousData,
  })
}

export function useTelegramUserAdminDetail(id: number | null) {
  return useQuery({
    queryKey: telegramUserAdminDetailKey(id ?? 0),
    queryFn: () => getTelegramUserAdmin(id!),
    enabled: typeof id === "number",
  })
}

export function usePatchTelegramUserAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: TelegramUserPatch }) =>
      patchTelegramUserAdmin(id, patch),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["telegram-users-admin"] })
      qc.setQueryData(telegramUserAdminDetailKey(data.id), data)
      toast.success("Foydalanuvchi yangilandi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "Yangilashda xatolik"))
    },
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
