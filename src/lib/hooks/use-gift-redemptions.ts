"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import {
  listGiftRedemptions,
  updateGiftRedemption,
  type GiftRedemptionPatch,
  type RedemptionFilters,
} from "@/lib/api/gift-redemptions"

export const giftRedemptionsKey = (filters: RedemptionFilters) =>
  ["gift-redemptions", filters] as const

export function useGiftRedemptions(filters: RedemptionFilters) {
  return useQuery({
    queryKey: giftRedemptionsKey(filters),
    queryFn: () => listGiftRedemptions(filters),
    placeholderData: keepPreviousData,
  })
}

export function useUpdateGiftRedemption() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: GiftRedemptionPatch }) =>
      updateGiftRedemption(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gift-redemptions"] })
      toast.success("Yangilandi")
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
