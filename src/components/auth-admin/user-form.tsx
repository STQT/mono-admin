"use client"

import { KeyRound, Loader2 } from "lucide-react"
import * as React from "react"

import { PermissionPicker } from "@/components/auth-admin/permission-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import type {
  AuthUser,
  AuthUserCreateInput,
  AuthUserUpdateInput,
} from "@/lib/api/auth-admin"
import {
  useAuthGroups,
  useAuthPermissions,
  useCreateAuthUser,
  useSetAuthUserPassword,
  useUpdateAuthUser,
} from "@/lib/hooks/use-auth-admin"

type Props = {
  initial?: AuthUser
  onDone: () => void
}

export function UserForm({ initial, onDone }: Props) {
  const isEdit = Boolean(initial)
  const create = useCreateAuthUser()
  const update = useUpdateAuthUser()
  const setPassword = useSetAuthUserPassword()
  const permsQuery = useAuthPermissions()
  const groupsQuery = useAuthGroups()

  const [username, setUsername] = React.useState(initial?.username ?? "")
  const [password, setPasswordState] = React.useState("")
  const [email, setEmail] = React.useState(initial?.email ?? "")
  const [firstName, setFirstName] = React.useState(initial?.first_name ?? "")
  const [lastName, setLastName] = React.useState(initial?.last_name ?? "")
  const [isActive, setIsActive] = React.useState(initial?.is_active ?? true)
  const [isStaff, setIsStaff] = React.useState(initial?.is_staff ?? true)
  const [isSuperuser, setIsSuperuser] = React.useState(initial?.is_superuser ?? false)
  const [groups, setGroups] = React.useState<number[]>(initial?.groups ?? [])
  const [userPermissions, setUserPermissions] = React.useState<number[]>(
    initial?.user_permissions ?? []
  )
  const [resetPassword, setResetPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const pending = create.isPending || update.isPending

  const toggleGroup = (id: number) => {
    setGroups((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isEdit) {
      if (!username.trim()) {
        setError("Username kerak")
        return
      }
      if (password.length < 8) {
        setError("Parol kamida 8 ta belgi bo'lishi kerak")
        return
      }
      const input: AuthUserCreateInput = {
        username: username.trim(),
        password,
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        is_active: isActive,
        is_staff: isStaff,
        is_superuser: isSuperuser,
        groups,
        user_permissions: userPermissions,
      }
      create.mutate(input, { onSuccess: () => onDone() })
      return
    }

    if (initial) {
      const input: AuthUserUpdateInput = {
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        is_active: isActive,
        is_staff: isStaff,
        is_superuser: isSuperuser,
        groups,
        user_permissions: userPermissions,
      }
      update.mutate({ id: initial.id, input }, { onSuccess: () => onDone() })
    }
  }

  const onResetPassword = () => {
    if (!initial) return
    if (resetPassword.length < 8) {
      setError("Yangi parol kamida 8 ta belgi bo'lishi kerak")
      return
    }
    setError(null)
    setPassword.mutate(
      { id: initial.id, password: resetPassword },
      { onSuccess: () => setResetPassword("") }
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isEdit}
            autoComplete="off"
          />
          {isEdit && (
            <p className="text-muted-foreground text-xs">
              Username yaratilgandan keyin o&apos;zgartirilmaydi.
            </p>
          )}
        </div>
        {!isEdit && (
          <div className="grid gap-1.5">
            <Label htmlFor="password">Parol *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPasswordState(e.target.value)}
              autoComplete="new-password"
              minLength={8}
            />
            <p className="text-muted-foreground text-xs">Kamida 8 ta belgi.</p>
          </div>
        )}
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="first_name">Ism</Label>
          <Input
            id="first_name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="last_name">Familiya</Label>
          <Input
            id="last_name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </section>

      <Separator />

      <section className="grid gap-3 sm:grid-cols-3">
        <FlagToggle
          id="is_active"
          label="Faol"
          hint="O'chirilgan foydalanuvchi tizimga kira olmaydi"
          value={isActive}
          onChange={setIsActive}
        />
        <FlagToggle
          id="is_staff"
          label="Staff"
          hint="Admin panelga kirish"
          value={isStaff}
          onChange={setIsStaff}
        />
        <FlagToggle
          id="is_superuser"
          label="Superuser"
          hint="Hamma huquqlar"
          value={isSuperuser}
          onChange={setIsSuperuser}
        />
      </section>

      <Separator />

      <section className="space-y-2">
        <Label>Guruhlar</Label>
        {!groupsQuery.data && (
          <p className="text-muted-foreground text-sm">Yuklanmoqda…</p>
        )}
        {groupsQuery.data?.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Guruhlar yo&apos;q. Avval{" "}
            <a href="/admin-groups" className="text-primary hover:underline">
              guruh yarating
            </a>
            .
          </p>
        )}
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {groupsQuery.data?.map((g) => (
            <label
              key={g.id}
              className="hover:bg-accent/40 flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm"
            >
              <input
                type="checkbox"
                className="size-4"
                checked={groups.includes(g.id)}
                onChange={() => toggleGroup(g.id)}
              />
              <span>{g.name}</span>
              <span className="text-muted-foreground text-xs">
                ({g.permissions.length} perm)
              </span>
            </label>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-2">
        <Label>Qo&apos;shimcha permissionlar</Label>
        <p className="text-muted-foreground text-xs">
          Guruh permissionlariga qo&apos;shimcha individual huquqlar.
        </p>
        <PermissionPicker
          permissions={permsQuery.data}
          selected={userPermissions}
          onChange={setUserPermissions}
        />
      </section>

      {isEdit && initial && (
        <>
          <Separator />
          <section className="space-y-2">
            <Label htmlFor="reset_password">Parolni almashtirish</Label>
            <div className="flex gap-2">
              <Input
                id="reset_password"
                type="password"
                placeholder="Yangi parol (≥8 belgi)"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={onResetPassword}
                disabled={setPassword.isPending || resetPassword.length < 8}
              >
                {setPassword.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <KeyRound className="size-4" />
                )}
                O&apos;zgartirish
              </Button>
            </div>
          </section>
        </>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Bekor qilish
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? "Saqlash" : "Yaratish"}
        </Button>
      </div>
    </form>
  )
}

function FlagToggle({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string
  label: string
  hint: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex flex-row items-center justify-between rounded-md border p-3">
      <div className="space-y-0.5">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-muted-foreground text-xs">{hint}</p>
      </div>
      <Switch id={id} checked={value} onCheckedChange={onChange} />
    </div>
  )
}
