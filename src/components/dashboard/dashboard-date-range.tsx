"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type DashboardDateRange = {
  date_from: string | null // YYYY-MM-DD
  date_to: string | null
}

type Props = {
  value: DashboardDateRange
  onChange: (next: DashboardDateRange) => void
}

const PRESETS: { id: string; label: string; range: () => DashboardDateRange }[] = [
  {
    id: "current_month",
    label: "Joriy oy",
    range: () => {
      const today = new Date()
      const first = new Date(today.getFullYear(), today.getMonth(), 1)
      return { date_from: iso(first), date_to: iso(today) }
    },
  },
  {
    id: "last_7_days",
    label: "Oxirgi 7 kun",
    range: () => {
      const today = new Date()
      const seven = new Date(today)
      seven.setDate(today.getDate() - 6)
      return { date_from: iso(seven), date_to: iso(today) }
    },
  },
  {
    id: "last_month",
    label: "O'tgan oy",
    range: () => {
      const today = new Date()
      const firstThis = new Date(today.getFullYear(), today.getMonth(), 1)
      const endPrev = new Date(firstThis)
      endPrev.setDate(0)
      const firstPrev = new Date(endPrev.getFullYear(), endPrev.getMonth(), 1)
      return { date_from: iso(firstPrev), date_to: iso(endPrev) }
    },
  },
  {
    id: "all",
    label: "Butun davr",
    range: () => ({ date_from: null, date_to: null }),
  },
]

export function DashboardDateRangePicker({ value, onChange }: Props) {
  const activePresetId = React.useMemo(() => {
    for (const p of PRESETS) {
      const r = p.range()
      if (r.date_from === value.date_from && r.date_to === value.date_to) return p.id
    }
    return "custom"
  }, [value])

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <Button
            key={p.id}
            type="button"
            variant={activePresetId === p.id ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(p.range())}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <div className="ml-2 grid gap-1">
        <Label htmlFor="date_from" className="text-xs">
          Dan
        </Label>
        <Input
          id="date_from"
          type="date"
          value={value.date_from ?? ""}
          onChange={(e) => onChange({ ...value, date_from: e.target.value || null })}
          className="h-9 w-[150px]"
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="date_to" className="text-xs">
          Gacha
        </Label>
        <Input
          id="date_to"
          type="date"
          value={value.date_to ?? ""}
          onChange={(e) => onChange({ ...value, date_to: e.target.value || null })}
          className="h-9 w-[150px]"
        />
      </div>
    </div>
  )
}

function iso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
