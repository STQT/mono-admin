"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"

import { NAV_ITEMS } from "@/components/layout/nav-items"
import { usePermissions } from "@/lib/hooks/use-auth"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()
  const { has, isSuperUser, loaded } = usePermissions()

  // До загрузки /auth/me/ показываем только пункты без ограничений — это
  // безопаснее (а не показать всё, что потом исчезнет). Когда загрузилось —
  // фильтруем по superuser-флагу и правам.
  const items = NAV_ITEMS.filter((item) => {
    if (item.superuserOnly) {
      return loaded && isSuperUser
    }
    if (!item.requireAnyPerm) return true
    if (!loaded) return false
    return has(...item.requireAnyPerm)
  })

  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden w-[248px] shrink-0 flex-col border-r md:flex">
      {/* Brand — лого-квадрат + название/подпись (как в JIP sidebar-brand) */}
      <Link
        href="/"
        className="border-sidebar-border flex min-h-16 items-center gap-2.5 border-b px-4 py-[18px]"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#6366f1] to-[#4338ca] text-[13px] font-extrabold tracking-tight text-white">
          M
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-foreground truncate text-sm font-bold tracking-tight">
            Mona Admin
          </span>
          <span className="text-muted-foreground truncate text-[11px]">Mono Electric</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
        {items.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Fragment key={item.href}>
              {item.section && (
                <p className="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-[0.06em] text-[var(--jip-text-dim)] uppercase">
                  {item.section}
                </p>
              )}
              <Link
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "hover:bg-accent hover:text-foreground"
                )}
              >
                {active && (
                  <span className="bg-sidebar-primary absolute top-1/2 -left-2 h-[18px] w-[3px] -translate-y-1/2 rounded-r" />
                )}
                <Icon className="size-4 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            </Fragment>
          )
        })}
      </nav>
    </aside>
  )
}
