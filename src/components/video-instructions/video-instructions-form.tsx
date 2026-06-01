"use client"

import { Loader2 } from "lucide-react"
import * as React from "react"

import { VideoSlotCard } from "@/components/video-instructions/video-slot-card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  VIDEO_SLOTS,
  type VideoInstruction,
  type VideoInstructionInput,
  type VideoSlot,
} from "@/lib/api/video-instructions"
import {
  useCreateVideoInstruction,
  useUpdateVideoInstruction,
} from "@/lib/hooks/use-video-instructions"

const MAX_VIDEO_BYTES = 500 * 1024 * 1024 // 500 MB — лимит DATA_UPLOAD_MAX_MEMORY_SIZE
const MAX_THUMB_BYTES = 200 * 1024

type Props = {
  initial?: VideoInstruction
  onDone: () => void
}

type FileMap = Partial<Record<VideoSlot, File>>

export function VideoInstructionsForm({ initial, onDone }: Props) {
  const create = useCreateVideoInstruction()
  const update = useUpdateVideoInstruction()
  const isEdit = Boolean(initial)

  const [videos, setVideos] = React.useState<FileMap>({})
  const [thumbs, setThumbs] = React.useState<FileMap>({})
  const [isActive, setIsActive] = React.useState<boolean>(initial?.is_active ?? true)
  const [error, setError] = React.useState<string | null>(null)

  const pending = create.isPending || update.isPending

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    for (const slot of VIDEO_SLOTS) {
      const v = videos[slot]
      if (v && v.size > MAX_VIDEO_BYTES) {
        setError(`Video ${slot} > 500 MB`)
        return
      }
      const t = thumbs[slot]
      if (t && t.size > MAX_THUMB_BYTES) {
        setError(`Thumbnail ${slot} > 200 KB`)
        return
      }
    }

    const hasAny =
      Object.keys(videos).length > 0 || Object.keys(thumbs).length > 0
    if (!isEdit && !hasAny) {
      setError("Kamida bitta video yoki thumbnail yuklang")
      return
    }

    const input: VideoInstructionInput = { videos, thumbs, is_active: isActive }

    if (isEdit && initial) {
      update.mutate({ id: initial.id, input }, { onSuccess: () => onDone() })
    } else {
      create.mutate(input, { onSuccess: () => onDone() })
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {VIDEO_SLOTS.map((slot) => (
          <VideoSlotCard
            key={slot}
            slot={slot}
            initial={initial}
            video={videos[slot] ?? null}
            thumb={thumbs[slot] ?? null}
            onVideo={(f) =>
              setVideos((prev) => {
                const next = { ...prev }
                if (f) next[slot] = f
                else delete next[slot]
                return next
              })
            }
            onThumb={(f) =>
              setThumbs((prev) => {
                const next = { ...prev }
                if (f) next[slot] = f
                else delete next[slot]
                return next
              })
            }
          />
        ))}
      </div>

      <div className="flex flex-row items-center justify-between rounded-md border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="is_active">Faol</Label>
          <p className="text-muted-foreground text-sm">
            Bot bu yozuvni Web App va menulardan foydalanadi. Yana bitta faol bo&apos;lsa, qolganlar
            avtomatik nofaol bo&apos;ladi.
          </p>
        </div>
        <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
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
