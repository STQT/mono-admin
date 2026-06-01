"use client"

import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"
import * as React from "react"

import { UserForm } from "@/components/auth-admin/user-form"
import { Badge } from "@/components/ui/badge"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AuthUser } from "@/lib/api/auth-admin"
import { useAuthUsers, useDeleteAuthUser } from "@/lib/hooks/use-auth-admin"
import { useCurrentUser } from "@/lib/hooks/use-auth"

export function UsersTable() {
  const [page, setPage] = React.useState(1)
  const [searchInput, setSearchInput] = React.useState("")
  const debouncedSearch = useDebounced(searchInput, 300)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<AuthUser | null>(null)
  const currentUserQuery = useCurrentUser()

  const setSearch = (v: string) => {
    setSearchInput(v)
    if (page !== 1) setPage(1)
  }

  const { data, isLoading, isFetching, isError, error } = useAuthUsers({
    page,
    q: debouncedSearch,
  })
  const deleteMutation = useDeleteAuthUser()

  const results = data?.results ?? []
  const count = data?.count ?? 0
  const hasNext = Boolean(data?.next)
  const hasPrev = Boolean(data?.previous)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin foydalanuvchilar</h1>
          <p className="text-muted-foreground text-sm">
            Django auth.User — admin panelga kirish huquqi.{" "}
            {count > 0 && <span>Jami: {count.toLocaleString()}</span>}
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="size-4" />
                Yangi foydalanuvchi
              </Button>
            }
          />
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Yangi admin foydalanuvchi</DialogTitle>
              <DialogDescription>
                Username, parol va guruh tanlang. Pravalar guruh + qo&apos;shimcha individual
                permissionlar yig&apos;indisidan iborat.
              </DialogDescription>
            </DialogHeader>
            <UserForm onDone={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
        <Input
          placeholder="Username, email, ism…"
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Ism</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Guruhlar</TableHead>
              <TableHead>Bayroqlar</TableHead>
              <TableHead>Oxirgi kirish</TableHead>
              <TableHead className="w-[60px]"></TableHead>
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
            {results.map((u) => {
              const isSelf = currentUserQuery.data?.id === u.id
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-sm">
                    {u.username}
                    {isSelf && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Siz
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {u.email || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {u.group_names.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {u.group_names.map((g) => (
                          <Badge key={g} variant="outline">
                            {g}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.is_superuser && <Badge>Super</Badge>}
                      {u.is_staff && !u.is_superuser && (
                        <Badge variant="secondary">Staff</Badge>
                      )}
                      {!u.is_active && <Badge variant="destructive">Off</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {u.last_login ? new Date(u.last_login).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditing(u)}>
                          <Pencil className="mr-2 size-4" />
                          Tahrirlash
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          disabled={isSelf || u.is_superuser}
                          onClick={() => {
                            if (confirm(`"${u.username}" o'chirilsinmi?`))
                              deleteMutation.mutate(u.id)
                          }}
                        >
                          <Trash2 className="mr-2 size-4" />
                          O&apos;chirish
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Foydalanuvchini tahrirlash</DialogTitle>
            <DialogDescription>
              Username o&apos;zgartirilmaydi. Parol — alohida tugma orqali.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <UserForm key={editing.id} initial={editing} onDone={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-12" />
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
