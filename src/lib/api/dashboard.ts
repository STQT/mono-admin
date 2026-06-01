import { api } from "./client"

export const REDEMPTION_STATUS_CODES = [
  "pending",
  "approved",
  "sent",
  "completed",
  "rejected",
  "cancelled_by_user",
  "not_received",
] as const

export type RedemptionStatusCode = (typeof REDEMPTION_STATUS_CODES)[number]

export type GiftRedemptionGroup = {
  total_count: number
  total_points: number
  by_status: Record<RedemptionStatusCode, { count: number; points: number }>
}

export type DashboardGeneral = {
  // Текущий период
  users_total: number
  users_electrician: number
  users_seller: number
  users_unselected: number

  qr_e_total: number
  qr_e_scanned: number
  qr_e_unscanned: number
  qr_s_total: number
  qr_s_scanned: number
  qr_s_unscanned: number

  points_total: number
  points_electrician: number
  points_seller: number

  pool_e_total: number
  pool_e_scanned: number
  pool_e_spent: number
  pool_e_unscanned: number
  pool_s_total: number
  pool_s_scanned: number
  pool_s_spent: number
  pool_s_unscanned: number

  gifts_total: number
  gifts_electrician: number
  gifts_seller: number
  gift_redemptions_electrician: GiftRedemptionGroup
  gift_redemptions_seller: GiftRedemptionGroup

  // Lifetime
  life_u_total: number
  life_u_e: number
  life_u_s: number
  life_u_unselected: number
  life_qr_e_total: number
  life_qr_e_scanned: number
  life_qr_e_unscanned: number
  life_qr_s_total: number
  life_qr_s_scanned: number
  life_qr_s_unscanned: number
  life_pool_e_scanned: number
  life_pool_s_scanned: number
  life_gifts_total: number
  life_gifts_e: number
  life_gifts_s: number

  trends: {
    users_total: number
    points_total: number
  }
  _filters: {
    date_from: string | null
    date_to: string | null
  }
}

export type DashboardParams = {
  date_from?: string | null // YYYY-MM-DD
  date_to?: string | null
}

export async function getDashboardGeneral(
  params: DashboardParams = {}
): Promise<DashboardGeneral> {
  const search: Record<string, string> = {}
  if (params.date_from) search.date_from = params.date_from
  if (params.date_to) search.date_to = params.date_to
  const { data } = await api.get<DashboardGeneral>("/dashboard/general/", {
    params: search,
  })
  return data
}
