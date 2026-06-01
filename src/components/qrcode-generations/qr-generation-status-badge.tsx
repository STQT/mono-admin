import { Badge } from "@/components/ui/badge"
import {
  QR_GENERATION_STATUS_LABEL,
  type QRGenerationStatus,
} from "@/lib/api/qrcode-generations"
import { cn } from "@/lib/utils"

const STATUS_STYLE: Record<QRGenerationStatus, string> = {
  pending:
    "border-amber-500/40 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
  processing:
    "border-sky-500/40 bg-sky-50 text-sky-800 dark:bg-sky-950/30 dark:text-sky-300",
  completed:
    "border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
  failed:
    "border-red-500/40 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300",
}

const STATUS_ICON: Record<QRGenerationStatus, string> = {
  pending: "⏳",
  processing: "🔄",
  completed: "✅",
  failed: "❌",
}

export function QRGenerationStatusBadge({ status }: { status: QRGenerationStatus }) {
  return (
    <Badge variant="outline" className={cn("gap-1", STATUS_STYLE[status])}>
      <span aria-hidden>{STATUS_ICON[status]}</span>
      <span>{QR_GENERATION_STATUS_LABEL[status]}</span>
    </Badge>
  )
}
