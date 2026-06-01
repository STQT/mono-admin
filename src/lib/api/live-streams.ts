import { api } from "./client"

export type LiveStreamWinner = {
  id: number
  user_id: number
  user_telegram_id: number
  user_username: string | null
  user_full_name: string
  prize_text_uz_latin: string
  prize_text_ru: string
  position: number
  created_at: string
}

export type LiveStream = {
  id: number
  title_uz_latin: string
  title_ru: string
  description_uz_latin: string
  description_ru: string
  scheduled_at: string
  stream_url: string
  banner: string | null
  participants_count: number | null
  is_active: boolean
  is_past: boolean
  winners: LiveStreamWinner[]
  created_at: string
  updated_at: string
}

/**
 * Поля banner: undefined = не менять, File = заменить.
 * Очистка banner не реализована в UI; для удаления — отдельный шаг.
 */
export type LiveStreamInput = {
  title_uz_latin?: string
  title_ru?: string
  description_uz_latin?: string
  description_ru?: string
  scheduled_at?: string
  stream_url?: string
  participants_count?: number | null
  is_active?: boolean
  banner?: File
}

type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

function buildFormData(input: LiveStreamInput): FormData {
  const fd = new FormData()
  if (input.title_uz_latin !== undefined) fd.append("title_uz_latin", input.title_uz_latin)
  if (input.title_ru !== undefined) fd.append("title_ru", input.title_ru)
  if (input.description_uz_latin !== undefined)
    fd.append("description_uz_latin", input.description_uz_latin)
  if (input.description_ru !== undefined) fd.append("description_ru", input.description_ru)
  if (input.scheduled_at !== undefined) fd.append("scheduled_at", input.scheduled_at)
  if (input.stream_url !== undefined) fd.append("stream_url", input.stream_url)
  if (input.participants_count !== undefined) {
    fd.append(
      "participants_count",
      input.participants_count === null ? "" : String(input.participants_count)
    )
  }
  if (input.is_active !== undefined) fd.append("is_active", input.is_active ? "true" : "false")
  if (input.banner) fd.append("banner", input.banner)
  return fd
}

const MULTIPART_HEADERS = { "Content-Type": "multipart/form-data" }

export async function listLiveStreams(): Promise<LiveStream[]> {
  const { data } = await api.get<Paginated<LiveStream> | LiveStream[]>("/live-streams/")
  return Array.isArray(data) ? data : data.results
}

export async function createLiveStream(input: LiveStreamInput): Promise<LiveStream> {
  const { data } = await api.post<LiveStream>("/live-streams/", buildFormData(input), {
    headers: MULTIPART_HEADERS,
  })
  return data
}

export async function updateLiveStream(
  id: number,
  input: LiveStreamInput
): Promise<LiveStream> {
  const { data } = await api.patch<LiveStream>(`/live-streams/${id}/`, buildFormData(input), {
    headers: MULTIPART_HEADERS,
  })
  return data
}

export async function deleteLiveStream(id: number): Promise<void> {
  await api.delete(`/live-streams/${id}/`)
}
