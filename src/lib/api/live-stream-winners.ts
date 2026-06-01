import { api } from "./client"

import type { LiveStreamWinner } from "./live-streams"

/** На вход — либо user_id (PK), либо user_telegram_id. */
export type LiveStreamWinnerInput = {
  live_stream: number
  user_id?: number
  user_telegram_id?: number
  prize_text_uz_latin?: string
  prize_text_ru?: string
  position?: number
}

export type LiveStreamWinnerPatch = Omit<Partial<LiveStreamWinnerInput>, "live_stream">

export async function listLiveStreamWinners(liveStreamId: number): Promise<LiveStreamWinner[]> {
  const { data } = await api.get<LiveStreamWinner[] | { results: LiveStreamWinner[] }>(
    "/live-stream-winners/",
    { params: { live_stream: liveStreamId } }
  )
  return Array.isArray(data) ? data : data.results
}

export async function createLiveStreamWinner(input: LiveStreamWinnerInput): Promise<LiveStreamWinner> {
  const { data } = await api.post<LiveStreamWinner>("/live-stream-winners/", input)
  return data
}

export async function updateLiveStreamWinner(
  id: number,
  input: LiveStreamWinnerPatch
): Promise<LiveStreamWinner> {
  const { data } = await api.patch<LiveStreamWinner>(`/live-stream-winners/${id}/`, input)
  return data
}

export async function deleteLiveStreamWinner(id: number): Promise<void> {
  await api.delete(`/live-stream-winners/${id}/`)
}
