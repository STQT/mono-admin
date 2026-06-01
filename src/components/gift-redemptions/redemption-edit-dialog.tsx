"use client"

import Image from "next/image"
import { Camera, Loader2 } from "lucide-react"
import * as React from "react"

import { RedemptionStatusBadge } from "@/components/gift-redemptions/redemption-status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  REDEMPTION_STATUSES,
  REDEMPTION_STATUS_LABEL,
  type GiftRedemption,
  type RedemptionStatus,
} from "@/lib/api/gift-redemptions"
import { usePermissions } from "@/lib/hooks/use-auth"
import { useUpdateGiftRedemption } from "@/lib/hooks/use-gift-redemptions"

type Props = {
  redemption: GiftRedemption | null
  onClose: () => void
}

export function RedemptionEditDialog({ redemption, onClose }: Props) {
  return (
    <Dialog open={redemption !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>So&apos;rovni qayta ishlash</DialogTitle>
          <DialogDescription>
            Holat va eslatma o&apos;zgartiriladi. Boshqa ma&apos;lumotlar — faqat ko&apos;rish uchun.
          </DialogDescription>
        </DialogHeader>

        {redemption && (
          <RedemptionEditBody key={redemption.id} redemption={redemption} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function RedemptionEditBody({
  redemption,
  onClose,
}: {
  redemption: GiftRedemption
  onClose: () => void
}) {
  const update = useUpdateGiftRedemption()
  const { isSuperUser, has } = usePermissions()
  const [status, setStatus] = React.useState<RedemptionStatus>(redemption.status)
  const [adminNotes, setAdminNotes] = React.useState(redemption.admin_notes ?? "")

  // Какие статусы доступны текущему юзеру — match бэкенду
  // (core/admin_api/views.py:_REDEMPTION_AGENT_STATUSES и _CC_STATUSES).
  const isAgent = has("core.change_status_agent")
  const isCallCenter = has("core.change_status_call_center")
  const availableStatuses: RedemptionStatus[] = React.useMemo(() => {
    if (isSuperUser) return [...REDEMPTION_STATUSES]
    if (isAgent && isCallCenter) {
      return ["pending", "approved", "sent", "completed", "rejected", "cancelled_by_user"]
    }
    if (isAgent) return ["sent", "completed"]
    if (isCallCenter) {
      return ["pending", "approved", "sent", "completed", "rejected", "cancelled_by_user"]
    }
    return [] // basic staff — статус менять нельзя
  }, [isSuperUser, isAgent, isCallCenter])

  const canEditStatus = availableStatuses.length > 0
  // Agent без CC perm — admin_notes только просмотр.
  const canEditNotes = isSuperUser || isCallCenter || !isAgent

  const onSave = () => {
    const patch: { status?: RedemptionStatus; admin_notes?: string } = {}
    if (canEditStatus && status !== redemption.status) patch.status = status
    if (canEditNotes && adminNotes !== (redemption.admin_notes ?? "")) {
      patch.admin_notes = adminNotes
    }
    if (Object.keys(patch).length === 0) {
      onClose()
      return
    }
    update.mutate({ id: redemption.id, patch }, { onSuccess: () => onClose() })
  }

  return (
          <div className="space-y-5">
            <section className="grid gap-3 sm:grid-cols-[80px_1fr]">
              {redemption.gift_image ? (
                <Image
                  src={redemption.gift_image}
                  alt={redemption.gift_name_uz_latin}
                  width={80}
                  height={80}
                  className="size-20 rounded object-cover"
                  unoptimized
                />
              ) : (
                <div className="bg-muted size-20 rounded" />
              )}
              <div className="space-y-1">
                <div className="font-medium">
                  {redemption.gift_name_uz_latin}
                  {redemption.gift_name_ru && (
                    <span className="text-muted-foreground">
                      {" · "}
                      {redemption.gift_name_ru}
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground text-sm">
                  Narxi:{" "}
                  <span className="text-foreground font-medium">
                    {redemption.gift_points_cost.toLocaleString()} ball
                  </span>
                </div>
                <div className="text-muted-foreground text-xs">
                  So&apos;ralgan: {new Date(redemption.requested_at).toLocaleString()}
                </div>
              </div>
            </section>

            <Separator />

            <section className="grid gap-2 text-sm">
              <div className="text-muted-foreground text-xs font-semibold uppercase">
                Foydalanuvchi
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <Field
                  label="Ism"
                  value={
                    [redemption.user_first_name, redemption.user_last_name]
                      .filter(Boolean)
                      .join(" ") || "—"
                  }
                />
                <Field
                  label="Username"
                  value={redemption.user_username ? `@${redemption.user_username}` : "—"}
                />
                <Field label="Telegram ID" value={String(redemption.user_telegram_id)} mono />
                <Field label="Telefon" value={redemption.user_phone_number ?? "—"} mono />
                <Field label="Turi" value={redemption.user_type ?? "—"} />
                <Field
                  label="Region"
                  value={redemption.user_region?.name_uz ?? redemption.user_region?.name_ru ?? "—"}
                />
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <div className="grid gap-1.5">
                <Label htmlFor="status">Holat</Label>
                <Select
                  items={Object.fromEntries(
                    REDEMPTION_STATUSES.map((s) => [s, REDEMPTION_STATUS_LABEL[s]])
                  )}
                  value={status}
                  onValueChange={(v) => v && setStatus(v as RedemptionStatus)}
                  disabled={!canEditStatus}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {REDEMPTION_STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {canEditStatus ? (
                  <p className="text-muted-foreground text-xs">
                    Bekor qilish (rejected / cancelled_by_user / not_received) — ballarni qaytaradi.
                  </p>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    Sizning rolingiz statusni o&apos;zgartirishga ruxsat bermaydi.
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="admin_notes">Eslatma</Label>
                <Textarea
                  id="admin_notes"
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Foydalanuvchiga rad etish sababi va boshqa eslatmalar"
                  disabled={!canEditNotes}
                />
                {!canEditNotes && (
                  <p className="text-muted-foreground text-xs">
                    Sizning rolingiz eslatmalarni o&apos;zgartirishga ruxsat bermaydi.
                  </p>
                )}
              </div>
            </section>

            {redemption.user_confirmed && (
              <>
                <Separator />
                <section className="space-y-2">
                  <div className="text-muted-foreground text-xs font-semibold uppercase">
                    Foydalanuvchi tasdig&apos;i
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <RedemptionStatusBadge status="completed" label="Tasdiqlandi" />
                    {redemption.confirmed_at && (
                      <span className="text-muted-foreground text-xs">
                        {new Date(redemption.confirmed_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {redemption.user_comment && (
                    <p className="bg-muted/40 rounded-md p-2 text-sm">
                      {redemption.user_comment}
                    </p>
                  )}
                  {redemption.confirmation_photo && (
                    <a
                      href={redemption.confirmation_photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <Image
                        src={redemption.confirmation_photo}
                        alt="Qabul qilish fotosurati"
                        width={160}
                        height={160}
                        className="size-40 rounded-md object-cover"
                        unoptimized
                      />
                    </a>
                  )}
                  {!redemption.confirmation_photo && (
                    <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                      <Camera className="size-3" /> Foto biriktirilmagan
                    </p>
                  )}
                </section>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>
                Bekor qilish
              </Button>
              <Button onClick={onSave} disabled={update.isPending}>
                {update.isPending && <Loader2 className="size-4 animate-spin" />}
                Saqlash
              </Button>
            </div>
          </div>
  )
}

function Field({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm"}>{value}</div>
    </div>
  )
}
