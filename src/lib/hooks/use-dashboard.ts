"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { getDashboardGeneral, type DashboardParams } from "@/lib/api/dashboard"

export const dashboardGeneralKey = (params: DashboardParams) =>
  ["dashboard", "general", params] as const

export function useDashboardGeneral(params: DashboardParams) {
  return useQuery({
    queryKey: dashboardGeneralKey(params),
    queryFn: () => getDashboardGeneral(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}
