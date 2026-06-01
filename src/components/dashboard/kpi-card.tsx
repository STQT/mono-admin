"use client"

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  value: number | string
  hint?: React.ReactNode
  trend?: number | null
  trendUnit?: string // напр. " %"
  icon?: React.ReactNode
  loading?: boolean
}

export function KpiCard({ label, value, hint, trend, trendUnit = " %", icon, loading }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="text-muted-foreground flex items-center justify-between text-sm font-medium">
          <span>{label}</span>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-3xl font-semibold", loading && "text-muted-foreground")}>
            {loading ? "…" : value}
          </span>
          {typeof trend === "number" && (
            <TrendBadge trend={trend} unit={trendUnit} />
          )}
        </div>
        {hint && <div className="text-muted-foreground mt-1 text-xs">{hint}</div>}
      </CardContent>
    </Card>
  )
}

function TrendBadge({ trend, unit }: { trend: number; unit: string }) {
  if (trend === 0) {
    return (
      <span className="text-muted-foreground inline-flex items-center gap-0.5 text-xs">
        <Minus className="size-3" />0{unit}
      </span>
    )
  }
  const up = trend > 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        up
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400"
      )}
    >
      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {Math.abs(trend)}
      {unit}
    </span>
  )
}
