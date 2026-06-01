"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createPrivacyPolicy,
  deletePrivacyPolicy,
  listPrivacyPolicies,
  updatePrivacyPolicy,
  type PrivacyPolicyInput,
} from "@/lib/api/privacy-policy"

export const privacyPoliciesKey = ["privacy-policies"] as const

export function usePrivacyPolicies() {
  return useQuery({
    queryKey: privacyPoliciesKey,
    queryFn: listPrivacyPolicies,
  })
}

export function useCreatePrivacyPolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: PrivacyPolicyInput) => createPrivacyPolicy(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: privacyPoliciesKey })
      toast.success("Maxfiylik siyosati qo'shildi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "Saqlashda xatolik"))
    },
  })
}

export function useUpdatePrivacyPolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PrivacyPolicyInput }) =>
      updatePrivacyPolicy(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: privacyPoliciesKey })
      toast.success("Maxfiylik siyosati yangilandi")
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, "Yangilashda xatolik"))
    },
  })
}

export function useDeletePrivacyPolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deletePrivacyPolicy(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: privacyPoliciesKey })
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
