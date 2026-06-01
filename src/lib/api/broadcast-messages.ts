import { api } from "./client"

export const BROADCAST_STATUSES = ["pending", "sending", "completed", "failed"] as const
export type BroadcastStatus = (typeof BROADCAST_STATUSES)[number]

export const BROADCAST_STATUS_LABEL: Record<BroadcastStatus, string> = {
  pending: "Tayyor",
  sending: "Yuborilmoqda",
  completed: "Yuborildi",
  failed: "Xato",
}

export const BROADCAST_USER_TYPES = ["", "electrician", "seller"] as const
export type BroadcastUserType = (typeof BROADCAST_USER_TYPES)[number]

export const BROADCAST_USER_TYPE_LABEL: Record<string, string> = {
  "": "Barchaga",
  electrician: "Faqat elektriklarga",
  seller: "Faqat sotuvchilarga",
}

export const BROADCAST_LANGUAGES = ["", "uz_latin", "ru"] as const
export type BroadcastLanguage = (typeof BROADCAST_LANGUAGES)[number]

export const BROADCAST_LANGUAGE_LABEL: Record<string, string> = {
  "": "Hammasi",
  uz_latin: "O'zbek (Lotin)",
  ru: "Русский",
}

/**
 * Региональные коды для рассылки — дублируем константу из
 * core/models.py:BroadcastMessage.REGION_CHOICES. Должно совпадать 1-в-1,
 * иначе сервер отклонит значение.
 */
export const BROADCAST_REGIONS: { code: string; label: string }[] = [
  { code: "", label: "Barcha viloyatlar" },
  { code: "tashkent_city", label: "Toshkent shahri" },
  { code: "tashkent_region", label: "Toshkent viloyati" },
  { code: "andijan", label: "Andijon viloyati" },
  { code: "bukhara", label: "Buxoro viloyati" },
  { code: "jizzakh", label: "Jizzax viloyati" },
  { code: "kashkadarya", label: "Qashqadaryo viloyati" },
  { code: "navoi", label: "Navoiy viloyati" },
  { code: "namangan", label: "Namangan viloyati" },
  { code: "samarkand", label: "Samarqand viloyati" },
  { code: "surkhandarya", label: "Surxondaryo viloyati" },
  { code: "syrdarya", label: "Sirdaryo viloyati" },
  { code: "fergana", label: "Farg'ona viloyati" },
  { code: "khorezm", label: "Xorazm viloyati" },
  { code: "karakalpakstan", label: "Qoraqalpog'iston Respublikasi" },
]

export type BroadcastMessage = {
  id: number
  title: string
  message_text: string
  image: string | null
  user_type_filter: string | null
  user_type_filter_display: string | null
  region_filter: string | null
  region_filter_display: string | null
  language_filter: string | null
  language_filter_display: string | null
  status: BroadcastStatus
  status_display: string
  total_users: number
  sent_count: number
  failed_count: number
  created_at: string
  started_at: string | null
  completed_at: string | null
}

export type BroadcastMessageInput = {
  title?: string
  message_text?: string
  user_type_filter?: string | null
  region_filter?: string | null
  language_filter?: string | null
  image?: File
}

export type BroadcastFilters = {
  page?: number
  status?: BroadcastStatus | ""
  q?: string
}

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

function buildFormData(input: BroadcastMessageInput): FormData {
  const fd = new FormData()
  if (input.title !== undefined) fd.append("title", input.title)
  if (input.message_text !== undefined) fd.append("message_text", input.message_text)
  if (input.user_type_filter !== undefined) {
    fd.append("user_type_filter", input.user_type_filter ?? "")
  }
  if (input.region_filter !== undefined) {
    fd.append("region_filter", input.region_filter ?? "")
  }
  if (input.language_filter !== undefined) {
    fd.append("language_filter", input.language_filter ?? "")
  }
  if (input.image) fd.append("image", input.image)
  return fd
}

const MULTIPART_HEADERS = { "Content-Type": "multipart/form-data" }

export async function listBroadcastMessages(
  filters: BroadcastFilters = {}
): Promise<Paginated<BroadcastMessage>> {
  const params: Record<string, string | number> = {}
  if (filters.page) params.page = filters.page
  if (filters.status) params.status = filters.status
  if (filters.q && filters.q.trim()) params.q = filters.q.trim()
  const { data } = await api.get<Paginated<BroadcastMessage> | BroadcastMessage[]>(
    "/broadcast-messages/",
    { params }
  )
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data }
  }
  return data
}

export async function createBroadcastMessage(
  input: BroadcastMessageInput
): Promise<BroadcastMessage> {
  const { data } = await api.post<BroadcastMessage>("/broadcast-messages/", buildFormData(input), {
    headers: MULTIPART_HEADERS,
  })
  return data
}

export async function updateBroadcastMessage(
  id: number,
  input: BroadcastMessageInput
): Promise<BroadcastMessage> {
  const { data } = await api.patch<BroadcastMessage>(
    `/broadcast-messages/${id}/`,
    buildFormData(input),
    { headers: MULTIPART_HEADERS }
  )
  return data
}

export async function deleteBroadcastMessage(id: number): Promise<void> {
  await api.delete(`/broadcast-messages/${id}/`)
}

export type BroadcastEstimate = {
  estimated_users: number
  region_filter: string | null
  note: string
}

export async function estimateBroadcastMessage(id: number): Promise<BroadcastEstimate> {
  const { data } = await api.get<BroadcastEstimate>(`/broadcast-messages/${id}/estimate/`)
  return data
}

export type BroadcastSendResponse = {
  task_id: string
  broadcast_id: number
  message: string
}

export async function sendBroadcastMessage(id: number): Promise<BroadcastSendResponse> {
  const { data } = await api.post<BroadcastSendResponse>(`/broadcast-messages/${id}/send/`, {})
  return data
}
