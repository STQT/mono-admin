"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createBroadcastMessage,
  deleteBroadcastMessage,
  estimateBroadcastMessage,
  listBroadcastMessages,
  sendBroadcastMessage,
  updateBroadcastMessage,
  type BroadcastFilters,
  type BroadcastMessageInput,
} from "@/lib/api/broadcast-messages"

export const broadcastMessagesKey = (filters: BroadcastFilters) =>
  ["broadcast-messages", filters] as const

export function useBroadcastMessages(filters: BroadcastFilters) {
  return useQuery({
    queryKey: broadcastMessagesKey(filters),
    queryFn: () => listBroadcastMessages(filters),
    placeholderData: keepPreviousData,
  })
}

export function useCreateBroadcastMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: BroadcastMessageInput) => createBroadcastMessage(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["broadcast-messages"] })
      toast.success("Yangi xabar yaratildi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "Saqlashda xatolik"))
    },
  })
}

export function useUpdateBroadcastMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: BroadcastMessageInput }) =>
      updateBroadcastMessage(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["broadcast-messages"] })
      toast.success("Yangilandi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "Yangilashda xatolik"))
    },
  })
}

export function useDeleteBroadcastMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteBroadcastMessage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["broadcast-messages"] })
      toast.success("O'chirildi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "O'chirishda xatolik"))
    },
  })
}

export function useEstimateBroadcast(id: number | null) {
  return useQuery({
    queryKey: ["broadcast-messages", "estimate", id ?? 0],
    queryFn: () => estimateBroadcastMessage(id!),
    enabled: typeof id === "number",
    staleTime: 60_000,
  })
}

export function useSendBroadcastMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => sendBroadcastMessage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["broadcast-messages"] })
      toast.success("Yuborish navbatga qo'yildi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "Yuborishda xatolik"))
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
