"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createLiveStream,
  deleteLiveStream,
  listLiveStreams,
  updateLiveStream,
  type LiveStreamInput,
} from "@/lib/api/live-streams"

export const liveStreamsKey = ["live-streams"] as const

export function useLiveStreams() {
  return useQuery({
    queryKey: liveStreamsKey,
    queryFn: listLiveStreams,
  })
}

export function useCreateLiveStream() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: LiveStreamInput) => createLiveStream(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: liveStreamsKey })
      toast.success("Jonli efir qo'shildi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "Saqlashda xatolik"))
    },
  })
}

export function useUpdateLiveStream() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: LiveStreamInput }) =>
      updateLiveStream(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: liveStreamsKey })
      toast.success("Jonli efir yangilandi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "Yangilashda xatolik"))
    },
  })
}

export function useDeleteLiveStream() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteLiveStream(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: liveStreamsKey })
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
