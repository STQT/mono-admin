"use client"

import { ChevronLeft, ChevronRight, Search, X } from "lucide-react"
import * as React from "react"

import { TelegramUserEditDialog } from "@/components/telegram-users/telegram-user-edit-dialog"
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
  USER_TYPES,
  USER_TYPE_LABEL,
  type UserType,
} from "@/lib/api/telegram-users-admin"
import { useTelegramUsersAdmin } from "@/lib/hooks/use-telegram-users-admin"
import { useUzRegions } from "@/lib/hooks/use-uz-regions"

const FILTER_ALL = "_all" as const

export function TelegramUsersTable() {
  const [page, setPage] = React.useState(1)
  const [userType, setUserTypeRaw] = React.useState<UserType | typeof FILTER_ALL>(FILTER_ALL)
  const [isActive, setIsActiveRaw] = React.useState<"true" | "false" | typeof FILTER_ALL>(
    FILTER_ALL
  )
  const [region, setRegionRaw] = React.useState<string>(FILTER_ALL)
  const [searchInput, setSearchInput] = React.useState("")
  const debouncedSearch = useDebounced(searchInput, 300)
  const [editingId, setEditingId] = React.useState<number | null>(null)

  const setUserType = (v: UserType | typeof FILTER_ALL) => {
    setUserTypeRaw(v)
    setPage(1)
  }
  const setIsActive = (v: "true" | "false" | typeof FILTER_ALL) => {
    setIsActiveRaw(v)
    setPage(1)
  }
  const setRegion = (v: string) => {
    setRegionRaw(v)
    setPage(1)
  }
  const setSearch = (v: string) => {
    setSearchInput(v)
    if (page !== 1) setPage(1)
  }

  const regionsQuery = useUzRegions()

  // items для base-ui Select.Value — иначе показывается сырое значение.
  const userTypeItems = React.useMemo(
    () => ({
      [FILTER_ALL]: "Barcha turlar",
      ...Object.fromEntries(USER_TYPES.map((t) => [t, USER_TYPE_LABEL[t]])),
    }),
    []
  )
  const isActiveItems = React.useMemo(
    () => ({
      [FILTER_ALL]: "Faol va nofaol",
      true: "Faqat faol",
      false: "Faqat nofaol",
    }),
    []
  )
  const regionItems = React.useMemo(() => {
    const m: Record<string, string> = { [FILTER_ALL]: "Barcha viloyatlar" }
    regionsQuery.data?.forEach((r) => {
      m[r.code] = r.name_uz
    })
    return m
  }, [regionsQuery.data])

  const { data, isLoading, isFetching, isError, error } = useTelegramUsersAdmin({
    page,
    user_type: userType === FILTER_ALL ? "" : userType,
    is_active: isActive === FILTER_ALL ? "" : isActive,
    region: region === FILTER_ALL ? "" : region,
    q: debouncedSearch,
  })

  const results = data?.results ?? []
  const count = data?.count ?? 0
  const hasNext = Boolean(data?.next)
  const hasPrev = Boolean(data?.previous)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Foydalanuvchilar</h1>
        <p className="text-muted-foreground text-sm">
          Telegram bot foydalanuvchilari.{" "}
          {count > 0 && <span>Jami: {count.toLocaleString()}</span>}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Username, ism, telegram_id, telefon…"
            value={searchInput}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
          {searchInput && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
              onClick={() => setSearch("")}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>

        <Select
          items={userTypeItems}
          value={userType}
          onValueChange={(v) => v && setUserType(v as UserType | typeof FILTER_ALL)}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_ALL}>Barcha turlar</SelectItem>
            {USER_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {USER_TYPE_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={isActiveItems}
          value={isActive}
          onValueChange={(v) => v && setIsActive(v as "true" | "false" | typeof FILTER_ALL)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_ALL}>Faol va nofaol</SelectItem>
            <SelectItem value="true">Faqat faol</SelectItem>
            <SelectItem value="false">Faqat nofaol</SelectItem>
          </SelectContent>
        </Select>

        <Select items={regionItems} value={region} onValueChange={(v) => v && setRegion(v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_ALL}>Barcha viloyatlar</SelectItem>
            {regionsQuery.data?.map((r) => (
              <SelectItem key={r.code} value={r.code}>
                {r.name_uz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Foydalanuvchi</TableHead>
              <TableHead>Telegram ID</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Turi</TableHead>
              <TableHead>Viloyat / Tuman</TableHead>
              <TableHead className="text-right">Ballar</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>Ro&apos;yxat</TableHead>
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
                className="cursor-pointer"
                onClick={() => setEditingId(row.id)}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {row.full_name || (row.username ? `@${row.username}` : "—")}
                    </span>
                    {row.username && (
                      <span className="text-muted-foreground text-xs">@{row.username}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sky-600 font-mono text-sm">
                  {row.telegram_id}
                </TableCell>
                <TableCell className="text-emerald-600 font-mono text-sm">
                  {row.phone_number ?? "—"}
                </TableCell>
                <TableCell>
                  {row.user_type ? (
                    <Badge variant="outline">{USER_TYPE_LABEL[row.user_type]}</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      —
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  <div className="flex flex-col">
                    <span>{row.region_name ?? "—"}</span>
                    {row.district_name && (
                      <span className="text-muted-foreground text-xs">{row.district_name}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {row.points.toLocaleString()}
                </TableCell>
                <TableCell>
                  {row.is_active ? (
                    <Badge variant="default">Faol</Badge>
                  ) : (
                    <Badge variant="secondary">Nofaol</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(row.created_at).toLocaleDateString()}
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

      <TelegramUserEditDialog userId={editingId} onClose={() => setEditingId(null)} />
    </div>
  )
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="ml-auto h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-14" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
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
