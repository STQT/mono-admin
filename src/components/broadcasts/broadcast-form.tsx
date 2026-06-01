"use client"

import Image from "next/image"
import { Loader2, Upload } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BROADCAST_LANGUAGES,
  BROADCAST_LANGUAGE_LABEL,
  BROADCAST_REGIONS,
  BROADCAST_USER_TYPES,
  BROADCAST_USER_TYPE_LABEL,
  type BroadcastMessage,
  type BroadcastMessageInput,
} from "@/lib/api/broadcast-messages"
import {
  useCreateBroadcastMessage,
  useUpdateBroadcastMessage,
} from "@/lib/hooks/use-broadcast-messages"
import {
  telegramToTiptapHtml,
  tiptapHtmlToTelegram,
} from "@/lib/telegram-html"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALL_SENTINEL = "_all" as const

type Props = {
  initial?: BroadcastMessage
  onDone: () => void
}

type FormState = {
  title: string
  message_text: string
  user_type: string
  region: string
  language: string
}

function defaultState(initial?: BroadcastMessage): FormState {
  return {
    title: initial?.title ?? "",
    // В DB лежит Telegram-HTML; для редактора заворачиваем строки в <p>
    // чтобы TipTap корректно показал переводы и форматирование.
    message_text: telegramToTiptapHtml(initial?.message_text ?? ""),
    user_type: initial?.user_type_filter || ALL_SENTINEL,
    region: initial?.region_filter || ALL_SENTINEL,
    language: initial?.language_filter || ALL_SENTINEL,
  }
}

export function BroadcastForm({ initial, onDone }: Props) {
  const create = useCreateBroadcastMessage()
  const update = useUpdateBroadcastMessage()
  const isEdit = Boolean(initial)

  const [state, setState] = React.useState<FormState>(() => defaultState(initial))
  const [image, setImage] = React.useState<File | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const pending = create.isPending || update.isPending

  const userTypeItems = React.useMemo(
    () => ({
      [ALL_SENTINEL]: BROADCAST_USER_TYPE_LABEL[""],
      ...Object.fromEntries(
        BROADCAST_USER_TYPES.filter((v) => v !== "").map((v) => [
          v,
          BROADCAST_USER_TYPE_LABEL[v],
        ])
      ),
    }),
    []
  )
  const languageItems = React.useMemo(
    () => ({
      [ALL_SENTINEL]: BROADCAST_LANGUAGE_LABEL[""],
      ...Object.fromEntries(
        BROADCAST_LANGUAGES.filter((v) => v !== "").map((v) => [
          v,
          BROADCAST_LANGUAGE_LABEL[v],
        ])
      ),
    }),
    []
  )
  const regionItems = React.useMemo(
    () =>
      Object.fromEntries(
        BROADCAST_REGIONS.map((r) => [r.code === "" ? ALL_SENTINEL : r.code, r.label])
      ),
    []
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!state.title.trim()) {
      setError("Sarlavha kerak")
      return
    }
    const telegramText = tiptapHtmlToTelegram(state.message_text).trim()
    if (!telegramText) {
      setError("Xabar matni kerak")
      return
    }
    if (image && image.size > MAX_IMAGE_BYTES) {
      setError("Rasm 5 MB dan oshmasligi kerak")
      return
    }

    const input: BroadcastMessageInput = {
      title: state.title.trim(),
      message_text: telegramText,
      user_type_filter: state.user_type === ALL_SENTINEL ? "" : state.user_type,
      region_filter: state.region === ALL_SENTINEL ? "" : state.region,
      language_filter: state.language === ALL_SENTINEL ? "" : state.language,
    }
    if (image) input.image = image

    if (isEdit && initial) {
      update.mutate({ id: initial.id, input }, { onSuccess: () => onDone() })
    } else {
      create.mutate(input, { onSuccess: () => onDone() })
    }
  }

  const setField = <K extends keyof FormState>(key: K, v: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: v }))

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="title">Sarlavha *</Label>
        <Input id="title" value={state.title} onChange={(e) => setField("title", e.target.value)} />
        <p className="text-muted-foreground text-xs">Faqat admin uchun, foydalanuvchiga ko&apos;rsatilmaydi.</p>
      </div>

      <div className="grid gap-1.5">
        <Label>Xabar matni *</Label>
        <RichTextEditor
          value={state.message_text}
          onChange={(html) => setField("message_text", html)}
          placeholder="Bu yerda xabar matnini yozing…"
        />
        <p className="text-muted-foreground text-xs">
          Telegram qo&apos;llab-quvvatlaydigan formatlar: qalin, kursiv, tagiga chizilgan,
          o&apos;chirilgan, monospace, iqtibos, havola.
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="image">Rasm (≤5 MB, ixtiyoriy)</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="cursor-pointer"
        />
        {image ? (
          <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <Upload className="size-3" />
            Yangi: {image.name} ({Math.round(image.size / 1024)} KB)
          </p>
        ) : initial?.image ? (
          <div className="flex items-center gap-2">
            <Image
              src={initial.image}
              alt="Joriy rasm"
              width={64}
              height={64}
              className="size-16 rounded object-cover"
              unoptimized
            />
            <a
              href={initial.image}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-xs hover:underline"
            >
              Joriy rasm
            </a>
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">Yo&apos;q</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="user_type">Foydalanuvchi turi</Label>
          <Select
            items={userTypeItems}
            value={state.user_type}
            onValueChange={(v) => v && setField("user_type", v)}
          >
            <SelectTrigger id="user_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(userTypeItems).map(([code, label]) => (
                <SelectItem key={code} value={code}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="language">Til</Label>
          <Select
            items={languageItems}
            value={state.language}
            onValueChange={(v) => v && setField("language", v)}
          >
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(languageItems).map(([code, label]) => (
                <SelectItem key={code} value={code}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="region">Viloyat</Label>
          <Select
            items={regionItems}
            value={state.region}
            onValueChange={(v) => v && setField("region", v)}
          >
            <SelectTrigger id="region">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BROADCAST_REGIONS.map((r) => (
                <SelectItem key={r.code || ALL_SENTINEL} value={r.code || ALL_SENTINEL}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Bekor qilish
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? "Saqlash" : "Yaratish"}
        </Button>
      </div>
    </form>
  )
}
