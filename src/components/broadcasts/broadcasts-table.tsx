"use client"

import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react"
import * as React from "react"

import { BroadcastForm } from "@/components/broadcasts/broadcast-form"
import { BroadcastSendDialog } from "@/components/broadcasts/broadcast-send-dialog"
import { BroadcastStatusBadge } from "@/components/broadcasts/broadcast-status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  BROADCAST_STATUSES,
  BROADCAST_STATUS_LABEL,
  type BroadcastMessage,
  type BroadcastStatus,
} from "@/lib/api/broadcast-messages"
import {
  useBroadcastMessages,
  useDeleteBroadcastMessage,
} from "@/lib/hooks/use-broadcast-messages"

const STATUS_FILTER_ALL = "_all" as const

export function BroadcastsTable() {
  const [page, setPage] = React.useState(1)
  const [statusFilter, setStatusRaw] = React.useState<
    BroadcastStatus | typeof STATUS_FILTER_ALL
  >(STATUS_FILTER_ALL)
  const [searchInput, setSearchInput] = React.useState("")
  const debouncedSearch = useDebounced(searchInput, 300)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<BroadcastMessage | null>(null)
  const [sending, setSending] = React.useState<BroadcastMessage | null>(null)

  const setStatusFilter = (v: BroadcastStatus | typeof STATUS_FILTER_ALL) => {
    setStatusRaw(v)
    setPage(1)
  }
  const setSearch = (v: string) => {
    setSearchInput(v)
    if (page !== 1) setPage(1)
  }

  const { data, isLoading, isFetching, isError, error } = useBroadcastMessages({
    page,
    status: statusFilter === STATUS_FILTER_ALL ? "" : statusFilter,
    q: debouncedSearch,
  })
  const deleteMutation = useDeleteBroadcastMessage()

  const statusItems = React.useMemo(
    () => ({
      [STATUS_FILTER_ALL]: "Barcha holatlar",
      ...Object.fromEntries(
        BROADCAST_STATUSES.map((s) => [s, BROADCAST_STATUS_LABEL[s]])
      ),
    }),
    []
  )

  const results = data?.results ?? []
  const count = data?.count ?? 0
  const hasNext = Boolean(data?.next)
  const hasPrev = Boolean(data?.previous)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Xabarlar yuborish</h1>
          <p className="text-muted-foreground text-sm">
            Bot orqali ommaviy xabar yuborish.{" "}
            {count > 0 && <span>Jami: {count.toLocaleString()}</span>}
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="size-4" />
                Yangi xabar
              </Button>
            }
          />
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yangi xabar</DialogTitle>
              <DialogDescription>
                Yaratilgandan keyin yuborishdan oldin tahrirlash mumkin.
              </DialogDescription>
            </DialogHeader>
            <BroadcastForm onDone={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Sarlavha yoki matn bo'yicha…"
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
          items={statusItems}
          value={statusFilter}
          onValueChange={(v) =>
            v && setStatusFilter(v as BroadcastStatus | typeof STATUS_FILTER_ALL)
          }
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={STATUS_FILTER_ALL}>Barcha holatlar</SelectItem>
            {BROADCAST_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {BROADCAST_STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sarlavha</TableHead>
              <TableHead>Filterlar</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead className="text-right">Yuborildi / Xato / Jami</TableHead>
              <TableHead>Yaratilgan</TableHead>
              <TableHead>Yakunlangan</TableHead>
              <TableHead className="w-[80px]"></TableHead>
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
                  Hech narsa topilmadi
                </TableCell>
              </TableRow>
            )}
            {results.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{row.title}</span>
                    <span className="text-muted-foreground line-clamp-1 max-w-[280px] text-xs">
                      {row.message_text}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {row.user_type_filter_display ?? "Barchaga"}
                  {row.language_filter_display && (
                    <>
                      <br />
                      {row.language_filter_display}
                    </>
                  )}
                  {row.region_filter_display && (
                    <>
                      <br />
                      {row.region_filter_display}
                    </>
                  )}
                </TableCell>
                <TableCell>
                  <BroadcastStatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  <span className="text-emerald-600">{row.sent_count.toLocaleString()}</span>
                  {" / "}
                  <span className="text-red-500">{row.failed_count.toLocaleString()}</span>
                  {" / "}
                  <span className="text-muted-foreground">{row.total_users.toLocaleString()}</span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(row.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {row.completed_at ? new Date(row.completed_at).toLocaleString() : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {row.status === "pending" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        className="h-7"
                        onClick={() => setSending(row)}
                      >
                        <Send className="size-3" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="size-7">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={row.status !== "pending"}
                          onClick={() => setEditing(row)}
                        >
                          <Pencil className="mr-2 size-4" />
                          Tahrirlash
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          disabled={row.status !== "pending"}
                          onClick={() => {
                            if (confirm(`"${row.title}" o'chirilsinmi?`))
                              deleteMutation.mutate(row.id)
                          }}
                        >
                          <Trash2 className="mr-2 size-4" />
                          O&apos;chirish
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Xabarni tahrirlash</DialogTitle>
            <DialogDescription>
              Faqat &laquo;Tayyor&raquo; statusda bo&apos;lgan xabarlar tahrirlanadi.
            </DialogDescription>
          </DialogHeader>
          {editing && <BroadcastForm initial={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>

      <BroadcastSendDialog broadcast={sending} onClose={() => setSending(null)} />
    </div>
  )
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-44" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="ml-auto h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="size-8 rounded-md" />
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
