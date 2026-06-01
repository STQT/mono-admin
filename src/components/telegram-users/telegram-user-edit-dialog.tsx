"use client"

import { Loader2 } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  LANGUAGES,
  LANGUAGE_LABEL,
  USER_TYPES,
  USER_TYPE_LABEL,
  type TelegramUserDetail,
  type TelegramUserPatch,
  type UserLanguage,
  type UserType,
} from "@/lib/api/telegram-users-admin"
import { usePermissions } from "@/lib/hooks/use-auth"
import {
  useTelegramUserAdminDetail,
  usePatchTelegramUserAdmin,
} from "@/lib/hooks/use-telegram-users-admin"
import { useUzRegions } from "@/lib/hooks/use-uz-regions"

const USER_TYPE_ALL = "_none" as const
const LANGUAGE_ALL = "_none" as const

type Props = {
  userId: number | null
  onClose: () => void
}

export function TelegramUserEditDialog({ userId, onClose }: Props) {
  return (
    <Dialog open={userId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Foydalanuvchini tahrirlash</DialogTitle>
          <DialogDescription>
            Telegram ID o&apos;zgartirilmaydi. Ballar va viloyat — admin tomonidan to&apos;g&apos;rilanadi.
          </DialogDescription>
        </DialogHeader>

        {userId !== null && <TelegramUserEditBody key={userId} userId={userId} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function TelegramUserEditBody({ userId, onClose }: { userId: number; onClose: () => void }) {
  const { data: user, isLoading, isError, error } = useTelegramUserAdminDetail(userId)
  const update = usePatchTelegramUserAdmin()

  if (isLoading || !user) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        {isError && (
          <p className="text-destructive text-sm">
            Xatolik: {(error as Error)?.message ?? "noma'lum"}
          </p>
        )}
      </div>
    )
  }

  return <TelegramUserEditForm user={user} pending={update.isPending} onSave={(patch) => {
    update.mutate({ id: user.id, patch }, { onSuccess: () => onClose() })
  }} onCancel={onClose} />
}

type FormState = {
  username: string
  first_name: string
  last_name: string
  phone_number: string
  user_type: UserType | typeof USER_TYPE_ALL
  language: UserLanguage | typeof LANGUAGE_ALL
  points: string
  smartup_id: string
  is_active: boolean
  region_id: string
  district_id: string
}

function TelegramUserEditForm({
  user,
  pending,
  onSave,
  onCancel,
}: {
  user: TelegramUserDetail
  pending: boolean
  onSave: (patch: TelegramUserPatch) => void
  onCancel: () => void
}) {
  const regionsQuery = useUzRegions()
  const { isSuperUser, has } = usePermissions()

  // Call Center: только user_type. Остальные поля должны быть disabled —
  // иначе пользователь заполнит и получит 403 на сабмите. Зеркалит логику
  // backend perform_update (core/admin_api/views.py TelegramUserAdminViewSet).
  const isCallCenterOnly =
    !isSuperUser && has("core.change_user_type_call_center")
  const fieldsLocked = isCallCenterOnly

  const [state, setState] = React.useState<FormState>(() => ({
    username: user.username ?? "",
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    phone_number: user.phone_number ?? "",
    user_type: user.user_type ?? USER_TYPE_ALL,
    language: user.language,
    points: String(user.points ?? 0),
    smartup_id: user.smartup_id !== null ? String(user.smartup_id) : "",
    is_active: user.is_active,
    region_id: user.region !== null ? String(user.region) : "",
    district_id: user.district !== null ? String(user.district) : "",
  }))
  const [error, setError] = React.useState<string | null>(null)

  const setField = <K extends keyof FormState>(key: K, v: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: v }))

  // При смене региона — сбрасываем район, если он не принадлежит новому региону.
  const selectedRegion = React.useMemo(() => {
    if (!regionsQuery.data || !state.region_id) return null
    return regionsQuery.data.find((r) => String(r.id) === state.region_id) ?? null
  }, [regionsQuery.data, state.region_id])

  // base-ui Select.Value показывает сырое значение, если не передать items с
  // лейблами. Строим map { value: label } для каждого селекта ниже.
  const userTypeItems = React.useMemo(
    () => ({
      [USER_TYPE_ALL]: "Aniqlanmagan",
      ...Object.fromEntries(USER_TYPES.map((t) => [t, USER_TYPE_LABEL[t]])),
    }),
    []
  )
  const languageItems = React.useMemo(
    () => Object.fromEntries(LANGUAGES.map((l) => [l, LANGUAGE_LABEL[l]])),
    []
  )
  const regionItems = React.useMemo(() => {
    const m: Record<string, string> = { _none: "Tanlanmagan" }
    regionsQuery.data?.forEach((r) => {
      m[String(r.id)] = r.name_uz
    })
    return m
  }, [regionsQuery.data])
  const districtItems = React.useMemo(() => {
    const m: Record<string, string> = { _none: "Tanlanmagan" }
    selectedRegion?.districts.forEach((d) => {
      m[String(d.id)] = d.name_uz
    })
    return m
  }, [selectedRegion])

  const onRegionChange = (regionId: string) => {
    setState((prev) => {
      const newRegion = regionsQuery.data?.find((r) => String(r.id) === regionId) ?? null
      const districtStillValid =
        prev.district_id && newRegion?.districts.some((d) => String(d.id) === prev.district_id)
      return {
        ...prev,
        region_id: regionId,
        district_id: districtStillValid ? prev.district_id : "",
      }
    })
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const points = Number(state.points)
    if (!Number.isFinite(points) || points < 0) {
      setError("Ballar — manfiy bo'lmagan butun son")
      return
    }
    if (state.smartup_id && Number.isNaN(Number(state.smartup_id))) {
      setError("SmartUP ID — son")
      return
    }

    // Call Center: бэк отбивает 403 на любых полях кроме user_type — поэтому
    // не шлём остальное, даже если значения совпадают (защита от
    // неочевидных type-mismatches между state и instance).
    const patch: TelegramUserPatch = fieldsLocked
      ? {
          user_type: state.user_type === USER_TYPE_ALL ? null : state.user_type,
        }
      : {
          username: state.username || null,
          first_name: state.first_name || null,
          last_name: state.last_name || null,
          phone_number: state.phone_number || null,
          user_type: state.user_type === USER_TYPE_ALL ? null : state.user_type,
          language: state.language === LANGUAGE_ALL ? "uz_latin" : state.language,
          points,
          smartup_id: state.smartup_id ? Number(state.smartup_id) : null,
          is_active: state.is_active,
          region: state.region_id ? Number(state.region_id) : null,
          district: state.district_id ? Number(state.district_id) : null,
        }
    onSave(patch)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {fieldsLocked && (
        <div className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200 rounded-md border p-3 text-sm">
          Call Center rolida faqat <span className="font-semibold">Turi</span> maydonini
          o&apos;zgartira olasiz. Qolgan maydonlar faqat ko&apos;rish uchun.
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <ReadField label="ID" value={String(user.id)} />
        <ReadField label="Telegram ID" value={String(user.telegram_id)} mono />
        <ReadField label="Ro'yxatdan o'tgan" value={new Date(user.created_at).toLocaleString()} />
      </section>

      <Separator />

      <section className="grid gap-3 sm:grid-cols-2">
        <FieldText id="username" label="Username" value={state.username} onChange={(v) => setField("username", v)} placeholder="@belgisiz" disabled={fieldsLocked} />
        <FieldText id="phone_number" label="Telefon" value={state.phone_number} onChange={(v) => setField("phone_number", v)} placeholder="+998..." disabled={fieldsLocked} />
        <FieldText id="first_name" label="Ism" value={state.first_name} onChange={(v) => setField("first_name", v)} disabled={fieldsLocked} />
        <FieldText id="last_name" label="Familiya" value={state.last_name} onChange={(v) => setField("last_name", v)} disabled={fieldsLocked} />
      </section>

      <Separator />

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="user_type">Turi</Label>
          <Select
            items={userTypeItems}
            value={state.user_type}
            onValueChange={(v) =>
              v && setField("user_type", v as UserType | typeof USER_TYPE_ALL)
            }
          >
            <SelectTrigger id="user_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={USER_TYPE_ALL}>Aniqlanmagan</SelectItem>
              {USER_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {USER_TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="language">Til</Label>
          <Select
            items={languageItems}
            value={state.language}
            onValueChange={(v) =>
              v && setField("language", v as UserLanguage | typeof LANGUAGE_ALL)
            }
            disabled={fieldsLocked}
          >
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l} value={l}>
                  {LANGUAGE_LABEL[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FieldText
          id="smartup_id"
          label="SmartUP ID"
          value={state.smartup_id}
          onChange={(v) => setField("smartup_id", v)}
          type="number"
          disabled={fieldsLocked}
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="region">Viloyat</Label>
          <Select
            items={regionItems}
            value={state.region_id || "_none"}
            onValueChange={(v) => onRegionChange(!v || v === "_none" ? "" : v)}
            disabled={fieldsLocked || !regionsQuery.data}
          >
            <SelectTrigger id="region">
              <SelectValue placeholder="Tanlanmagan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">Tanlanmagan</SelectItem>
              {regionsQuery.data?.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.name_uz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="district">Tuman</Label>
          <Select
            items={districtItems}
            value={state.district_id || "_none"}
            onValueChange={(v) => setField("district_id", !v || v === "_none" ? "" : v)}
            disabled={fieldsLocked || !selectedRegion}
          >
            <SelectTrigger id="district">
              <SelectValue placeholder={selectedRegion ? "Tanlanmagan" : "Avval viloyat tanlang"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">Tanlanmagan</SelectItem>
              {selectedRegion?.districts.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name_uz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <Separator />

      <section className="grid gap-3 sm:grid-cols-2">
        <FieldText
          id="points"
          label="Ballar (qo'lda)"
          value={state.points}
          onChange={(v) => setField("points", v)}
          type="number"
          hint={`Hisoblangan: ${user.calculated_points.toLocaleString()}`}
          disabled={fieldsLocked}
        />
        <div className="flex flex-col justify-end">
          <div className="flex flex-row items-center justify-between rounded-md border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Faol</Label>
              <p className="text-muted-foreground text-sm">Botda javob beradi</p>
            </div>
            <Switch
              id="is_active"
              checked={state.is_active}
              onCheckedChange={(v) => setField("is_active", v)}
              disabled={fieldsLocked}
            />
          </div>
        </div>
      </section>

      <Separator />

      <section className="grid gap-3 text-sm sm:grid-cols-4">
        <ReadField
          label="Skanerlangan promokodlar"
          value={user.scanned_qrcodes_count.toLocaleString()}
        />
        <ReadField
          label="Jami olingan ballar"
          value={user.total_earned_points.toLocaleString()}
          hint="Promokodlardan (zakazlarsiz)"
        />
        <ReadField label="Sovg'a so'rovlari" value={String(user.redemptions_count)} />
        <ReadField
          label="Skaner urinishlari"
          value={
            `${user.scan_attempt_count} ` +
            `(✓${user.scan_attempt_success_count} / ✗${user.scan_attempt_unsuccess_count})`
          }
        />
      </section>

      <section className="grid gap-3 text-sm sm:grid-cols-4">
        <ReadField
          label="Maxfiylik"
          value={user.privacy_accepted ? "Qabul qilingan" : "Yo'q"}
        />
        <ReadField
          label="Botni bloklagan"
          value={user.blocked_bot_at ? new Date(user.blocked_bot_at).toLocaleString() : "—"}
        />
        <ReadField
          label="Oxirgi xabar"
          value={user.last_message_sent_at ? new Date(user.last_message_sent_at).toLocaleString() : "—"}
        />
        <CoordsField latitude={user.latitude} longitude={user.longitude} />
      </section>

      {user.username && (
        <section>
          <a
            href={`https://t.me/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm hover:underline"
          >
            Telegram&apos;da ochish: @{user.username} ↗
          </a>
        </section>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Bekor qilish
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Saqlash
        </Button>
      </div>
    </form>
  )
}

function FieldText({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  disabled,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  hint?: string
  disabled?: boolean
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  )
}

function ReadField({
  label,
  value,
  mono,
  hint,
}: {
  label: string
  value: string
  mono?: boolean
  hint?: string
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm"}>{value}</div>
      {hint && <div className="text-muted-foreground text-xs">{hint}</div>}
    </div>
  )
}

function CoordsField({
  latitude,
  longitude,
}: {
  latitude: number | null
  longitude: number | null
}) {
  if (latitude === null || longitude === null) {
    return <ReadField label="Koordinatalar" value="—" />
  }
  const url = `https://yandex.com/maps/?pt=${longitude},${latitude}&z=14&l=map`
  return (
    <div className="space-y-0.5">
      <div className="text-muted-foreground text-xs">Koordinatalar</div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary font-mono text-sm hover:underline"
      >
        {latitude.toFixed(4)}, {longitude.toFixed(4)} ↗
      </a>
    </div>
  )
}
