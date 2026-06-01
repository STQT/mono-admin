import { api } from "./client"

export const AUDIENCES = ["electrician", "seller"] as const
export const LANGUAGES = ["uz", "ru"] as const
export type Audience = (typeof AUDIENCES)[number]
export type Language = (typeof LANGUAGES)[number]

export type VideoSlot = `${Audience}_${Language}`

export const VIDEO_SLOTS: VideoSlot[] = [
  "electrician_uz",
  "electrician_ru",
  "seller_uz",
  "seller_ru",
]

export type VideoInstruction = {
  id: number
  video_electrician_uz: string | null
  video_electrician_ru: string | null
  video_seller_uz: string | null
  video_seller_ru: string | null
  thumb_electrician_uz: string | null
  thumb_electrician_ru: string | null
  thumb_seller_uz: string | null
  thumb_seller_ru: string | null
  file_id_electrician_uz: string | null
  file_id_electrician_ru: string | null
  file_id_seller_uz: string | null
  file_id_seller_ru: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type VideoInstructionInput = {
  videos: Partial<Record<VideoSlot, File>>
  thumbs: Partial<Record<VideoSlot, File>>
  is_active?: boolean
}

type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

function buildFormData(input: VideoInstructionInput): FormData {
  const fd = new FormData()
  for (const slot of VIDEO_SLOTS) {
    const video = input.videos[slot]
    const thumb = input.thumbs[slot]
    if (video) fd.append(`video_${slot}`, video)
    if (thumb) fd.append(`thumb_${slot}`, thumb)
  }
  if (input.is_active !== undefined) {
    fd.append("is_active", input.is_active ? "true" : "false")
  }
  return fd
}

const MULTIPART_HEADERS = { "Content-Type": "multipart/form-data" }

export async function listVideoInstructions(): Promise<VideoInstruction[]> {
  const { data } = await api.get<Paginated<VideoInstruction> | VideoInstruction[]>(
    "/video-instructions/"
  )
  return Array.isArray(data) ? data : data.results
}

export async function createVideoInstruction(
  input: VideoInstructionInput
): Promise<VideoInstruction> {
  const { data } = await api.post<VideoInstruction>(
    "/video-instructions/",
    buildFormData(input),
    { headers: MULTIPART_HEADERS }
  )
  return data
}

export async function updateVideoInstruction(
  id: number,
  input: VideoInstructionInput
): Promise<VideoInstruction> {
  const { data } = await api.patch<VideoInstruction>(
    `/video-instructions/${id}/`,
    buildFormData(input),
    { headers: MULTIPART_HEADERS }
  )
  return data
}

export async function deleteVideoInstruction(id: number): Promise<void> {
  await api.delete(`/video-instructions/${id}/`)
}

export function videoUrl(rec: VideoInstruction, slot: VideoSlot): string | null {
  return rec[`video_${slot}` as keyof VideoInstruction] as string | null
}

export function thumbUrl(rec: VideoInstruction, slot: VideoSlot): string | null {
  return rec[`thumb_${slot}` as keyof VideoInstruction] as string | null
}

export function fileIdValue(rec: VideoInstruction, slot: VideoSlot): string | null {
  return rec[`file_id_${slot}` as keyof VideoInstruction] as string | null
}

export const AUDIENCE_LABEL: Record<Audience, string> = {
  electrician: "Elektrik",
  seller: "Tadbirkor",
}

export const LANGUAGE_LABEL: Record<Language, string> = {
  uz: "O'zbek",
  ru: "Ruscha",
}

export function slotLabel(slot: VideoSlot): string {
  const [audience, lang] = slot.split("_") as [Audience, Language]
  return `${AUDIENCE_LABEL[audience]} · ${LANGUAGE_LABEL[lang]}`
}
