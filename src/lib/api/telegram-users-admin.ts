import { api } from "./client"

export const USER_TYPES = ["electrician", "seller"] as const
export type UserType = (typeof USER_TYPES)[number]

export const LANGUAGES = ["uz_latin", "ru"] as const
export type UserLanguage = (typeof LANGUAGES)[number]

export const USER_TYPE_LABEL: Record<UserType, string> = {
  electrician: "Elektrik",
  seller: "Sotuvchi",
}

export const LANGUAGE_LABEL: Record<UserLanguage, string> = {
  uz_latin: "O'zbek (Lotin)",
  ru: "Русский",
}

export type TelegramUserListItem = {
  id: number
  telegram_id: number
  username: string | null
  first_name: string | null
  last_name: string | null
  full_name: string
  phone_number: string | null
  user_type: UserType | null
  points: number
  is_active: boolean
  language: UserLanguage
  privacy_accepted: boolean
  smartup_id: number | null
  region_code: string | null
  region_name: string | null
  district_name: string | null
  created_at: string
  blocked_bot_at: string | null
}

export type TelegramUserDetail = {
  id: number
  telegram_id: number
  username: string | null
  first_name: string | null
  last_name: string | null
  full_name: string
  phone_number: string | null
  user_type: UserType | null
  points: number
  calculated_points: number
  is_active: boolean
  language: UserLanguage
  privacy_accepted: boolean
  smartup_id: number | null
  region: number | null
  district: number | null
  region_code: string | null
  region_name_uz: string | null
  region_name_ru: string | null
  district_name_uz: string | null
  district_name_ru: string | null
  latitude: number | null
  longitude: number | null
  last_message_sent_at: string | null
  blocked_bot_at: string | null
  promo_failed_attempts: number
  promo_block_stage: number
  promo_blocked_until: string | null
  redemptions_count: number
  scanned_qrcodes_count: number
  total_earned_points: number
  scan_attempt_count: number
  scan_attempt_success_count: number
  scan_attempt_unsuccess_count: number
  created_at: string
  updated_at: string
}

export type TelegramUserPatch = {
  username?: string | null
  first_name?: string | null
  last_name?: string | null
  phone_number?: string | null
  user_type?: UserType | null
  points?: number
  is_active?: boolean
  language?: UserLanguage
  smartup_id?: number | null
  region?: number | null
  district?: number | null
  latitude?: number | null
  longitude?: number | null
}

export type TelegramUserFilters = {
  page?: number
  user_type?: UserType | ""
  is_active?: "true" | "false" | ""
  language?: UserLanguage | ""
  region?: string
  q?: string
}

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export async function listTelegramUsersAdmin(
  filters: TelegramUserFilters = {}
): Promise<Paginated<TelegramUserListItem>> {
  const params: Record<string, string | number> = {}
  if (filters.page) params.page = filters.page
  if (filters.user_type) params.user_type = filters.user_type
  if (filters.is_active) params.is_active = filters.is_active
  if (filters.language) params.language = filters.language
  if (filters.region) params.region = filters.region
  if (filters.q && filters.q.trim()) params.q = filters.q.trim()

  const { data } = await api.get<Paginated<TelegramUserListItem> | TelegramUserListItem[]>(
    "/telegram-users/",
    { params }
  )
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data }
  }
  return data
}

export async function getTelegramUserAdmin(id: number): Promise<TelegramUserDetail> {
  const { data } = await api.get<TelegramUserDetail>(`/telegram-users/${id}/`)
  return data
}

export async function patchTelegramUserAdmin(
  id: number,
  patch: TelegramUserPatch
): Promise<TelegramUserDetail> {
  const { data } = await api.patch<TelegramUserDetail>(`/telegram-users/${id}/`, patch)
  return data
}
