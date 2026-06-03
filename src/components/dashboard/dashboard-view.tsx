"use client"

import {
  Coins,
  Gift,
  QrCode,
  ScanLine,
  ShoppingBag,
  Users,
} from "lucide-react"
import * as React from "react"

import {
  DashboardDateRangePicker,
  type DashboardDateRange,
} from "@/components/dashboard/dashboard-date-range"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { GiftRedemptionGroup, RedemptionStatusCode } from "@/lib/api/dashboard"
import { REDEMPTION_STATUS_CODES } from "@/lib/api/dashboard"
import { useDashboardGeneral } from "@/lib/hooks/use-dashboard"

const REDEMPTION_STATUS_LABEL: Record<RedemptionStatusCode, string> = {
  pending: "So'rov",
  approved: "Tayyorlash",
  sent: "Yetkazib berishda",
  completed: "Yetkazildi",
  rejected: "Bekor (admin)",
  cancelled_by_user: "Bekor (user)",
  not_received: "Olmadi",
}

const REDEMPTION_STATUS_TONE: Record<RedemptionStatusCode, string> = {
  pending: "border-amber-500/40 text-amber-800 dark:text-amber-300",
  approved: "border-emerald-500/40 text-emerald-800 dark:text-emerald-300",
  sent: "border-sky-500/40 text-sky-800 dark:text-sky-300",
  completed: "border-emerald-600/50 text-emerald-900 dark:text-emerald-200",
  rejected: "border-red-500/40 text-red-800 dark:text-red-300",
  cancelled_by_user: "border-pink-500/40 text-pink-800 dark:text-pink-300",
  not_received: "border-orange-500/40 text-orange-800 dark:text-orange-300",
}

function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return "0"
  return n.toLocaleString()
}

export function DashboardView() {
  const [range, setRange] = React.useState<DashboardDateRange>(() => {
    const today = new Date()
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    const pad = (n: number) => String(n).padStart(2, "0")
    const iso = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    return { date_from: iso(first), date_to: iso(today) }
  })

  const { data, isLoading, isError, error, isFetching } = useDashboardGeneral({
    date_from: range.date_from,
    date_to: range.date_to,
  })

  const periodLabel =
    range.date_from && range.date_to
      ? `${range.date_from} … ${range.date_to}`
      : "Butun davr"

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Boshqaruv paneli</h1>
          <p className="text-muted-foreground text-sm">
            Loyaliti dasturi bo&apos;yicha umumiy ko&apos;rsatkichlar.{" "}
            {isFetching && <span>· yangilanmoqda…</span>}
          </p>
        </div>
        <DashboardDateRangePicker value={range} onChange={setRange} />
      </div>

      {isError && (
        <div className="text-destructive text-sm">
          Xatolik: {(error as Error)?.message ?? "noma'lum"}
        </div>
      )}

      <section>
        <h2 className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
          Davr: {periodLabel}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Foydalanuvchilar"
            value={fmt(data?.users_total)}
            trend={data?.trends.users_total ?? null}
            icon={<Users className="size-4" />}
            hint={
              <span>
                ⚡ {fmt(data?.users_electrician)} · 🛒 {fmt(data?.users_seller)}
                {data?.users_unselected ? ` · ❓ ${fmt(data.users_unselected)}` : ""}
              </span>
            }
            loading={isLoading}
          />
          <KpiCard
            label="Skanerlangan promokodlar"
            value={fmt((data?.qr_e_scanned ?? 0) + (data?.qr_s_scanned ?? 0))}
            icon={<ScanLine className="size-4" />}
            hint={
              <span>
                ⚡ {fmt(data?.qr_e_scanned)} · 🛒 {fmt(data?.qr_s_scanned)}
              </span>
            }
            loading={isLoading}
          />
          <KpiCard
            label="Berilgan ballar"
            value={fmt(data?.points_total)}
            trend={data?.trends.points_total ?? null}
            icon={<Coins className="size-4" />}
            hint={
              <span>
                ⚡ {fmt(data?.points_electrician)} · 🛒 {fmt(data?.points_seller)}
              </span>
            }
            loading={isLoading}
          />
          <KpiCard
            label="Sovg'a so'rovlari"
            value={fmt(data?.gifts_total)}
            icon={<ShoppingBag className="size-4" />}
            hint={
              <span>
                ⚡ {fmt(data?.gifts_electrician)} · 🛒 {fmt(data?.gifts_seller)}
              </span>
            }
            loading={isLoading}
          />
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
          Davrda — promo-kodlar fondi
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <PoolCard
            title="⚡ Elektriklar"
            total={data?.pool_e_total}
            scanned={data?.pool_e_scanned}
            spent={data?.pool_e_spent}
            unscanned={data?.pool_e_unscanned}
            loading={isLoading}
          />
          <PoolCard
            title="🛒 Sotuvchilar"
            total={data?.pool_s_total}
            scanned={data?.pool_s_scanned}
            spent={data?.pool_s_spent}
            unscanned={data?.pool_s_unscanned}
            loading={isLoading}
          />
        </div>
      </section>

      <section>
        <h2 className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
          Sovg&apos;a so&apos;rovlari — statuslar bo&apos;yicha
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <RedemptionStatusCard
            title="⚡ Elektriklar"
            group={data?.gift_redemptions_electrician}
            loading={isLoading}
          />
          <RedemptionStatusCard
            title="🛒 Sotuvchilar"
            group={data?.gift_redemptions_seller}
            loading={isLoading}
          />
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
          Butun davr (lifetime)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Jami foydalanuvchilar"
            value={fmt(data?.life_u_total)}
            icon={<Users className="size-4" />}
            hint={
              <span>
                ⚡ {fmt(data?.life_u_e)} · 🛒 {fmt(data?.life_u_s)}
                {data?.life_u_unselected
                  ? ` · ❓ ${fmt(data.life_u_unselected)}`
                  : ""}
              </span>
            }
            loading={isLoading}
          />
          <KpiCard
            label="Jami skanerlangan ⚡"
            value={fmt(data?.life_qr_e_scanned)}
            icon={<QrCode className="size-4" />}
            hint={
              <span>
                {fmt(data?.life_qr_e_total)} dan ·{" "}
                {fmt(data?.life_qr_e_unscanned)} skanerlanmagan
              </span>
            }
            loading={isLoading}
          />
          <KpiCard
            label="Jami skanerlangan 🛒"
            value={fmt(data?.life_qr_s_scanned)}
            icon={<QrCode className="size-4" />}
            hint={
              <span>
                {fmt(data?.life_qr_s_total)} dan ·{" "}
                {fmt(data?.life_qr_s_unscanned)} skanerlanmagan
              </span>
            }
            loading={isLoading}
          />
          <KpiCard
            label="Jami sovg'a so'rovlari"
            value={fmt(data?.life_gifts_total)}
            icon={<Gift className="size-4" />}
            hint={
              <span>
                ⚡ {fmt(data?.life_gifts_e)} · 🛒 {fmt(data?.life_gifts_s)}
              </span>
            }
            loading={isLoading}
          />
        </div>
      </section>
    </div>
  )
}

