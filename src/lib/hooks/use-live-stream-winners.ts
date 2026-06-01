"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createLiveStreamWinner,
  deleteLiveStreamWinner,
  listLiveStreamWinners,
  updateLiveStreamWinner,
  type LiveStreamWinnerInput,
  type LiveStreamWinnerPatch,
} from "@/lib/api/live-stream-winners"
import { liveStreamsKey } from "@/lib/hooks/use-live-streams"

export const liveStreamWinnersKey = (id: number) => ["live-stream-winners", id] as const

export function useLiveStreamWinners(liveStreamId: number | undefined) {
  return useQuery({
    queryKey: liveStreamWinnersKey(liveStreamId ?? 0),
    queryFn: () => listLiveStreamWinners(liveStreamId!),
    enabled: typeof liveStreamId === "number",
  })
}

function invalidate(qc: ReturnType<typeof useQueryClient>, liveStreamId: number) {
  qc.invalidateQueries({ queryKey: liveStreamWinnersKey(liveStreamId) })
  // Список live-streams тоже содержит nested winners — обновим.
  qc.invalidateQueries({ queryKey: liveStreamsKey })
}

export function useCreateLiveStreamWinner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: LiveStreamWinnerInput) => createLiveStreamWinner(input),
    onSuccess: (_data, variables) => {
      invalidate(qc, variables.live_stream)
      toast.success("G'olib qo'shildi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "Qo'shishda xatolik"))
    },
  })
}

export function useUpdateLiveStreamWinner(liveStreamId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: LiveStreamWinnerPatch }) =>
      updateLiveStreamWinner(id, input),
    onSuccess: () => {
      invalidate(qc, liveStreamId)
      toast.success("G'olib yangilandi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "Yangilashda xatolik"))
    },
  })
}

export function useDeleteLiveStreamWinner(liveStreamId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteLiveStreamWinner(id),
    onSuccess: () => {
      invalidate(qc, liveStreamId)
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
