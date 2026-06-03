import { AuthGuard } from "@/components/layout/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { UserMenu } from "@/components/layout/user-menu"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-svh">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center justify-between gap-2 border-b border-white/5 bg-[#1e293b] px-4 shadow-[0_2px_16px_rgba(0,0,0,0.15)] [&_[data-slot=button]]:text-slate-300 [&_[data-slot=button]:hover]:bg-white/10 [&_[data-slot=button]:hover]:text-white">
            <span className="text-sm font-semibold tracking-wide text-slate-200">
              Mono Electric
            </span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
