"use client"

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"

import { Card } from "@/components/ui/card"
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

// Декоративный спарклайн (как .kpi-spark в JIP SPA) — статичная мягкая кривая
// с заливкой primary-цветом, приклеена к низу карточки и приглушена.
function Spark() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-9 w-full opacity-40"
      viewBox="0 0 100 36"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="kpi-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 28 L12 24 L24 26 L36 18 L48 21 L60 12 L72 16 L84 8 L100 11 L100 36 L0 36 Z"
        fill="url(#kpi-spark-fill)"
      />
      <path
        d="M0 28 L12 24 L24 26 L36 18 L48 21 L60 12 L72 16 L84 8 L100 11"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function KpiCard({ label, value, hint, trend, trendUnit = " %", icon, loading }: Props) {
  return (
    <Card className="relative gap-0 overflow-hidden py-0 transition-all hover:-translate-y-px hover:ring-foreground/20">
      <div className="relative z-10 p-5 pb-9">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">{label}</span>
          {icon && (
            <span className="bg-[var(--jip-primary-soft)] text-primary grid size-8 place-items-center rounded-lg [&_svg]:size-4">
              {icon}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-[28px] leading-none font-semibold tracking-tight tabular-nums",
              loading && "text-muted-foreground"
            )}
          >
            {loading ? "…" : value}
          </span>
          {typeof trend === "number" && <TrendBadge trend={trend} unit={trendUnit} />}
        </div>
        {hint && <div className="text-muted-foreground mt-1.5 text-xs">{hint}</div>}
      </div>
      <Spark />
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
