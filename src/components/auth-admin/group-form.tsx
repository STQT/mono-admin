"use client"

import { Loader2 } from "lucide-react"
import * as React from "react"

import { PermissionPicker } from "@/components/auth-admin/permission-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AuthGroup } from "@/lib/api/auth-admin"
import {
  useAuthPermissions,
  useCreateAuthGroup,
  useUpdateAuthGroup,
} from "@/lib/hooks/use-auth-admin"

type Props = {
  initial?: AuthGroup
  onDone: () => void
}

export function GroupForm({ initial, onDone }: Props) {
  const create = useCreateAuthGroup()
  const update = useUpdateAuthGroup()
  const permsQuery = useAuthPermissions()
  const isEdit = Boolean(initial)

  const [name, setName] = React.useState(initial?.name ?? "")
  const [permissions, setPermissions] = React.useState<number[]>(initial?.permissions ?? [])
  const [error, setError] = React.useState<string | null>(null)

  const pending = create.isPending || update.isPending

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError("Nomi kerak")
      return
    }
    const input = { name: name.trim(), permissions }
    if (isEdit && initial) {
      update.mutate({ id: initial.id, input }, { onSuccess: () => onDone() })
    } else {
      create.mutate(input, { onSuccess: () => onDone() })
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="group-name">Nomi *</Label>
        <Input
          id="group-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Call Center, Agent, …"
        />
      </div>

      <div className="grid gap-1.5">
        <Label>Permissions</Label>
        <PermissionPicker
          permissions={permsQuery.data}
          selected={permissions}
          onChange={setPermissions}
        />
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
