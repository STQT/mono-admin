"use client"

import { Loader2 } from "lucide-react"
import * as React from "react"

import { TelegramUserCombobox } from "@/components/live-streams/telegram-user-combobox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { LiveStreamWinner } from "@/lib/api/live-streams"
import type { TelegramUserLookup } from "@/lib/api/telegram-users"
import {
  useCreateLiveStreamWinner,
  useUpdateLiveStreamWinner,
} from "@/lib/hooks/use-live-stream-winners"

type Props = {
  liveStreamId: number
  initial?: LiveStreamWinner
  onDone: () => void
}

function initialUserStub(initial?: LiveStreamWinner): TelegramUserLookup | null {
  if (!initial) return null
  return {
    id: initial.user_id,
    telegram_id: initial.user_telegram_id,
    username: initial.user_username,
    first_name: "",
    last_name: "",
    full_name: initial.user_full_name,
    phone_number: null,
    user_type: null,
  }
}

export function WinnerForm({ liveStreamId, initial, onDone }: Props) {
  const isEdit = Boolean(initial)
  const create = useCreateLiveStreamWinner()
  const update = useUpdateLiveStreamWinner(liveStreamId)

  const [user, setUser] = React.useState<TelegramUserLookup | null>(() => initialUserStub(initial))
  const [prizeUz, setPrizeUz] = React.useState(initial?.prize_text_uz_latin ?? "")
  const [prizeRu, setPrizeRu] = React.useState(initial?.prize_text_ru ?? "")
  const [position, setPosition] = React.useState<string>(
    initial?.position ? String(initial.position) : ""
  )
  const [error, setError] = React.useState<string | null>(null)

  const pending = create.isPending || update.isPending

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) {
      setError("Foydalanuvchini tanlang")
      return
    }
    const pos = position.trim() === "" ? 0 : Number(position)
    if (!Number.isFinite(pos) || pos < 0) {
      setError("Tartib raqami — musbat son")
      return
    }

    if (isEdit && initial) {
      update.mutate(
        {
          id: initial.id,
          input: {
            user_id: user.id,
            prize_text_uz_latin: prizeUz,
            prize_text_ru: prizeRu,
            position: pos,
          },
        },
        { onSuccess: () => onDone() }
      )
    } else {
      create.mutate(
        {
          live_stream: liveStreamId,
          user_id: user.id,
          prize_text_uz_latin: prizeUz,
          prize_text_ru: prizeRu,
          position: pos,
        },
        { onSuccess: () => onDone() }
      )
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-md border p-3">
      <div className="grid gap-1.5">
        <Label>G&apos;olib</Label>
        <TelegramUserCombobox selected={user} onSelect={setUser} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-1.5 sm:col-span-1">
          <Label htmlFor="position">Tartib raqami</Label>
          <Input
            id="position"
            type="number"
            min={0}
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-1">
          <Label htmlFor="prize_uz">Sovg&apos;a (UZ)</Label>
          <Input
            id="prize_uz"
            value={prizeUz}
            onChange={(e) => setPrizeUz(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-1">
          <Label htmlFor="prize_ru">Sovg&apos;a (RU)</Label>
          <Input
            id="prize_ru"
            value={prizeRu}
            onChange={(e) => setPrizeRu(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onDone}>
          Bekor qilish
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? "Saqlash" : "Qo'shish"}
        </Button>
      </div>
    </form>
  )
}
