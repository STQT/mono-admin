"use client"

import { Loader2 } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { LiveStream, LiveStreamInput } from "@/lib/api/live-streams"
import { useCreateLiveStream, useUpdateLiveStream } from "@/lib/hooks/use-live-streams"

const MAX_BANNER_BYTES = 5 * 1024 * 1024

type Props = {
  initial?: LiveStream
  onDone: () => void
}

type FormState = {
  title_uz_latin: string
  title_ru: string
  description_uz_latin: string
  description_ru: string
  scheduled_local: string
  stream_url: string
  participants_count: string
  is_active: boolean
}

function defaultState(initial?: LiveStream): FormState {
  return {
    title_uz_latin: initial?.title_uz_latin ?? "",
    title_ru: initial?.title_ru ?? "",
    description_uz_latin: initial?.description_uz_latin ?? "",
    description_ru: initial?.description_ru ?? "",
    scheduled_local: initial ? isoToLocalInput(initial.scheduled_at) : "",
    stream_url: initial?.stream_url ?? "",
    participants_count:
      initial?.participants_count !== null && initial?.participants_count !== undefined
        ? String(initial.participants_count)
        : "",
    is_active: initial?.is_active ?? true,
  }
}

export function LiveStreamForm({ initial, onDone }: Props) {
  const create = useCreateLiveStream()
  const update = useUpdateLiveStream()
  const isEdit = Boolean(initial)

  const [state, setState] = React.useState<FormState>(() => defaultState(initial))
  const [banner, setBanner] = React.useState<File | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const pending = create.isPending || update.isPending

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!state.title_uz_latin.trim()) {
      setError("Sarlavha (UZ) kerak")
      return
    }
    if (!state.scheduled_local) {
      setError("Efir vaqti kerak")
      return
    }
    if (!state.stream_url.trim()) {
      setError("Efir havolasi kerak")
      return
    }
    if (banner && banner.size > MAX_BANNER_BYTES) {
      setError("Banner 5 MB dan oshmasligi kerak")
      return
    }
    const participants =
      state.participants_count.trim() === "" ? null : Number(state.participants_count)
    if (participants !== null && (!Number.isFinite(participants) || participants < 0)) {
      setError("Ishtirokchilar soni — musbat son")
      return
    }

    const input: LiveStreamInput = {
      title_uz_latin: state.title_uz_latin.trim(),
      title_ru: state.title_ru.trim(),
      description_uz_latin: state.description_uz_latin,
      description_ru: state.description_ru,
      scheduled_at: localInputToIso(state.scheduled_local),
      stream_url: state.stream_url.trim(),
      participants_count: participants,
      is_active: state.is_active,
    }
    if (banner) input.banner = banner

    if (isEdit && initial) {
      update.mutate({ id: initial.id, input }, { onSuccess: () => onDone() })
    } else {
      create.mutate(input, { onSuccess: () => onDone() })
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="title_uz_latin">Sarlavha (O&apos;zbek) *</Label>
          <Input
            id="title_uz_latin"
            value={state.title_uz_latin}
            onChange={(e) => setField("title_uz_latin", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="title_ru">Sarlavha (Ruscha)</Label>
          <Input
            id="title_ru"
            value={state.title_ru}
            onChange={(e) => setField("title_ru", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="description_uz_latin">Tavsif (O&apos;zbek)</Label>
          <Textarea
            id="description_uz_latin"
            rows={3}
            value={state.description_uz_latin}
            onChange={(e) => setField("description_uz_latin", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="description_ru">Tavsif (Ruscha)</Label>
          <Textarea
            id="description_ru"
            rows={3}
            value={state.description_ru}
            onChange={(e) => setField("description_ru", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="scheduled_at">Efir vaqti *</Label>
          <Input
            id="scheduled_at"
            type="datetime-local"
            value={state.scheduled_local}
            onChange={(e) => setField("scheduled_local", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="stream_url">Efir havolasi *</Label>
          <Input
            id="stream_url"
            type="url"
            placeholder="https://t.me/..."
            value={state.stream_url}
            onChange={(e) => setField("stream_url", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="banner">Banner (≤5 MB)</Label>
          <Input
            id="banner"
            type="file"
            accept="image/*"
            onChange={(e) => setBanner(e.target.files?.[0] ?? null)}
            className="cursor-pointer"
          />
          {banner ? (
            <p className="text-muted-foreground text-xs">
              Yangi: {banner.name} ({Math.round(banner.size / 1024)} KB)
            </p>
          ) : initial?.banner ? (
            <a
              href={initial.banner}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-xs hover:underline"
            >
              Joriy banner ko&apos;rish
            </a>
          ) : (
            <p className="text-muted-foreground text-xs">Yo&apos;q</p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="participants_count">Ishtirokchilar soni</Label>
          <Input
            id="participants_count"
            type="number"
            min={0}
            value={state.participants_count}
            onChange={(e) => setField("participants_count", e.target.value)}
            placeholder="Avtomatik bo'lmasa qo'lda"
          />
        </div>
      </div>

      <div className="flex flex-row items-center justify-between rounded-md border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="is_active">Faol</Label>
          <p className="text-muted-foreground text-sm">Web App da ko&apos;rsatish</p>
        </div>
        <Switch
          id="is_active"
          checked={state.is_active}
          onCheckedChange={(v) => setField("is_active", v)}
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Bekor qilish
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? "Saqlash" : "Qo'shish"}
        </Button>
      </div>
    </form>
  )
}

function isoToLocalInput(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  )
}

function localInputToIso(local: string): string {
  return new Date(local).toISOString()
}
