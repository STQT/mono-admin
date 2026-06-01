"use client"

import Image from "next/image"
import { ImageOff, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import * as React from "react"

import { PromotionForm } from "@/components/promotions/promotion-form"
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
import type { Promotion } from "@/lib/api/promotions"
import { useDeletePromotion, usePromotions } from "@/lib/hooks/use-promotions"

export function PromotionsTable() {
  const { data, isLoading, isError, error } = usePromotions()
  const deleteMutation = useDeletePromotion()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Promotion | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Aksiyalar</h1>
          <p className="text-muted-foreground text-sm">
            Web App slayderidagi bannerlar va aksiyalar.
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
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Yangi aksiya</DialogTitle>
              <DialogDescription>Rasm majburiy. Sarlavha ixtiyoriy.</DialogDescription>
            </DialogHeader>
            <PromotionForm onDone={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[110px]">Rasm</TableHead>
              <TableHead>Sarlavha</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead className="text-right">Tartib</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>Yaratilgan</TableHead>
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
                  Hozircha yo&apos;q
                </TableCell>
              </TableRow>
            )}
            {data?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  {row.image ? (
                    <Image
                      src={row.image}
                      alt={row.title ?? `Banner #${row.id}`}
                      width={96}
                      height={56}
                      className="h-14 w-24 rounded object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="bg-muted flex h-14 w-24 items-center justify-center rounded">
                      <ImageOff className="text-muted-foreground size-4" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{row.title || "—"}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {row.date ? new Date(row.date).toLocaleDateString() : "—"}
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
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(row.created_at).toLocaleDateString()}
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
                          if (confirm(`"${row.title || `#${row.id}`}" o'chirilsinmi?`))
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Aksiyani tahrirlash</DialogTitle>
            <DialogDescription>Rasm yangilanmasa — eski saqlanadi.</DialogDescription>
          </DialogHeader>
          {editing && <PromotionForm initial={editing} onDone={() => setEditing(null)} />}
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
            <Skeleton className="h-14 w-24 rounded" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="ml-auto h-4 w-8" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="size-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
