import { api } from "./client"

export const REDEMPTION_STATUSES = [
  "pending",
  "approved",
  "sent",
  "completed",
  "rejected",
  "not_received",
  "cancelled_by_user",
] as const

export type RedemptionStatus = (typeof REDEMPTION_STATUSES)[number]

export const REDEMPTION_STATUS_LABEL: Record<RedemptionStatus, string> = {
  pending: "So'rov qabul qilindi",
  approved: "Tayyorlash bosqichida",
  sent: "Yetkazib berishga topshirildi",
  completed: "Yetkazildi",
  rejected: "Bekor qilindi (admin)",
  not_received: "Olmadi (foydalanuvchi olmagan)",
  cancelled_by_user: "Foydalanuvchi bekor qildi",
}

export type UserRegion = {
  code: string
  name_uz: string
  name_ru: string
} | null

export type GiftRedemption = {
  id: number
  user_id: number
  user_telegram_id: number
  user_username: string | null
  user_first_name: string | null
  user_last_name: string | null
  user_phone_number: string | null
  user_type: string | null
  user_region: UserRegion
  gift_id: number
  gift_name_uz_latin: string
  gift_name_ru: string | null
  gift_image: string | null
  gift_points_cost: number
  status: RedemptionStatus
  status_display: string
  admin_notes: string
  user_confirmed: boolean
  user_comment: string
  confirmation_photo: string | null
  requested_at: string
  confirmed_at: string | null
}

export type GiftRedemptionPatch = {
  status?: RedemptionStatus
  admin_notes?: string
}

export type RedemptionFilters = {
  page?: number
  status?: RedemptionStatus | ""
  gift?: number
  user_type?: "electrician" | "seller" | ""
  region?: string
  q?: string
}

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export async function listGiftRedemptions(
  filters: RedemptionFilters = {}
): Promise<Paginated<GiftRedemption>> {
  const params: Record<string, string | number> = {}
  if (filters.page) params.page = filters.page
  if (filters.status) params.status = filters.status
  if (filters.gift) params.gift = filters.gift
  if (filters.user_type) params.user_type = filters.user_type
  if (filters.region) params.region = filters.region
  if (filters.q && filters.q.trim()) params.q = filters.q.trim()

  const { data } = await api.get<Paginated<GiftRedemption> | GiftRedemption[]>(
    "/gift-redemptions/",
    { params }
  )
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data }
  }
  return data
}

export async function updateGiftRedemption(
  id: number,
  patch: GiftRedemptionPatch
): Promise<GiftRedemption> {
  const { data } = await api.patch<GiftRedemption>(`/gift-redemptions/${id}/`, patch)
  return data
}
