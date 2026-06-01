"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createVideoInstruction,
  deleteVideoInstruction,
  listVideoInstructions,
  updateVideoInstruction,
  type VideoInstructionInput,
} from "@/lib/api/video-instructions"

export const videoInstructionsKey = ["video-instructions"] as const

export function useVideoInstructions() {
  return useQuery({
    queryKey: videoInstructionsKey,
    queryFn: listVideoInstructions,
  })
}

export function useCreateVideoInstruction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: VideoInstructionInput) => createVideoInstruction(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: videoInstructionsKey })
      toast.success("Video ko'rsatma qo'shildi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "Saqlashda xatolik"))
    },
  })
}

export function useUpdateVideoInstruction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: VideoInstructionInput }) =>
      updateVideoInstruction(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: videoInstructionsKey })
      toast.success("Video ko'rsatma yangilandi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "Yangilashda xatolik"))
    },
  })
}

export function useDeleteVideoInstruction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteVideoInstruction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: videoInstructionsKey })
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
