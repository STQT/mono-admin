"use client"

import { Search, X } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AuthPermission } from "@/lib/api/auth-admin"

type Props = {
  permissions: AuthPermission[] | undefined
  selected: number[]
  onChange: (next: number[]) => void
  disabled?: boolean
}

/**
 * Чекбокс-пикер по списку Django permissions. Группировка: app_label → model.
 * Заголовки app_label — sticky. Поиск дебаунсится локально.
 */
export function PermissionPicker({ permissions, selected, onChange, disabled }: Props) {
  const [query, setQuery] = React.useState("")
  const selectedSet = React.useMemo(() => new Set(selected), [selected])

  const filtered = React.useMemo(() => {
    if (!permissions) return []
    const q = query.trim().toLowerCase()
    if (!q) return permissions
    return permissions.filter(
      (p) =>
        p.codename.toLowerCase().includes(q) ||
        p.full_codename.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.app_label.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q)
    )
  }, [permissions, query])

  const grouped = React.useMemo(() => {
    const m = new Map<string, Map<string, AuthPermission[]>>()
    for (const p of filtered) {
      let byModel = m.get(p.app_label)
      if (!byModel) {
        byModel = new Map()
        m.set(p.app_label, byModel)
      }
      const arr = byModel.get(p.model) ?? []
      arr.push(p)
      byModel.set(p.model, arr)
    }
    return m
  }, [filtered])

  const toggle = (id: number) => {
    const next = new Set(selectedSet)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange([...next])
  }

  const toggleGroup = (perms: AuthPermission[]) => {
    const ids = perms.map((p) => p.id)
    const allSelected = ids.every((id) => selectedSet.has(id))
    const next = new Set(selectedSet)
    if (allSelected) ids.forEach((id) => next.delete(id))
    else ids.forEach((id) => next.add(id))
    onChange([...next])
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
        <Input
          placeholder="Codename, app yoki tavsif…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
          disabled={disabled}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
            onClick={() => setQuery("")}
          >
            <X className="size-3" />
          </Button>
        )}
      </div>

      <div className="max-h-[340px] overflow-y-auto rounded-md border">
        {!permissions && (
          <div className="text-muted-foreground p-3 text-sm">Yuklanmoqda…</div>
        )}
        {permissions && grouped.size === 0 && (
          <div className="text-muted-foreground p-3 text-sm">Hech narsa topilmadi</div>
        )}
        {[...grouped.entries()].map(([appLabel, byModel]) => (
          <div key={appLabel} className="border-b last:border-b-0">
            <div className="bg-muted/40 sticky top-0 z-10 px-3 py-1.5 text-xs font-semibold uppercase">
              {appLabel}
            </div>
            {[...byModel.entries()].map(([model, perms]) => {
              const allSelected = perms.every((p) => selectedSet.has(p.id))
              const someSelected = perms.some((p) => selectedSet.has(p.id))
              return (
                <div key={model} className="px-3 py-2">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium">{model}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      disabled={disabled}
                      onClick={() => toggleGroup(perms)}
                    >
                      {allSelected
                        ? "Hammasini olib tashlash"
                        : someSelected
                          ? "Hammasini tanlash"
                          : "Hammasini tanlash"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
                    {perms.map((p) => (
                      <label
                        key={p.id}
                        className="hover:bg-accent/40 flex cursor-pointer items-start gap-2 rounded px-2 py-1 text-xs"
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 size-3.5 shrink-0"
                          checked={selectedSet.has(p.id)}
                          disabled={disabled}
                          onChange={() => toggle(p.id)}
                        />
                        <span className="flex-1">
                          <span className="font-mono">{p.codename}</span>
                          <span className="text-muted-foreground ml-1">— {p.name}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <p className="text-muted-foreground text-xs">
        Tanlandi: <span className="font-medium">{selected.length}</span>
      </p>
    </div>
  )
}
