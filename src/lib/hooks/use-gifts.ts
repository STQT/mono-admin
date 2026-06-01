"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createGift,
  deleteGift,
  listGifts,
  updateGift,
  type GiftInput,
} from "@/lib/api/gifts"

export const giftsKey = ["gifts"] as const

export function useGifts() {
  return useQuery({
    queryKey: giftsKey,
    queryFn: listGifts,
  })
}

export function useCreateGift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: GiftInput) => createGift(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: giftsKey })
      toast.success("Sovg'a qo'shildi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "Saqlashda xatolik"))
    },
  })
}

export function useUpdateGift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: GiftInput }) => updateGift(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: giftsKey })
      toast.success("Sovg'a yangilandi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "Yangilashda xatolik"))
    },
  })
}

export function useDeleteGift() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteGift(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: giftsKey })
      toast.success("O'chirildi")
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
  const firstField = Object.values(data)[0]
  if (Array.isArray(firstField) && typeof firstField[0] === "string") return firstField[0]
  return fallback
}
