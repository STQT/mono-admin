import { api } from "./client"

export const QR_GENERATION_STATUSES = ["pending", "processing", "completed", "failed"] as const
export type QRGenerationStatus = (typeof QR_GENERATION_STATUSES)[number]

export const QR_GENERATION_STATUS_LABEL: Record<QRGenerationStatus, string> = {
  pending: "Kutilmoqda",
  processing: "Yaratilmoqda",
  completed: "Tayyor",
  failed: "Xato",
}

export type QRCodeGeneration = {
  id: number
  code_type: "electrician" | "seller"
  code_type_display: string
  quantity: number
  points: number
  status: QRGenerationStatus
  status_display: string
  zip_file: string | null
  zip_file_url: string | null
  qr_codes_count: number
  error_message: string
  created_by: number | null
  created_by_username: string | null
  created_at: string
  completed_at: string | null
}

export type QRCodeGenerationCreateInput = {
  code_type: "electrician" | "seller"
  quantity: number
  points?: number | null
}

export type QRCodeGenerationCreateResponse = QRCodeGeneration & { task_id: string }

type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type QRGenerationFilters = {
  page?: number
  status?: QRGenerationStatus | ""
  code_type?: "electrician" | "seller" | ""
}

export async function listQRGenerations(
  filters: QRGenerationFilters = {}
): Promise<Paginated<QRCodeGeneration>> {
  const params: Record<string, string | number> = {}
  if (filters.page) params.page = filters.page
  if (filters.status) params.status = filters.status
  if (filters.code_type) params.code_type = filters.code_type

  const { data } = await api.get<Paginated<QRCodeGeneration> | QRCodeGeneration[]>(
    "/qrcode-generations/",
    { params }
  )
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data }
  }
  return data
}

export async function createQRGeneration(
  input: QRCodeGenerationCreateInput
): Promise<QRCodeGenerationCreateResponse> {
  const { data } = await api.post<QRCodeGenerationCreateResponse>(
    "/qrcode-generations/",
    input
  )
  return data
}

/** Скачать XLSX. Возвращает blob URL — компонент сам делает <a download>. */
export async function downloadGenerationExcel(id: number): Promise<{
  blobUrl: string
  filename: string
}> {
  const response = await api.get(`/qrcode-generations/${id}/export-excel/`, {
    responseType: "blob",
  })
  const cd = response.headers["content-disposition"] as string | undefined
  let filename = `qrcodes_${id}.xlsx`
  if (cd) {
    const match = cd.match(/filename="?([^";]+)"?/)
    if (match) filename = match[1]
  }
  const blobUrl = URL.createObjectURL(response.data as Blob)
  return { blobUrl, filename }
}
