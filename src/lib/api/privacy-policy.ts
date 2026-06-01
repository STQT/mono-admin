import { api } from "./client"

export type PrivacyPolicy = {
  id: number
  pdf_uz_latin: string | null
  pdf_ru: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Поля файлов: undefined = "не менять", File = "загрузить новый".
 * Очистка пока не реализована в UI; при необходимости — отправлять "" или
 * добавить отдельную ручку.
 */
export type PrivacyPolicyInput = {
  pdf_uz_latin?: File
  pdf_ru?: File
  is_active?: boolean
}

type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

function buildFormData(input: PrivacyPolicyInput): FormData {
  const fd = new FormData()
  if (input.pdf_uz_latin) fd.append("pdf_uz_latin", input.pdf_uz_latin)
  if (input.pdf_ru) fd.append("pdf_ru", input.pdf_ru)
  if (input.is_active !== undefined) fd.append("is_active", input.is_active ? "true" : "false")
  return fd
}

const MULTIPART_HEADERS = { "Content-Type": "multipart/form-data" }

export async function listPrivacyPolicies(): Promise<PrivacyPolicy[]> {
  const { data } = await api.get<Paginated<PrivacyPolicy> | PrivacyPolicy[]>("/privacy-policies/")
  return Array.isArray(data) ? data : data.results
}

export async function createPrivacyPolicy(input: PrivacyPolicyInput): Promise<PrivacyPolicy> {
  const { data } = await api.post<PrivacyPolicy>("/privacy-policies/", buildFormData(input), {
    headers: MULTIPART_HEADERS,
  })
  return data
}

export async function updatePrivacyPolicy(
  id: number,
  input: PrivacyPolicyInput
): Promise<PrivacyPolicy> {
  const { data } = await api.patch<PrivacyPolicy>(
    `/privacy-policies/${id}/`,
    buildFormData(input),
    { headers: MULTIPART_HEADERS }
  )
  return data
}

export async function deletePrivacyPolicy(id: number): Promise<void> {
  await api.delete(`/privacy-policies/${id}/`)
}

/** Имя файла из URL для пред-просмотра в форме редактирования. */
export function filenameFromUrl(url: string | null): string | null {
  if (!url) return null
  try {
    const u = new URL(url, "http://x")
    const last = u.pathname.split("/").filter(Boolean).pop()
    return last ? decodeURIComponent(last) : null
  } catch {
    return null
  }
}
