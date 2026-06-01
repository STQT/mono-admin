"use client"

import { useQuery } from "@tanstack/react-query"

import { listUzRegions } from "@/lib/api/uz-regions"

export const uzRegionsKey = ["uz-regions"] as const

/**
 * Регионы Узбекистана с вложенными туманами. Один запрос, кеш живёт всю сессию
 * — данные практически статичны.
 */
export function useUzRegions() {
  return useQuery({
    queryKey: uzRegionsKey,
    queryFn: listUzRegions,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
