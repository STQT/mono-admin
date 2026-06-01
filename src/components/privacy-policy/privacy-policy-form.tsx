"use client"

import { Loader2, Upload } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  filenameFromUrl,
  type PrivacyPolicy,
  type PrivacyPolicyInput,
} from "@/lib/api/privacy-policy"
import {
  useCreatePrivacyPolicy,
  useUpdatePrivacyPolicy,
} from "@/lib/hooks/use-privacy-policy"

const MAX_PDF_BYTES = 20 * 1024 * 1024

type Props = {
  initial?: PrivacyPolicy
  onDone: () => void
}

export function PrivacyPolicyForm({ initial, onDone }: Props) {
  const create = useCreatePrivacyPolicy()
  const update = useUpdatePrivacyPolicy()
  const isEdit = Boolean(initial)

  const [pdfUz, setPdfUz] = React.useState<File | null>(null)
  const [pdfRu, setPdfRu] = React.useState<File | null>(null)
  const [isActive, setIsActive] = React.useState<boolean>(initial?.is_active ?? true)
  const [error, setError] = React.useState<string | null>(null)

  const pending = create.isPending || update.isPending

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isEdit && !pdfUz && !pdfRu) {
      setError("Kamida bitta PDF fayl yuklang")
      return
    }
    if (pdfUz && pdfUz.size > MAX_PDF_BYTES) {
      setError("PDF (UZ) hajmi 20 MB dan oshmasligi kerak")
      return
    }
    if (pdfRu && pdfRu.size > MAX_PDF_BYTES) {
      setError("PDF (RU) hajmi 20 MB dan oshmasligi kerak")
      return
    }

    const input: PrivacyPolicyInput = { is_active: isActive }
    if (pdfUz) input.pdf_uz_latin = pdfUz
    if (pdfRu) input.pdf_ru = pdfRu

    if (isEdit && initial) {
      update.mutate({ id: initial.id, input }, { onSuccess: () => onDone() })
    } else {
      create.mutate(input, { onSuccess: () => onDone() })
    }
  }

  const currentUz = filenameFromUrl(initial?.pdf_uz_latin ?? null)
  const currentRu = filenameFromUrl(initial?.pdf_ru ?? null)

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FileField
        id="pdf_uz_latin"
        label="PDF (O'zbek)"
        currentName={currentUz}
        file={pdfUz}
        onChange={setPdfUz}
      />
      <FileField
        id="pdf_ru"
        label="PDF (Ruscha)"
        currentName={currentRu}
        file={pdfRu}
        onChange={setPdfRu}
      />

      <div className="flex flex-row items-center justify-between rounded-md border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="is_active">Faol</Label>
          <p className="text-muted-foreground text-sm">Web App da ko&apos;rsatish</p>
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

function FileField({
  id,
  label,
  currentName,
  file,
  onChange,
}: {
  id: string
  label: string
  currentName: string | null
  file: File | null
  onChange: (f: File | null) => void
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="file"
          accept="application/pdf"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          className="cursor-pointer"
        />
      </div>
      {file ? (
        <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
          <Upload className="size-3" />
          Yangi: {file.name} ({Math.round(file.size / 1024)} KB)
        </p>
      ) : currentName ? (
        <p className="text-muted-foreground text-xs">Joriy: {currentName}</p>
      ) : (
        <p className="text-muted-foreground text-xs">Hech narsa yuklanmagan</p>
      )}
    </div>
  )
}
