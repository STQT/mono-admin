"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { NAV_ITEMS } from "@/components/layout/nav-items"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="bg-muted/40 hidden w-60 shrink-0 flex-col border-r p-4 md:flex">
      <Link href="/" className="mb-6 px-2 text-lg font-semibold tracking-tight">
        Mona Admin
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                active && "bg-accent text-accent-foreground font-medium"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
