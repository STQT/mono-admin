import { Badge } from "@/components/ui/badge"
import {
  REDEMPTION_STATUS_LABEL,
  type RedemptionStatus,
} from "@/lib/api/gift-redemptions"
import { cn } from "@/lib/utils"

const STATUS_STYLE: Record<RedemptionStatus, string> = {
  pending: "border-amber-500/40 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
  approved: "border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
  sent: "border-sky-500/40 bg-sky-50 text-sky-800 dark:bg-sky-950/30 dark:text-sky-300",
  completed: "border-emerald-600/50 bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
  rejected: "border-red-500/40 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300",
  not_received: "border-orange-500/40 bg-orange-50 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300",
  cancelled_by_user: "border-pink-500/40 bg-pink-50 text-pink-800 dark:bg-pink-950/30 dark:text-pink-300",
}

const STATUS_ICON: Record<RedemptionStatus, string> = {
  pending: "⏳",
  approved: "🛠️",
  sent: "📦",
  completed: "✔️",
  rejected: "❌",
  not_received: "⚠️",
  cancelled_by_user: "🚫",
}

export function RedemptionStatusBadge({
  status,
  label,
}: {
  status: RedemptionStatus
  label?: string
}) {
  return (
    <Badge variant="outline" className={cn("gap-1", STATUS_STYLE[status])}>
      <span aria-hidden>{STATUS_ICON[status]}</span>
      <span>{label ?? REDEMPTION_STATUS_LABEL[status]}</span>
    </Badge>
  )
}
