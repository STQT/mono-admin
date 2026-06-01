"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react"
import * as React from "react"

import { RedemptionEditDialog } from "@/components/gift-redemptions/redemption-edit-dialog"
import { RedemptionStatusBadge } from "@/components/gift-redemptions/redemption-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  REDEMPTION_STATUSES,
  REDEMPTION_STATUS_LABEL,
  type GiftRedemption,
  type RedemptionStatus,
} from "@/lib/api/gift-redemptions"
import { useGiftRedemptions } from "@/lib/hooks/use-gift-redemptions"

const STATUS_FILTER_ALL = "_all" as const
const USER_TYPE_FILTER_ALL = "_all" as const

export function GiftRedemptionsTable() {
  const [page, setPage] = React.useState(1)
  const [statusFilter, setStatusFilterState] = React.useState<
    RedemptionStatus | typeof STATUS_FILTER_ALL
  >(STATUS_FILTER_ALL)
  const [userTypeFilter, setUserTypeFilterState] = React.useState<
    "electrician" | "seller" | typeof USER_TYPE_FILTER_ALL
  >(USER_TYPE_FILTER_ALL)
  const [searchInput, setSearchInput] = React.useState("")
  const debouncedSearch = useDebounced(searchInput, 300)
  const [editing, setEditing] = React.useState<GiftRedemption | null>(null)

  // Сброс page → 1 происходит вместе с изменением фильтра, в одном callback —
  // вместо setState-в-useEffect (React Compiler ругается на cascading rerenders).
  const setStatusFilter = (v: RedemptionStatus | typeof STATUS_FILTER_ALL) => {
    setStatusFilterState(v)
    setPage(1)
  }
  const setUserTypeFilter = (
    v: "electrician" | "seller" | typeof USER_TYPE_FILTER_ALL
  ) => {
    setUserTypeFilterState(v)
    setPage(1)
  }
  // Поиск дебаунсится — page сбросим при изменении сырого input, чтобы запрос
  // на следующей странице не уехал с устаревшей выборкой.
  const setSearchInputAndReset = (v: string) => {
    setSearchInput(v)
    if (page !== 1) setPage(1)
  }

  const { data, isLoading, isFetching, isError, error } = useGiftRedemptions({
    page,
    status: statusFilter === STATUS_FILTER_ALL ? "" : statusFilter,
    user_type: userTypeFilter === USER_TYPE_FILTER_ALL ? "" : userTypeFilter,
    q: debouncedSearch,
  })

  // items для base-ui Select.Value.
  const statusItems = React.useMemo(
    () => ({
      [STATUS_FILTER_ALL]: "Barcha holatlar",
      ...Object.fromEntries(
        REDEMPTION_STATUSES.map((s) => [s, REDEMPTION_STATUS_LABEL[s]])
      ),
    }),
    []
  )
  const userTypeItems = React.useMemo(
    () => ({
      [USER_TYPE_FILTER_ALL]: "Barcha foydalanuvchilar",
      electrician: "Elektrik",
      seller: "Sotuvchi",
    }),
    []
  )

  const results = data?.results ?? []
  const count = data?.count ?? 0
  const hasNext = Boolean(data?.next)
  const hasPrev = Boolean(data?.previous)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sovg&apos;a so&apos;rovlari</h1>
        <p className="text-muted-foreground text-sm">
          Foydalanuvchilar tomonidan yuborilgan sovg&apos;a so&apos;rovlari.{" "}
          {count > 0 && <span>Jami: {count.toLocaleString()}</span>}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Username, ism, telegram_id, telefon, sovg'a nomi…"
            value={searchInput}
            onChange={(e) => setSearchInputAndReset(e.target.value)}
            className="pl-8"
          />
          {searchInput && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
              onClick={() => setSearchInputAndReset("")}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>

        <Select
          items={statusItems}
          value={statusFilter}
          onValueChange={(v) =>
            v && setStatusFilter(v as RedemptionStatus | typeof STATUS_FILTER_ALL)
          }
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={STATUS_FILTER_ALL}>Barcha holatlar</SelectItem>
            {REDEMPTION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {REDEMPTION_STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={userTypeItems}
          value={userTypeFilter}
          onValueChange={(v) =>
            v &&
            setUserTypeFilter(
              v as "electrician" | "seller" | typeof USER_TYPE_FILTER_ALL
            )
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={USER_TYPE_FILTER_ALL}>Barcha foydalanuvchilar</SelectItem>
            <SelectItem value="electrician">Elektrik</SelectItem>
            <SelectItem value="seller">Sotuvchi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sovg&apos;a</TableHead>
              <TableHead>Foydalanuvchi</TableHead>
              <TableHead>Telegram ID</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>Tasdiq</TableHead>
              <TableHead>So&apos;ralgan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isLoading || (isFetching && results.length === 0)) && <LoadingRows />}
            {isError && (
              <TableRow>
                <TableCell colSpan={8} className="text-destructive text-center">
                  Xatolik: {(error as Error)?.message ?? "noma'lum"}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && results.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground text-center">
                  Hech narsa topilmadi
                </TableCell>
              </TableRow>
            )}
            {results.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => setEditing(row)}
                className="cursor-pointer"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {row.gift_image ? (
                      <Image
                        src={row.gift_image}
                        alt={row.gift_name_uz_latin}
                        width={36}
                        height={36}
                        className="size-9 rounded object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="bg-muted size-9 rounded" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{row.gift_name_uz_latin}</span>
                      <span className="text-muted-foreground text-xs">
                        {row.gift_points_cost.toLocaleString()} ball
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {[row.user_first_name, row.user_last_name].filter(Boolean).join(" ") ||
                        (row.user_username ? `@${row.user_username}` : "—")}
                    </span>
                    {row.user_username && (
                      <span className="text-muted-foreground text-xs">@{row.user_username}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sky-600 font-mono text-sm">
                  {row.user_telegram_id}
                </TableCell>
                <TableCell className="text-emerald-600 font-mono text-sm">
                  {row.user_phone_number ?? "—"}
                </TableCell>
                <TableCell className="text-sm">
                  {row.user_region?.name_uz ?? row.user_region?.name_ru ?? "—"}
                </TableCell>
                <TableCell>
                  <RedemptionStatusBadge status={row.status} />
                </TableCell>
                <TableCell>
                  {row.user_confirmed ? (
                    <Badge variant="default">Tasdiqlangan</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      —
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(row.requested_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Sahifa {page} {isFetching && results.length > 0 ? "· yuklanmoqda…" : ""}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrev || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-4" />
            Oldingi
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Keyingi
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <RedemptionEditDialog redemption={editing} onClose={() => setEditing(null)} />
    </div>
  )
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="flex items-center gap-2">
              <Skeleton className="size-9 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(t)
  }, [value, delayMs])
  return debounced
}
