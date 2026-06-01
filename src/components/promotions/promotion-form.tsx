"use client"

import Image from "next/image"
import { Loader2, Upload } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Promotion, PromotionInput } from "@/lib/api/promotions"
import { useCreatePromotion, useUpdatePromotion } from "@/lib/hooks/use-promotions"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

type Props = {
  initial?: Promotion
  onDone: () => void
}

type FormState = {
  title: string
  date: string
  order: string
  is_active: boolean
}

function defaultState(initial?: Promotion): FormState {
  return {
    title: initial?.title ?? "",
    date: initial?.date ?? "",
    order: initial?.order !== undefined ? String(initial.order) : "0",
    is_active: initial?.is_active ?? true,
  }
}

export function PromotionForm({ initial, onDone }: Props) {
  const create = useCreatePromotion()
  const update = useUpdatePromotion()
  const isEdit = Boolean(initial)

  const [state, setState] = React.useState<FormState>(() => defaultState(initial))
  const [image, setImage] = React.useState<File | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const pending = create.isPending || update.isPending

  const setField = <K extends keyof FormState>(key: K, v: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: v }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isEdit && !image) {
      setError("Rasm kerak")
      return
    }
    if (image && image.size > MAX_IMAGE_BYTES) {
      setError("Rasm 5 MB dan oshmasligi kerak")
      return
    }
    const order = Number(state.order || "0")
    if (!Number.isFinite(order)) {
      setError("Tartib raqami xato")
      return
    }

    const input: PromotionInput = {
      title: state.title || null,
      date: state.date || null,
      is_active: state.is_active,
      order,
    }
    if (image) input.image = image

    if (isEdit && initial) {
      update.mutate({ id: initial.id, input }, { onSuccess: () => onDone() })
    } else {
      create.mutate(input, { onSuccess: () => onDone() })
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="title">Sarlavha</Label>
        <Input
          id="title"
          value={state.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Ixtiyoriy"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="date">Sana</Label>
          <Input
            id="date"
            type="date"
            value={state.date}
            onChange={(e) => setField("date", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="order">Tartib raqami</Label>
          <Input
            id="order"
            type="number"
            value={state.order}
            onChange={(e) => setField("order", e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="image">Rasm {!isEdit && "*"} (≤5 MB)</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="cursor-pointer"
        />
        <div className="flex items-center gap-3">
          {image ? (
            <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <Upload className="size-3" />
              Yangi: {image.name} ({Math.round(image.size / 1024)} KB)
            </p>
          ) : initial?.image ? (
            <>
              <Image
                src={initial.image}
                alt={initial.title ?? "Banner"}
                width={120}
                height={80}
                className="h-20 w-30 rounded object-cover"
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
            </>
          ) : (
            <p className="text-muted-foreground text-xs">Yo&apos;q</p>
          )}
        </div>
      </div>

      <div className="flex flex-row items-center justify-between rounded-md border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="is_active">Faol</Label>
          <p className="text-muted-foreground text-sm">Web App slayderida ko&apos;rsatish</p>
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
