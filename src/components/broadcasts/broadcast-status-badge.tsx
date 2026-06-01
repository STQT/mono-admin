import { Badge } from "@/components/ui/badge"
import {
  BROADCAST_STATUS_LABEL,
  type BroadcastStatus,
} from "@/lib/api/broadcast-messages"
import { cn } from "@/lib/utils"

const STATUS_STYLE: Record<BroadcastStatus, string> = {
  pending: "border-amber-500/40 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
  sending: "border-sky-500/40 bg-sky-50 text-sky-800 dark:bg-sky-950/30 dark:text-sky-300",
  completed: "border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
  failed: "border-red-500/40 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300",
}

const STATUS_ICON: Record<BroadcastStatus, string> = {
  pending: "📝",
  sending: "🔄",
  completed: "✅",
  failed: "❌",
}

export function BroadcastStatusBadge({ status }: { status: BroadcastStatus }) {
  return (
    <Badge variant="outline" className={cn("gap-1", STATUS_STYLE[status])}>
      <span aria-hidden>{STATUS_ICON[status]}</span>
      <span>{BROADCAST_STATUS_LABEL[status]}</span>
    </Badge>
  )
}
