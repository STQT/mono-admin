import { AuthGuard } from "@/components/layout/auth-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { UserMenu } from "@/components/layout/user-menu"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-svh">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <header className="bg-background flex h-14 items-center justify-end gap-3 border-b px-4">
            <UserMenu />
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
