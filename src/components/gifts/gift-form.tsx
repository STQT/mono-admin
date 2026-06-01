"use client"

import Image from "next/image"
import { Loader2, Upload } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { type Gift, type GiftInput, type GiftUserType } from "@/lib/api/gifts"
import { useCreateGift, useUpdateGift } from "@/lib/hooks/use-gifts"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

type Props = {
  initial?: Gift
  onDone: () => void
}

type FormState = {
  name_uz_latin: string
  name_ru: string
  description_uz_latin: string
  description_ru: string
  points_cost: string
  user_type: GiftUserType | "all"
  is_active: boolean
  order: string
}

function defaultState(initial?: Gift): FormState {
  return {
    name_uz_latin: initial?.name_uz_latin ?? "",
    name_ru: initial?.name_ru ?? "",
    description_uz_latin: initial?.description_uz_latin ?? "",
    description_ru: initial?.description_ru ?? "",
    points_cost: initial?.points_cost ? String(initial.points_cost) : "",
    user_type: initial?.user_type ?? "all",
    is_active: initial?.is_active ?? true,
    order: initial?.order !== undefined ? String(initial.order) : "0",
  }
}

export function GiftForm({ initial, onDone }: Props) {
  const create = useCreateGift()
  const update = useUpdateGift()
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

    if (!state.name_uz_latin.trim()) {
      setError("Nomi (UZ) kerak")
      return
    }
    const points = Number(state.points_cost)
    if (!Number.isFinite(points) || points < 1) {
      setError("Ballar narxi — 1 dan boshlab musbat son")
      return
    }
    const order = Number(state.order || "0")
    if (!Number.isFinite(order)) {
      setError("Tartib raqami xato")
      return
    }
    if (!isEdit && !initial?.image && !image) {
      setError("Rasm kerak")
      return
    }
    if (image && image.size > MAX_IMAGE_BYTES) {
      setError("Rasm 5 MB dan oshmasligi kerak")
      return
    }

    const input: GiftInput = {
      name_uz_latin: state.name_uz_latin.trim(),
      name_ru: state.name_ru.trim(),
      description_uz_latin: state.description_uz_latin,
      description_ru: state.description_ru,
      points_cost: points,
      user_type: state.user_type === "all" ? "" : state.user_type,
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="name_uz_latin">Nomi (O&apos;zbek) *</Label>
          <Input
            id="name_uz_latin"
            value={state.name_uz_latin}
            onChange={(e) => setField("name_uz_latin", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="name_ru">Nomi (Ruscha)</Label>
          <Input
            id="name_ru"
            value={state.name_ru}
            onChange={(e) => setField("name_ru", e.target.value)}
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

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="points_cost">Ballar narxi *</Label>
          <Input
            id="points_cost"
            type="number"
            min={1}
            value={state.points_cost}
            onChange={(e) => setField("points_cost", e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="user_type">Foydalanuvchi turi</Label>
          <Select
            items={{ all: "Barcha", electrician: "Elektrik", seller: "Sotuvchi" }}
            value={state.user_type}
            onValueChange={(v) => setField("user_type", (v ?? "all") as GiftUserType | "all")}
          >
            <SelectTrigger id="user_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha</SelectItem>
              <SelectItem value="electrician">Elektrik</SelectItem>
              <SelectItem value="seller">Sotuvchi</SelectItem>
            </SelectContent>
          </Select>
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
        <Label htmlFor="image">
          Rasm {!isEdit && "*"} (≤5 MB)
        </Label>
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
            </>
          ) : (
            <p className="text-muted-foreground text-xs">Yo&apos;q</p>
          )}
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
