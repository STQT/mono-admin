"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createContactSetting,
  deleteContactSetting,
  listContactSettings,
  updateContactSetting,
  type ContactSettingInput,
} from "@/lib/api/contact-settings"

export const contactSettingsKey = ["contact-settings"] as const

export function useContactSettings() {
  return useQuery({
    queryKey: contactSettingsKey,
    queryFn: listContactSettings,
  })
}

export function useCreateContactSetting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ContactSettingInput) => createContactSetting(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contactSettingsKey })
      toast.success("Kontakt qo'shildi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "Saqlashda xatolik"))
    },
  })
}

export function useUpdateContactSetting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<ContactSettingInput> }) =>
      updateContactSetting(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contactSettingsKey })
      toast.success("Kontakt yangilandi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "Yangilashda xatolik"))
    },
  })
}

export function useDeleteContactSetting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteContactSetting(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contactSettingsKey })
      toast.success("Kontakt o'chirildi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "O'chirishda xatolik"))
    },
  })
}

function extractError(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: Record<string, unknown> }; message?: string }
  const data = err.response?.data
  if (!data) return err.message ?? fallback
  if (typeof data === "string") return data
  if (typeof data.detail === "string") return data.detail
  // DRF полевые ошибки: {field: ["msg"]}
  const firstField = Object.values(data)[0]
  if (Array.isArray(firstField) && typeof firstField[0] === "string") return firstField[0]
  return fallback
}
