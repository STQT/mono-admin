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
          <header className="border-border sticky top-0 z-10 flex min-h-[60px] items-center justify-between gap-4 border-b bg-[var(--jip-topbar)] px-6 backdrop-blur-xl backdrop-saturate-150">
            <span className="text-muted-foreground text-[13px] font-medium">
              Mono Electric Admin
            </span>
            <div className="flex items-center gap-1.5">
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
