"use client"

import { Calendar, ExternalLink, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import * as React from "react"

import { LiveStreamForm } from "@/components/live-streams/live-stream-form"
import { LiveStreamWinners } from "@/components/live-streams/live-stream-winners"
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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { LiveStream } from "@/lib/api/live-streams"
import { useDeleteLiveStream, useLiveStreams } from "@/lib/hooks/use-live-streams"

export function LiveStreamsTable() {
  const { data, isLoading, isError, error } = useLiveStreams()
  const deleteMutation = useDeleteLiveStream()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<LiveStream | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Jonli efirlar</h1>
          <p className="text-muted-foreground text-sm">
            Rejalashtirilgan va o&apos;tgan jonli efirlar. G&apos;oliblar — keyingi versiyada
            tahrirlanadi.
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
              <DialogTitle>Yangi jonli efir</DialogTitle>
              <DialogDescription>Efir vaqti va havola majburiy.</DialogDescription>
            </DialogHeader>
            <LiveStreamForm onDone={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sarlavha</TableHead>
              <TableHead>Vaqti</TableHead>
              <TableHead>Holati</TableHead>
              <TableHead>G&apos;oliblar</TableHead>
              <TableHead>Havola</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <LoadingRows />}
            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-destructive text-center">
                  Xatolik: {(error as Error)?.message ?? "noma'lum"}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground text-center">
                  Hozircha yo&apos;q
                </TableCell>
              </TableRow>
            )}
            {data?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{row.title_uz_latin}</span>
                    {row.title_ru && (
                      <span className="text-muted-foreground text-xs">{row.title_ru}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(row.scheduled_at).toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {row.is_active ? (
                      <Badge variant="default">Faol</Badge>
                    ) : (
                      <Badge variant="secondary">Nofaol</Badge>
                    )}
                    {row.is_past ? (
                      <Badge variant="outline" className="text-muted-foreground">
                        O&apos;tgan
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      >
                        Yaqinlashayotgan
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {row.winners.length}
                </TableCell>
                <TableCell>
                  <a
                    href={row.stream_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex max-w-[180px] items-center gap-1 truncate text-sm hover:underline"
                  >
                    <span className="truncate">{row.stream_url}</span>
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
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
                          if (confirm(`"${row.title_uz_latin}" o'chirilsinmi?`))
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
            <DialogTitle>Jonli efirni tahrirlash</DialogTitle>
            <DialogDescription>Banner yangilanmasa — eski rasm saqlanadi.</DialogDescription>
          </DialogHeader>
          {editing && (
            <>
              <LiveStreamForm initial={editing} onDone={() => setEditing(null)} />
              <Separator />
              <div className="space-y-2">
                <h2 className="text-sm font-semibold">G&apos;oliblar</h2>
                <LiveStreamWinners
                  liveStreamId={editing.id}
                  initialWinners={editing.winners}
                />
              </div>
            </>
          )}
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
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-8" />
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
