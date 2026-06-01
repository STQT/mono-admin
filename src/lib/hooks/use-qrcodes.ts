"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { listQRCodes, type QRCodeFilters } from "@/lib/api/qrcodes"

export const qrcodesKey = (filters: QRCodeFilters) => ["qrcodes", filters] as const

export function useQRCodes(filters: QRCodeFilters) {
  return useQuery({
    queryKey: qrcodesKey(filters),
    queryFn: () => listQRCodes(filters),
    placeholderData: keepPreviousData,
  })
}
