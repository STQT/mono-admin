"use client"

import { ArrowUp, Bot, RefreshCw, StopCircle, User } from "lucide-react"
import * as React from "react"

import { ToolTrace } from "@/components/ai/tool-trace"
import { VoiceButton } from "@/components/ai/voice-button"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useAIChat, type UIChatMessage } from "@/lib/hooks/use-ai-chat"
import { cn } from "@/lib/utils"

const SUGGESTIONS = [
  "Сколько пользователей зарегистрировано в этом месяце по регионам?",
  "Топ-10 электриков по баллам за последние 30 дней",
  "Сколько заявок на подарки в статусе pending старше 3 дней?",
  "Какой средний чек (points_cost) одобренных подарков?",
]

export function ChatPanel() {
  const { messages, isStreaming, send, abort, reset } = useAIChat()
  const [input, setInput] = React.useState("")
  const bottomRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages])

  const submit = () => {
    if (!input.trim() || isStreaming) return
    const text = input
    setInput("")
    void send({ text })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex h-[calc(100svh-7rem)] flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Yordamchi</h1>
          <p className="text-muted-foreground text-sm">
            Bazaga so&apos;rovlar Gemini orqali — readonly, faqat SELECT.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={reset} disabled={!messages.length}>
          <RefreshCw className="size-4" />
          Yangi suhbat
        </Button>
      </div>

      <Card className="flex flex-1 flex-col gap-0 overflow-hidden p-0">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <Empty onPick={(t) => setInput(t)} />
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <Bubble key={m.id} message={m} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="bg-background border-t p-3">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Yozing… (Enter — yuborish, Shift+Enter — yangi qator)"
              rows={2}
              className="min-h-[44px] resize-none"
              disabled={isStreaming}
            />
            <VoiceButton
              disabled={isStreaming}
              onRecorded={(blob) => void send({ audio: blob })}
            />
            {isStreaming ? (
              <Button type="button" variant="destructive" size="icon" onClick={abort}>
                <StopCircle className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                onClick={submit}
                disabled={!input.trim()}
              >
                <ArrowUp className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

function Empty({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <Bot className="text-muted-foreground/60 size-12" />
      <div>
        <div className="font-medium">Bazaga savol bering</div>
        <div className="text-muted-foreground text-sm">
          Misol uchun:
        </div>
      </div>
      <div className="grid w-full max-w-xl gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="hover:bg-muted/50 rounded-md border px-3 py-2 text-left text-sm transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function Bubble({ message }: { message: UIChatMessage }) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>
      <div className={cn("max-w-[min(85%,720px)] space-y-2", isUser && "items-end")}>
        {message.text && (
          <div
            className={cn(
              "rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap",
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted",
            )}
          >
            {message.text}
            {message.isStreaming && !message.text && (
              <span className="text-muted-foreground">o&apos;ylanmoqda…</span>
            )}
          </div>
        )}
        {!message.text && message.isStreaming && !isUser && (
          <div className="bg-muted text-muted-foreground rounded-2xl px-4 py-2 text-sm">
            o&apos;ylanmoqda…
          </div>
        )}
        {!isUser && <ToolTrace steps={message.steps} />}
        {message.error && (
          <div className="text-destructive text-xs">⚠ {message.error}</div>
        )}
        {message.stats && (
          <div className="text-muted-foreground text-[10px]">
            {message.stats.model_used}
            {message.fellBackToPro && " · fallback → pro"}
            {" · "}
            {message.stats.elapsed_ms} мс
            {" · "}
            {message.stats.input_tokens + message.stats.output_tokens} tokens
          </div>
        )}
      </div>
    </div>
  )
}
