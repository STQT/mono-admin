import { api } from "./client"

export const QR_CODE_TYPES = ["electrician", "seller"] as const
export type QRCodeType = (typeof QR_CODE_TYPES)[number]

export const QR_CODE_TYPE_LABEL: Record<QRCodeType, string> = {
  electrician: "Elektrik (E)",
  seller: "Sotuvchi (D)",
}

export type QRCodeAdmin = {
  id: number
  code: string
  code_type: QRCodeType
  code_type_display: string
  hash_code: string
  serial_number: string
  image_path: string | null
  points: number
  generated_at: string
  scanned_at: string | null
  is_scanned: boolean
  is_deleted: boolean
  scanned_by_id: number | null
  scanned_by_telegram_id: number | null
  scanned_by_username: string | null
  scanned_by_first_name: string | null
  scanned_by_phone_number: string | null
}

export type QRCodeFilters = {
  page?: number
  code_type?: QRCodeType | ""
  is_scanned?: "true" | "false" | ""
  q?: string
}

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export async function listQRCodes(
  filters: QRCodeFilters = {}
): Promise<Paginated<QRCodeAdmin>> {
  const params: Record<string, string | number> = {}
  if (filters.page) params.page = filters.page
  if (filters.code_type) params.code_type = filters.code_type
  if (filters.is_scanned) params.is_scanned = filters.is_scanned
  if (filters.q && filters.q.trim()) params.q = filters.q.trim()

  const { data } = await api.get<Paginated<QRCodeAdmin> | QRCodeAdmin[]>("/qrcodes/", { params })
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data }
  }
  return data
}

export async function getQRCode(id: number): Promise<QRCodeAdmin> {
  const { data } = await api.get<QRCodeAdmin>(`/qrcodes/${id}/`)
  return data
}
