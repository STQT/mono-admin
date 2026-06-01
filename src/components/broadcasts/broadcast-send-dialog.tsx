"use client"

import { AlertTriangle, Loader2, Send } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { BroadcastMessage } from "@/lib/api/broadcast-messages"
import {
  useEstimateBroadcast,
  useSendBroadcastMessage,
} from "@/lib/hooks/use-broadcast-messages"

type Props = {
  broadcast: BroadcastMessage | null
  onClose: () => void
}

export function BroadcastSendDialog({ broadcast, onClose }: Props) {
  return (
    <Dialog open={broadcast !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xabarni yuborish</DialogTitle>
          <DialogDescription>
            Yuborish navbatga qo&apos;yiladi va Celery worker tomonidan amalga oshiriladi.
          </DialogDescription>
        </DialogHeader>
        {broadcast && <SendBody key={broadcast.id} broadcast={broadcast} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function SendBody({ broadcast, onClose }: { broadcast: BroadcastMessage; onClose: () => void }) {
  const estimate = useEstimateBroadcast(broadcast.id)
  const send = useSendBroadcastMessage()

  const onConfirm = () => {
    send.mutate(broadcast.id, { onSuccess: () => onClose() })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1 text-sm">
        <div className="font-medium">{broadcast.title}</div>
        <div className="text-muted-foreground">
          Filterlar: {broadcast.user_type_filter_display ?? "Barchaga"}
          {broadcast.language_filter_display ? ` · ${broadcast.language_filter_display}` : ""}
          {broadcast.region_filter_display ? ` · ${broadcast.region_filter_display}` : ""}
        </div>
      </div>

      <div className="rounded-md border p-3">
        <div className="text-muted-foreground text-xs uppercase">Taxminiy qabul qiluvchilar</div>
        {estimate.isLoading ? (
          <div className="mt-1 flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm">Hisoblanmoqda…</span>
          </div>
        ) : estimate.isError ? (
          <div className="text-destructive mt-1 text-sm">
            Hisoblab bo&apos;lmadi: {(estimate.error as Error)?.message}
          </div>
        ) : (
          <div className="mt-1 text-2xl font-semibold">
            {(estimate.data?.estimated_users ?? 0).toLocaleString()}
          </div>
        )}
        {estimate.data?.region_filter && (
          <p className="text-muted-foreground mt-2 text-xs">{estimate.data.note}</p>
        )}
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 flex items-start gap-2 rounded-md border p-3 text-sm text-amber-900 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <span>
          Yuborilgandan keyin xabar tahrir qilinmaydi va o&apos;chirilmaydi. Tekshirib ko&apos;ring.
        </span>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={send.isPending}>
          Bekor qilish
        </Button>
        <Button type="button" onClick={onConfirm} disabled={send.isPending}>
          {send.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Yuborish
        </Button>
      </div>
    </div>
  )
}
