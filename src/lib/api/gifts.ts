import { api } from "./client"

export const GIFT_USER_TYPES = ["electrician", "seller"] as const
export type GiftUserType = (typeof GIFT_USER_TYPES)[number]

export type Gift = {
  id: number
  name_uz_latin: string
  name_ru: string
  description_uz_latin: string
  description_ru: string
  image: string | null
  points_cost: number
  user_type: GiftUserType | null
  user_type_display: string | null
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
}

export type GiftInput = {
  name_uz_latin?: string
  name_ru?: string
  description_uz_latin?: string
  description_ru?: string
  points_cost?: number
  user_type?: GiftUserType | "" // "" — для всех (null в БД)
  is_active?: boolean
  order?: number
  image?: File
}

type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

function buildFormData(input: GiftInput): FormData {
  const fd = new FormData()
  const appendStr = (key: string, v: string | undefined) =>
    v !== undefined && fd.append(key, v)
  appendStr("name_uz_latin", input.name_uz_latin)
  appendStr("name_ru", input.name_ru)
  appendStr("description_uz_latin", input.description_uz_latin)
  appendStr("description_ru", input.description_ru)
  if (input.points_cost !== undefined) fd.append("points_cost", String(input.points_cost))
  if (input.user_type !== undefined) fd.append("user_type", input.user_type)
  if (input.is_active !== undefined) fd.append("is_active", input.is_active ? "true" : "false")
  if (input.order !== undefined) fd.append("order", String(input.order))
  if (input.image) fd.append("image", input.image)
  return fd
}

const MULTIPART_HEADERS = { "Content-Type": "multipart/form-data" }

export async function listGifts(): Promise<Gift[]> {
  const { data } = await api.get<Paginated<Gift> | Gift[]>("/gifts/")
  return Array.isArray(data) ? data : data.results
}

export async function createGift(input: GiftInput): Promise<Gift> {
  const { data } = await api.post<Gift>("/gifts/", buildFormData(input), {
    headers: MULTIPART_HEADERS,
  })
  return data
}

export async function updateGift(id: number, input: GiftInput): Promise<Gift> {
  const { data } = await api.patch<Gift>(`/gifts/${id}/`, buildFormData(input), {
    headers: MULTIPART_HEADERS,
  })
  return data
}

export async function deleteGift(id: number): Promise<void> {
  await api.delete(`/gifts/${id}/`)
}

export const USER_TYPE_LABEL: Record<GiftUserType | "all", string> = {
  electrician: "Elektrik",
  seller: "Sotuvchi",
  all: "Barcha",
}