function PoolCard({
  title,
  total,
  scanned,
  spent,
  unscanned,
  loading,
}: {
  title: string
  total: number | undefined
  scanned: number | undefined
  spent: number | undefined
  unscanned: number | undefined
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <PoolRow label="Yaratilgan" value={total} loading={loading} mono />
        <PoolRow
          label="Skanerlangan (davrda)"
          value={scanned}
          loading={loading}
          tone="emerald"
          mono
        />
        <PoolRow
          label="Sarflangan (sovg'alarga)"
          value={spent}
          loading={loading}
          tone="red"
          mono
        />
        <PoolRow
          label="Hali skanerlanmagan (lifetime)"
          value={unscanned}
          loading={loading}
          mono
        />
      </CardContent>
    </Card>
  )
}

function PoolRow({
  label,
  value,
  loading,
  tone,
  mono,
}: {
  label: string
  value: number | undefined
  loading: boolean
  tone?: "emerald" | "red"
  mono?: boolean
}) {
  const valueClass =
    tone === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "red"
        ? "text-red-600 dark:text-red-400"
        : ""
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          (mono ? "font-mono " : "") + "font-medium " + valueClass
        }
      >
        {loading ? "…" : fmt(value)}
      </span>
    </div>
  )
}

function RedemptionStatusCard({
  title,
  group,
  loading,
}: {
  title: string
  group: GiftRedemptionGroup | undefined
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground mb-2 text-xs">
          Jami: <span className="text-foreground font-medium">{fmt(group?.total_count)}</span>
          {" · "}
          {fmt(group?.total_points)} ball
        </div>
        <div className="grid grid-cols-1 gap-1">
          {REDEMPTION_STATUS_CODES.map((code) => {
            const cell = group?.by_status?.[code]
            if (!cell || (cell.count === 0 && cell.points === 0)) return null
            return (
              <div key={code} className="flex items-center justify-between text-sm">
                <Badge variant="outline" className={REDEMPTION_STATUS_TONE[code]}>
                  {REDEMPTION_STATUS_LABEL[code]}
                </Badge>
                <span className="font-mono">
                  {fmt(cell.count)}{" "}
                  <span className="text-muted-foreground text-xs">
                    ({fmt(cell.points)} ball)
                  </span>
                </span>
              </div>
            )
          })}
          {loading && <div className="text-muted-foreground text-sm">…</div>}
        </div>
      </CardContent>
    </Card>
  )
}
