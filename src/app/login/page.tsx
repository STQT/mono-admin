import { Suspense } from "react"

import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <main className="bg-muted relative flex min-h-svh items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(79,70,229,0.08),_transparent_55%)]" />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  )
}
