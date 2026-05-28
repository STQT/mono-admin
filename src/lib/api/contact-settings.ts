import { api } from "./client"

export type ContactType = "telegram" | "phone" | "link"

export type ContactSetting = {
  id: number
  contact_type: ContactType
  contact_type_display: string
  contact_value: string
  contact_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ContactSettingInput = {
  contact_type: ContactType
  contact_value: string
  is_active: boolean
}

type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export async function listContactSettings(): Promise<ContactSetting[]> {
  const { data } = await api.get<Paginated<ContactSetting> | ContactSetting[]>("/contact-settings/")
  // DRF pagination активна в проекте (PageNumberPagination, PAGE_SIZE=20) —
  // ответ всегда обёрнут в {results: [...]}. Поддержим оба варианта на всякий случай.
  return Array.isArray(data) ? data : data.results
}

export async function createContactSetting(input: ContactSettingInput): Promise<ContactSetting> {
  const { data } = await api.post<ContactSetting>("/contact-settings/", input)
  return data
}

export async function updateContactSetting(
  id: number,
  input: Partial<ContactSettingInput>
): Promise<ContactSetting> {
  const { data } = await api.patch<ContactSetting>(`/contact-settings/${id}/`, input)
  return data
}

export async function deleteContactSetting(id: number): Promise<void> {
  await api.delete(`/contact-settings/${id}/`)
}
