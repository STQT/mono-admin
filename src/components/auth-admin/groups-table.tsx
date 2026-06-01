"use client"

import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import * as React from "react"

import { GroupForm } from "@/components/auth-admin/group-form"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AuthGroup } from "@/lib/api/auth-admin"
import { useAuthGroups, useDeleteAuthGroup } from "@/lib/hooks/use-auth-admin"

export function GroupsTable() {
  const { data, isLoading, isError, error } = useAuthGroups()
  const deleteMutation = useDeleteAuthGroup()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<AuthGroup | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Guruhlar (rollar)</h1>
          <p className="text-muted-foreground text-sm">
            Django auth.Group — admin foydalanuvchilarini birlashtirib, ularga umumiy
            permissionlar berish uchun.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="size-4" />
                Yangi guruh
              </Button>
            }
          />
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yangi guruh</DialogTitle>
              <DialogDescription>
                Nom va permissionlar to&apos;plamini tanlang.
              </DialogDescription>
            </DialogHeader>
            <GroupForm onDone={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomi</TableHead>
              <TableHead className="text-right">Permissions</TableHead>
              <TableHead className="text-right">Foydalanuvchilar</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <LoadingRows />}
            {isError && (
              <TableRow>
                <TableCell colSpan={4} className="text-destructive text-center">
                  Xatolik: {(error as Error)?.message ?? "noma'lum"}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground text-center">
                  Hozircha guruhlar yo&apos;q
                </TableCell>
              </TableRow>
            )}
            {data?.map((g) => (
              <TableRow key={g.id}>
                <TableCell className="font-medium">{g.name}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {g.permissions.length}
                </TableCell>
                <TableCell className="text-muted-foreground text-right text-sm">
                  {g.users_count}
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
                      <DropdownMenuItem onClick={() => setEditing(g)}>
                        <Pencil className="mr-2 size-4" />
                        Tahrirlash
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          if (
                            g.users_count > 0 &&
                            !confirm(
                              `Bu guruhda ${g.users_count} ta foydalanuvchi bor. Davom etilsinmi?`
                            )
                          )
                            return
                          if (confirm(`"${g.name}" o'chirilsinmi?`))
                            deleteMutation.mutate(g.id)
                        }}
                      >
                        <Trash2 className="mr-2 size-4" />
                        O&apos;chirish
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Guruhni tahrirlash</DialogTitle>
            <DialogDescription>
              O&apos;zgartirilgan permissionlar guruhdagi barcha foydalanuvchilarga
              ta&apos;sir qiladi.
            </DialogDescription>
          </DialogHeader>
          {editing && <GroupForm initial={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LoadingRows() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="ml-auto h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="ml-auto h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="size-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
