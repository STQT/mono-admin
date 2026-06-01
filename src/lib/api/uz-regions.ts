import { api } from "./client"

export type UzDistrict = {
  id: number
  code: string
  name_uz: string
  name_ru: string
}

export type UzRegion = {
  id: number
  code: string
  name_uz: string
  name_ru: string
  districts: UzDistrict[]
}

export async function listUzRegions(): Promise<UzRegion[]> {
  const { data } = await api.get<UzRegion[]>("/uz-regions/")
  return data
}
