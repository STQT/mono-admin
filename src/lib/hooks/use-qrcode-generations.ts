"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createQRGeneration,
  listQRGenerations,
  type QRCodeGenerationCreateInput,
  type QRGenerationFilters,
} from "@/lib/api/qrcode-generations"

export const qrGenerationsKey = (filters: QRGenerationFilters) =>
  ["qrcode-generations", filters] as const

export function useQRGenerations(filters: QRGenerationFilters) {
  return useQuery({
    queryKey: qrGenerationsKey(filters),
    queryFn: () => listQRGenerations(filters),
    placeholderData: keepPreviousData,
    // Авто-обновление пока есть «в работе» партии (pending/processing).
    // Когда всё завершено — refetchInterval возвращает false и пуллинг
    // останавливается. Так UI сам подхватывает прогресс из Celery.
    refetchInterval: (q) => {
      const data = q.state.data
      if (!data) return false
      const inflight = data.results.some(
        (g) => g.status === "pending" || g.status === "processing"
      )
      return inflight ? 5000 : false
    },
  })
}

export function useCreateQRGeneration() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: QRCodeGenerationCreateInput) => createQRGeneration(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["qrcode-generations"] })
      toast.success("Yaratish navbatga qo'yildi")
    },
    onError: (e: unknown) => toast.error(extractError(e, "Yaratishda xatolik")),
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
