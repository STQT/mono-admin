import { api } from "./client"

export type Promotion = {
  id: number
  title: string | null
  image: string | null
  date: string | null
  is_active: boolean
  order: number
  created_at: string
  updated_at: string
}

export type PromotionInput = {
  title?: string | null
  date?: string | null // YYYY-MM-DD
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

function buildFormData(input: PromotionInput): FormData {
  const fd = new FormData()
  if (input.title !== undefined) fd.append("title", input.title ?? "")
  if (input.date !== undefined) fd.append("date", input.date ?? "")
  if (input.is_active !== undefined) fd.append("is_active", input.is_active ? "true" : "false")
  if (input.order !== undefined) fd.append("order", String(input.order))
  if (input.image) fd.append("image", input.image)
  return fd
}

const MULTIPART_HEADERS = { "Content-Type": "multipart/form-data" }

export async function listPromotions(): Promise<Promotion[]> {
  const { data } = await api.get<Paginated<Promotion> | Promotion[]>("/promotions/")
  return Array.isArray(data) ? data : data.results
}

export async function createPromotion(input: PromotionInput): Promise<Promotion> {
  const { data } = await api.post<Promotion>("/promotions/", buildFormData(input), {
    headers: MULTIPART_HEADERS,
  })
  return data
}

export async function updatePromotion(id: number, input: PromotionInput): Promise<Promotion> {
  const { data } = await api.patch<Promotion>(`/promotions/${id}/`, buildFormData(input), {
    headers: MULTIPART_HEADERS,
  })
  return data
}

export async function deletePromotion(id: number): Promise<void> {
  await api.delete(`/promotions/${id}/`)
}
