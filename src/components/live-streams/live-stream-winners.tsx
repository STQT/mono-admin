"use client"

import { Loader2, Pencil, Plus, Trash2, Trophy } from "lucide-react"
import * as React from "react"

import { WinnerForm } from "@/components/live-streams/winner-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { LiveStreamWinner } from "@/lib/api/live-streams"
import {
  useDeleteLiveStreamWinner,
  useLiveStreamWinners,
} from "@/lib/hooks/use-live-stream-winners"

type Props = {
  liveStreamId: number
  /** Снимок winners из родительского LiveStream — фолбэк до загрузки свежего списка. */
  initialWinners: LiveStreamWinner[]
}

export function LiveStreamWinners({ liveStreamId, initialWinners }: Props) {
  const winnersQuery = useLiveStreamWinners(liveStreamId)
  const deleteMutation = useDeleteLiveStreamWinner(liveStreamId)
  const [adding, setAdding] = React.useState(false)
  const [editing, setEditing] = React.useState<LiveStreamWinner | null>(null)

  const winners = winnersQuery.data ?? initialWinners

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          {winners.length} ta g&apos;olib
          {winnersQuery.isFetching && (
            <Loader2 className="ml-1 inline size-3 animate-spin" />
          )}
        </p>
        {!adding && !editing && (
          <Button type="button" variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" />
            G&apos;olib qo&apos;shish
          </Button>
        )}
      </div>

      {adding && (
        <WinnerForm liveStreamId={liveStreamId} onDone={() => setAdding(false)} />
      )}
      {editing && (
        <WinnerForm
          liveStreamId={liveStreamId}
          initial={editing}
          onDone={() => setEditing(null)}
        />
      )}

      {winners.length === 0 && !adding && !editing ? (
        <div className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
          <Trophy className="mx-auto mb-2 size-5" />
          G&apos;oliblar yo&apos;q
        </div>
      ) : winners.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>G&apos;olib</TableHead>
                <TableHead>Sovg&apos;a</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>
                    <Badge variant="outline">{w.position || "—"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {w.user_full_name || (w.user_username ? `@${w.user_username}` : "—")}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {w.user_username ? `@${w.user_username} · ` : ""}TG {w.user_telegram_id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-col">
                      <span>{w.prize_text_uz_latin || "—"}</span>
                      {w.prize_text_ru && (
                        <span className="text-muted-foreground text-xs">{w.prize_text_ru}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => {
                          setAdding(false)
                          setEditing(w)
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive size-7"
                        onClick={() => {
                          if (confirm("G'olib o'chirilsinmi?")) deleteMutation.mutate(w.id)
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  )
}
