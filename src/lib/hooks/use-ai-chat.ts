"use client"

import * as React from "react"

import {
  streamChat,
  type AIToolResult,
  type ChatMessage,
} from "@/lib/api/ai-chat"

// ─────────────────────────────────────────────────────────────────────────
// Внутренняя модель сообщения для UI — отличается от outbound ChatMessage
// тем что включает шаги (tool_call/tool_result), а не только текст/audio.
// ─────────────────────────────────────────────────────────────────────────

export type UIChatStep =
  | { kind: "tool_call"; name: string; args: Record<string, unknown> }
  | { kind: "tool_result"; name: string; ok: boolean; result: AIToolResult }

export type ChatStats = {
  model_used: string
  tool_calls: number
  tool_errors: number
  fell_back_to_pro: boolean
  input_tokens: number
  output_tokens: number
  elapsed_ms: number
  sql_queries: string[]
}

export type UIChatMessage = {
  id: string
  role: "user" | "model"
  text: string
  hasAudio?: boolean
  steps: UIChatStep[]
  isStreaming: boolean
  error?: string
  model?: string
  fellBackToPro?: boolean
  stats?: ChatStats
}

type State = {
  messages: UIChatMessage[]
  sessionId: string
  isStreaming: boolean
  error: string | null
}

type Action =
  | { type: "add_user"; message: UIChatMessage }
  | { type: "start_model"; id: string }
  | { type: "append_text"; id: string; delta: string }
  | { type: "append_step"; id: string; step: UIChatStep }
  | { type: "set_meta"; id: string; model: string; fellBack?: boolean }
  | { type: "finish"; id: string; stats: UIChatMessage["stats"] }
  | { type: "error"; id: string; message: string }
  | { type: "global_error"; message: string }
  | { type: "reset" }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add_user":
      return { ...state, messages: [...state.messages, action.message] }
    case "start_model":
      return {
        ...state,
        isStreaming: true,
        error: null,
        messages: [
          ...state.messages,
          {
            id: action.id,
            role: "model",
            text: "",
            steps: [],
            isStreaming: true,
          },
        ],
      }
    case "append_text":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, text: m.text + action.delta } : m,
        ),
      }
    case "append_step":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, steps: [...m.steps, action.step] } : m,
        ),
      }
    case "set_meta":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id
            ? { ...m, model: action.model, fellBackToPro: action.fellBack ?? m.fellBackToPro }
            : m,
        ),
      }
    case "finish":
      return {
        ...state,
        isStreaming: false,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, isStreaming: false, stats: action.stats } : m,
        ),
      }
    case "error":
      return {
        ...state,
        isStreaming: false,
        messages: state.messages.map((m) =>
          m.id === action.id
            ? { ...m, isStreaming: false, error: action.message }
            : m,
        ),
      }
    case "global_error":
      return { ...state, isStreaming: false, error: action.message }
    case "reset":
      return {
        messages: [],
        sessionId: crypto.randomUUID(),
        isStreaming: false,
        error: null,
      }
    default:
      return state
  }
}

function freshId(): string {
  return crypto.randomUUID()
}

/**
 * UI-хук для AI-чата: хранит историю, прокидывает в backend в формате
 * ChatMessage[], стримит чанки, заполняет state.
 */
export function useAIChat() {
  const [state, dispatch] = React.useReducer(reducer, null, () => ({
    messages: [],
    sessionId: crypto.randomUUID(),
    isStreaming: false,
    error: null,
  }))

  const abortRef = React.useRef<AbortController | null>(null)

  // Преобразуем UI-историю в outbound формат для backend.
  // Берём только финальные текстовые куски — steps/tool_call/tool_result
  // в outbound не отправляем (Gemini не нужен наш мета-формат).
  const buildOutboundMessages = React.useCallback(
    (extraUser: ChatMessage): ChatMessage[] => {
      const history: ChatMessage[] = state.messages
        .filter((m) => m.text || (m.role === "user" && m.hasAudio))
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }))
      return [...history, extraUser]
    },
    [state.messages],
  )

  const send = React.useCallback(
    async (opts: { text?: string; audio?: Blob | null }) => {
      const { text = "", audio = null } = opts
      if (!text.trim() && !audio) return

      // Останавливаем предыдущий стрим, если был.
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl

      const userId = freshId()
      const modelId = freshId()

      dispatch({
        type: "add_user",
        message: {
          id: userId,
          role: "user",
          text: text || (audio ? "[голосовой ввод]" : ""),
          hasAudio: !!audio,
          steps: [],
          isStreaming: false,
        },
      })
      dispatch({ type: "start_model", id: modelId })

      const outbound = buildOutboundMessages({
        role: "user",
        parts: text ? [{ text }] : [],
      })

      try {
        await streamChat(
          {
            sessionId: state.sessionId,
            messages: outbound,
            audio,
            signal: ctrl.signal,
          },
          (chunk) => {
            switch (chunk.kind) {
              case "meta":
                dispatch({
                  type: "set_meta",
                  id: modelId,
                  model: chunk.model,
                  fellBack: chunk.fell_back,
                })
                break
              case "text":
                dispatch({ type: "append_text", id: modelId, delta: chunk.delta })
                break
              case "tool_call":
                dispatch({
                  type: "append_step",
                  id: modelId,
                  step: { kind: "tool_call", name: chunk.name, args: chunk.args },
                })
                break
              case "tool_result":
                dispatch({
                  type: "append_step",
                  id: modelId,
                  step: {
                    kind: "tool_result",
                    name: chunk.name,
                    ok: chunk.ok,
                    result: chunk.result,
                  },
                })
                break
              case "done":
                dispatch({ type: "finish", id: modelId, stats: chunk.stats })
                break
              case "error":
                dispatch({ type: "error", id: modelId, message: chunk.message })
                break
            }
          },
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (message.includes("AbortError") || ctrl.signal.aborted) {
          dispatch({ type: "finish", id: modelId, stats: undefined })
        } else {
          dispatch({ type: "error", id: modelId, message })
        }
      }
    },
    [state.sessionId, buildOutboundMessages],
  )

  const abort = React.useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  const reset = React.useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    dispatch({ type: "reset" })
  }, [])

  return {
    messages: state.messages,
    sessionId: state.sessionId,
    isStreaming: state.isStreaming,
    error: state.error,
    send,
    abort,
    reset,
  }
}
