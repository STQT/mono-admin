/**
 * Клиент для AI-chat SSE-стрима.
 *
 * Backend: POST /api/admin/ai/chat (multipart или JSON)
 * Ответ: text/event-stream с строками `data: <json>\n\n`.
 *
 * EventSource нельзя — он GET-only и без custom headers. Используем fetch
 * + ReadableStream + ручной парсинг SSE-фреймов.
 */
import { getAccessToken } from "./tokens"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8010"

// ─────────────────────────────────────────────────────────────────────────
// Типы — должны соответствовать chunk'ам из core/ai/gemini.py:chat_stream
// ─────────────────────────────────────────────────────────────────────────

export type ChatMessagePart =
  | { text: string }
  | { audio_b64: string; mime: string } // только outbound; inbound аудио нет

export type ChatMessage = {
  role: "user" | "model"
  parts: ChatMessagePart[]
}

export type AIToolResult = {
  ok: boolean
  error?: string
  // run_select_query
  sql_executed?: string
  columns?: string[]
  rows?: Record<string, unknown>[]
  row_count?: number
  truncated?: boolean
  row_limit?: number
  // list_tables
  tables?: Array<{
    table_name: string
    description: string | null
    approx_rows: number
    column_count: number
  }>
  count?: number
  // describe_table
  table_name?: string
  columns_meta?: Array<Record<string, unknown>> // (rename для ясности; backend называет columns)
  foreign_keys?: Array<{
    column_name: string
    references_table: string
    references_column: string
  }>
}

export type AIStreamChunk =
  | { kind: "meta"; model: string; fell_back?: boolean }
  | { kind: "text"; delta: string }
  | { kind: "tool_call"; name: string; args: Record<string, unknown> }
  | {
      kind: "tool_result"
      name: string
      ok: boolean
      result: AIToolResult
    }
  | {
      kind: "done"
      stats: {
        model_used: string
        tool_calls: number
        tool_errors: number
        fell_back_to_pro: boolean
        input_tokens: number
        output_tokens: number
        elapsed_ms: number
        sql_queries: string[]
      }
    }
  | { kind: "error"; message: string }

export type SendChatParams = {
  sessionId: string
  messages: ChatMessage[]
  audio?: Blob | null
  signal?: AbortSignal
}

/**
 * Открыть стрим и вызывать `onChunk` на каждый chunk.
 * Возвращает promise, который резолвится по `done`/`error` или AbortError.
 */
export async function streamChat(
  { sessionId, messages, audio, signal }: SendChatParams,
  onChunk: (chunk: AIStreamChunk) => void,
): Promise<void> {
  const url = `${API_BASE_URL}/api/admin/ai/chat/`
  const token = getAccessToken()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`

  let body: BodyInit
  if (audio) {
    const form = new FormData()
    form.append("payload", JSON.stringify({ session_id: sessionId, messages }))
    form.append("audio", audio, "voice.webm")
    body = form
    // Не выставляем Content-Type — браузер сам добавит boundary.
  } else {
    headers["Content-Type"] = "application/json"
    body = JSON.stringify({ session_id: sessionId, messages })
  }

  const res = await fetch(url, { method: "POST", headers, body, signal })
  if (!res.ok || !res.body) {
    let detail = res.statusText
    try {
      const j = await res.json()
      detail = j.detail || JSON.stringify(j)
    } catch {
      /* noop */
    }
    throw new Error(`AI chat: ${res.status} ${detail}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // SSE фреймы разделены двойным переводом строки.
    let sep: number
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)
      const dataLine = frame
        .split("\n")
        .find((l) => l.startsWith("data: "))
      if (!dataLine) continue
      const payload = dataLine.slice(6)
      if (!payload) continue
      try {
        onChunk(JSON.parse(payload) as AIStreamChunk)
      } catch {
        // битый chunk — пропускаем, не валим весь стрим
      }
    }
  }
}
