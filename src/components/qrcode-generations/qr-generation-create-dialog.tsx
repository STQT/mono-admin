"use client"

import { Loader2, Plus } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateQRGeneration } from "@/lib/hooks/use-qrcode-generations"

const CODE_TYPE_ITEMS = {
  electrician: "Elektrik (E-)",
  seller: "Sotuvchi (D-)",
} as const

const MAX_QUANTITY = 100_000

export function QRGenerationCreateDialog() {
  const [open, setOpen] = React.useState(false)
  const create = useCreateQRGeneration()

  const [codeType, setCodeType] = React.useState<"electrician" | "seller">("electrician")
  const [quantity, setQuantity] = React.useState("100")
  const [points, setPoints] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const reset = () => {
    setCodeType("electrician")
    setQuantity("100")
    setPoints("")
    setError(null)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QUANTITY) {
      setError(`Miqdor — 1 dan ${MAX_QUANTITY.toLocaleString()} gacha musbat son`)
      return
    }
    const ptsValue = points.trim() === "" ? null : Number(points)
    if (ptsValue !== null && (!Number.isFinite(ptsValue) || ptsValue < 0)) {
      setError("Ballar — manfiy bo'lmagan son yoki bo'sh")
      return
    }
    create.mutate(
      { code_type: codeType, quantity: qty, points: ptsValue },
      {
        onSuccess: () => {
          setOpen(false)
          reset()
        },
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" />
            Yangi partiya
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Promo-kodlar partiyasini yaratish</DialogTitle>
          <DialogDescription>
            Celery worker fonda kerakli miqdordagi kodlarni yaratadi va ZIP/Excel
            tayyorlaydi. Status ro&apos;yxatda yangilanadi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="code_type">Kod turi</Label>
            <Select
              items={CODE_TYPE_ITEMS}
              value={codeType}
              onValueChange={(v) => v && setCodeType(v as "electrician" | "seller")}
            >
              <SelectTrigger id="code_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electrician">Elektrik (E-)</SelectItem>
                <SelectItem value="seller">Sotuvchi (D-)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="quantity">Miqdori</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={MAX_QUANTITY}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              Maksimum: {MAX_QUANTITY.toLocaleString()}
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="points">Ballar (ixtiyoriy)</Label>
            <Input
              id="points"
              type="number"
              min={0}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="Bo'sh qoldirsangiz: settings'dan default"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="size-4 animate-spin" />}
              Yaratish
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
