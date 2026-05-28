"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"

import { hasTokens } from "@/lib/api/tokens"
import { useCurrentUser } from "@/lib/hooks/use-auth"

type AuthState = "checking" | "authed" | "unauthed"

function resolveAuthState(): AuthState {
  if (typeof window === "undefined") return "checking"
  return hasTokens() ? "authed" : "unauthed"
}

/**
 * Клиентский guard: если токенов нет — редирект на /login.
 * Если токены есть, но /auth/me/ возвращает ошибку (401, blacklist) —
 * клиент уже сам сбросит токены через response-interceptor и переадресует.
 *
 * Lazy initializer вместо setState-in-effect: один синхронный чек при mount
 * без cascading-рендеров.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authState] = React.useState<AuthState>(resolveAuthState)

  React.useEffect(() => {
    if (authState === "unauthed") {
      const next = encodeURIComponent(window.location.pathname + window.location.search)
      router.replace(`/login?next=${next}`)
    }
  }, [authState, router])

  const { isLoading, isError } = useCurrentUser({ enabled: authState === "authed" })

  if (authState === "checking" || (authState === "authed" && isLoading)) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    )
  }

  if (authState === "unauthed" || isError) {
    return null
  }

  return <>{children}</>
}
