"use client"

import { Check, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react"
import * as React from "react"

import { VideoInstructionsForm } from "@/components/video-instructions/video-instructions-form"
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
import {
  VIDEO_SLOTS,
  fileIdValue,
  slotLabel,
  videoUrl,
  type VideoInstruction,
  type VideoSlot,
} from "@/lib/api/video-instructions"
import {
  useDeleteVideoInstruction,
  useVideoInstructions,
} from "@/lib/hooks/use-video-instructions"

export function VideoInstructionsTable() {
  const { data, isLoading, isError, error } = useVideoInstructions()
  const deleteMutation = useDeleteVideoInstruction()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<VideoInstruction | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Video ko&apos;rsatmalar</h1>
          <p className="text-muted-foreground text-sm">
            Bot menyusida ko&apos;rsatiladigan video tushuntirishlar (4 ta: elektrik ×
            tadbirkor × UZ/RU).
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
              <DialogTitle>Yangi video ko&apos;rsatma</DialogTitle>
              <DialogDescription>
                Har slot uchun video va thumbnail yuklang. Hech bo&apos;lmasa bitta to&apos;ldiring.
              </DialogDescription>
            </DialogHeader>
            <VideoInstructionsForm onDone={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Slotlar</TableHead>
              <TableHead>Telegram file_id</TableHead>
              <TableHead>Holati</TableHead>
              <TableHead>Yangilangan</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <LoadingRows />}
            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="text-destructive text-center">
                  Xatolik: {(error as Error)?.message ?? "noma'lum"}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground text-center">
                  Hozircha yo&apos;q
                </TableCell>
              </TableRow>
            )}
            {data?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <SlotMatrix
                    row={row}
                    pick={(rec, slot) => Boolean(videoUrl(rec, slot))}
                  />
                </TableCell>
                <TableCell>
                  <SlotMatrix
                    row={row}
                    pick={(rec, slot) => Boolean(fileIdValue(rec, slot))}
                  />
                </TableCell>
                <TableCell>
                  {row.is_active ? (
                    <Badge variant="default">Faol</Badge>
                  ) : (
                    <Badge variant="secondary">Nofaol</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(row.updated_at).toLocaleString()}
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
                          if (confirm("O'chirilsinmi?")) deleteMutation.mutate(row.id)
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
            <DialogTitle>Video ko&apos;rsatmani tahrirlash</DialogTitle>
            <DialogDescription>
              Yangi fayl tanlamasangiz — eski fayl saqlanadi. Yangi video yuklasangiz, bot keyingi
              jo&apos;natishda Telegram file_id ni qaytadan oladi.
            </DialogDescription>
          </DialogHeader>
          {editing && <VideoInstructionsForm initial={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SlotMatrix({
  row,
  pick,
}: {
  row: VideoInstruction
  pick: (rec: VideoInstruction, slot: VideoSlot) => boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
      {VIDEO_SLOTS.map((slot) => {
        const ok = pick(row, slot)
        return (
          <span key={slot} className="inline-flex items-center gap-1">
            {ok ? (
              <Check className="text-emerald-600 size-3" />
            ) : (
              <X className="text-muted-foreground size-3" />
            )}
            <span className="text-muted-foreground">{slotLabel(slot)}</span>
          </span>
        )
      })}
    </div>
  )
}

function LoadingRows() {
  return (
    <>
      {[0, 1].map((i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-12 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-12 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-12 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="size-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
