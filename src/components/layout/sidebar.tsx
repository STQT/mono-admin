"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

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
    <aside className="bg-sidebar text-sidebar-foreground hidden w-60 shrink-0 flex-col shadow-[4px_0_24px_rgba(0,0,0,0.18)] md:flex">
      {/* Brand header — градиент blue→cyan, как в JIP brand-link */}
      <Link
        href="/"
        className="flex h-16 items-center justify-center bg-gradient-to-br from-[#1d4ed8] to-[#06b6d4] text-xl font-bold tracking-[0.15em] text-white"
      >
        MONA
      </Link>

      <nav className="flex flex-col gap-0.5 px-2 py-3">
        <p className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-[0.15em] text-slate-500 uppercase">
          Boshqaruv
        </p>
        {items.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-2.5 overflow-hidden rounded-lg px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-200",
                active
                  ? "bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
                  : "text-slate-400 hover:translate-x-1 hover:bg-[#1e293b] hover:text-white"
              )}
            >
              {/* Cyan accent bar слева — виден при active/hover */}
              <span
                className={cn(
                  "absolute top-0 bottom-0 left-0 w-[3px] origin-center rounded-r bg-[#06b6d4] transition-transform duration-200",
                  active ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                )}
              />
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
