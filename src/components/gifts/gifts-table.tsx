"use client"

import Image from "next/image"
import { Gift as GiftIcon, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import * as React from "react"

import { GiftForm } from "@/components/gifts/gift-form"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type Gift, USER_TYPE_LABEL } from "@/lib/api/gifts"
import { useDeleteGift, useGifts } from "@/lib/hooks/use-gifts"

export function GiftsTable() {
  const { data, isLoading, isError, error } = useGifts()
  const deleteMutation = useDeleteGift()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Gift | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sovg&apos;alar</h1>
          <p className="text-muted-foreground text-sm">
            Web App da ballarga almashtirilishi mumkin bo&apos;lgan sovg&apos;alar.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="size-4" />
                Qo&apos;shish
              </Button>
            }
          />
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yangi sovg&apos;a</DialogTitle>
              <DialogDescription>Nomi, narxi va rasm majburiy.</DialogDescription>
            </DialogHeader>
            <GiftForm onDone={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rasm</TableHead>
              <TableHead>Nomi</TableHead>
              <TableHead>Foydalanuvchi</TableHead>
              <TableHead className="text-right">Ballar</TableHead>
              <TableHead className="text-right">Tartib</TableHead>
              <TableHead>Holati</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <LoadingRows />}
            {isError && (
              <TableRow>
                <TableCell colSpan={7} className="text-destructive text-center">
                  Xatolik: {(error as Error)?.message ?? "noma'lum"}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground text-center">
                  <GiftIcon className="mx-auto mb-1 size-5" />
                  Hozircha sovg&apos;alar yo&apos;q
                </TableCell>
              </TableRow>
            )}
            {data?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  {row.image ? (
                    <Image
                      src={row.image}
                      alt={row.name_uz_latin}
                      width={48}
                      height={48}
                      className="size-12 rounded object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="bg-muted flex size-12 items-center justify-center rounded">
                      <GiftIcon className="text-muted-foreground size-5" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{row.name_uz_latin}</span>
                    {row.name_ru && (
                      <span className="text-muted-foreground text-xs">{row.name_ru}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {USER_TYPE_LABEL[row.user_type ?? "all"]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {row.points_cost.toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground text-right text-sm">
                  {row.order}
                </TableCell>
                <TableCell>
                  {row.is_active ? (
                    <Badge variant="default">Faol</Badge>
                  ) : (
                    <Badge variant="secondary">Nofaol</Badge>
                  )}
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
                      <DropdownMenuItem onClick={() => setEditing(row)}>
                        <Pencil className="mr-2 size-4" />
                        Tahrirlash
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          if (confirm(`"${row.name_uz_latin}" o'chirilsinmi?`))
                            deleteMutation.mutate(row.id)
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
            <DialogTitle>Sovg&apos;ani tahrirlash</DialogTitle>
            <DialogDescription>Rasm yangilanmasa — eski saqlanadi.</DialogDescription>
          </DialogHeader>
          {editing && <GiftForm initial={editing} onDone={() => setEditing(null)} />}
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
            <Skeleton className="size-12 rounded" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="ml-auto h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="ml-auto h-4 w-8" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="size-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
