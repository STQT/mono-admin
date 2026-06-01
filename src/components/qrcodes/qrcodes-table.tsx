"use client"

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react"
import * as React from "react"

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
  QR_CODE_TYPES,
  QR_CODE_TYPE_LABEL,
  type QRCodeType,
} from "@/lib/api/qrcodes"
import { useQRCodes } from "@/lib/hooks/use-qrcodes"

const FILTER_ALL = "_all" as const

export function QRCodesTable() {
  const [page, setPage] = React.useState(1)
  const [codeType, setCodeTypeRaw] = React.useState<QRCodeType | typeof FILTER_ALL>(FILTER_ALL)
  const [isScanned, setIsScannedRaw] = React.useState<"true" | "false" | typeof FILTER_ALL>(
    FILTER_ALL
  )
  const [searchInput, setSearchInput] = React.useState("")
  const debouncedSearch = useDebounced(searchInput, 300)

  const setCodeType = (v: QRCodeType | typeof FILTER_ALL) => {
    setCodeTypeRaw(v)
    setPage(1)
  }
  const setIsScanned = (v: "true" | "false" | typeof FILTER_ALL) => {
    setIsScannedRaw(v)
    setPage(1)
  }
  const setSearch = (v: string) => {
    setSearchInput(v)
    if (page !== 1) setPage(1)
  }

  const { data, isLoading, isFetching, isError, error } = useQRCodes({
    page,
    code_type: codeType === FILTER_ALL ? "" : codeType,
    is_scanned: isScanned === FILTER_ALL ? "" : isScanned,
    q: debouncedSearch,
  })

  const codeTypeItems = React.useMemo(
    () => ({
      [FILTER_ALL]: "Barcha turlar",
      ...Object.fromEntries(QR_CODE_TYPES.map((t) => [t, QR_CODE_TYPE_LABEL[t]])),
    }),
    []
  )
  const scannedItems = React.useMemo(
    () => ({
      [FILTER_ALL]: "Barcha holatlar",
      true: "Skanerlangan",
      false: "Skanerlanmagan",
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
        <h1 className="text-2xl font-semibold tracking-tight">Promo-kodlar</h1>
        <p className="text-muted-foreground text-sm">
          Bot foydalanuvchilari skaner qilgan promo-kodlar tarixi.{" "}
          {count > 0 && <span>Jami: {count.toLocaleString()}</span>}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Code, serial, hash, username, telefon, telegram_id…"
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
          items={codeTypeItems}
          value={codeType}
          onValueChange={(v) => v && setCodeType(v as QRCodeType | typeof FILTER_ALL)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_ALL}>Barcha turlar</SelectItem>
            {QR_CODE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {QR_CODE_TYPE_LABEL[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={scannedItems}
          value={isScanned}
          onValueChange={(v) =>
            v && setIsScanned(v as "true" | "false" | typeof FILTER_ALL)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_ALL}>Barcha holatlar</SelectItem>
            <SelectItem value="true">Skanerlangan</SelectItem>
            <SelectItem value="false">Skanerlanmagan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Turi</TableHead>
              <TableHead className="text-right">Ballar</TableHead>
              <TableHead>Yaratilgan</TableHead>
              <TableHead>Skanerlagan</TableHead>
              <TableHead>Skaner vaqti</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isLoading || (isFetching && results.length === 0)) && <LoadingRows />}
            {isError && (
              <TableRow>
                <TableCell colSpan={7} className="text-destructive text-center">
                  Xatolik: {(error as Error)?.message ?? "noma'lum"}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && results.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground text-center">
                  Topilmadi
                </TableCell>
              </TableRow>
            )}
            {results.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-sm">{row.serial_number}</TableCell>
                <TableCell className="font-mono text-sm">{row.code}</TableCell>
                <TableCell>
                  <Badge variant="outline">{QR_CODE_TYPE_LABEL[row.code_type]}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {row.points.toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(row.generated_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  {row.is_scanned && row.scanned_by_telegram_id ? (
                    <div className="flex flex-col text-sm">
                      <span className="font-medium">
                        {row.scanned_by_first_name ||
                          (row.scanned_by_username ? `@${row.scanned_by_username}` : "—")}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        TG {row.scanned_by_telegram_id}
                        {row.scanned_by_phone_number ? ` · ${row.scanned_by_phone_number}` : ""}
                      </span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground gap-1">
                      <X className="size-3" /> Yo&apos;q
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {row.scanned_at ? (
                    <span className="inline-flex items-center gap-1">
                      <Check className="text-emerald-600 size-3" />
                      {new Date(row.scanned_at).toLocaleString()}
                    </span>
                  ) : (
                    "—"
                  )}
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
    </div>
  )
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="ml-auto h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
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
