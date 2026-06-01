"use client"

import { Check, Clapperboard, Image as ImageIcon, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  fileIdValue,
  slotLabel,
  thumbUrl,
  videoUrl,
  type VideoInstruction,
  type VideoSlot,
} from "@/lib/api/video-instructions"

type Props = {
  slot: VideoSlot
  initial?: VideoInstruction
  video: File | null
  thumb: File | null
  onVideo: (f: File | null) => void
  onThumb: (f: File | null) => void
}

export function VideoSlotCard({ slot, initial, video, thumb, onVideo, onThumb }: Props) {
  const currentVideo = initial ? videoUrl(initial, slot) : null
  const currentThumb = initial ? thumbUrl(initial, slot) : null
  const currentFileId = initial ? fileIdValue(initial, slot) : null

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{slotLabel(slot)}</h3>
        {currentFileId ? (
          <Badge variant="secondary" className="gap-1">
            <Check className="size-3" /> file_id
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground gap-1">
            <X className="size-3" /> file_id
          </Badge>
        )}
      </div>

      <FileRow
        id={`video_${slot}`}
        label="Video"
        accept="video/*"
        icon={<Clapperboard className="size-3" />}
        file={video}
        currentUrl={currentVideo}
        onChange={onVideo}
      />

      <FileRow
        id={`thumb_${slot}`}
        label="Thumbnail (JPEG, ≤320×320, ≤200 KB)"
        accept="image/jpeg,image/png"
        icon={<ImageIcon className="size-3" />}
        file={thumb}
        currentUrl={currentThumb}
        onChange={onThumb}
      />
    </div>
  )
}

function FileRow({
  id,
  label,
  accept,
  icon,
  file,
  currentUrl,
  onChange,
}: {
  id: string
  label: string
  accept: string
  icon: React.ReactNode
  file: File | null
  currentUrl: string | null
  onChange: (f: File | null) => void
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="flex items-center gap-1 text-xs">
        {icon}
        {label}
      </Label>
      <Input
        id={id}
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="h-9 cursor-pointer"
      />
      {file ? (
        <p className="text-muted-foreground text-xs">
          Yangi: {file.name} ({formatSize(file.size)})
        </p>
      ) : currentUrl ? (
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary truncate text-xs hover:underline"
        >
          Joriy: ko&apos;rish
        </a>
      ) : (
        <p className="text-muted-foreground text-xs">Yo&apos;q</p>
      )}
    </div>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
