"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Sun/Moon-кнопка в шапке. Открывает меню с тремя опциями: Light/Dark/System.
 * Иконка отражает разрешённую тему (resolvedTheme), не выбор пользователя —
 * так понятнее когда выбрана "System".
 */
// useSyncExternalStore-обёртка для "did mount" без setState-in-effect: на
// сервере getServerSnapshot=false, на клиенте после первого commit
// getSnapshot=true. Эквивалент `useEffect(() => setMounted(true), [])`,
// но React Compiler не ругается.
const subscribeNoop = (cb: () => void) => {
  cb()
  return () => {}
}

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const mounted = React.useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  )

  // На SSR resolvedTheme = undefined → пока не смонтировались, показываем Sun;
  // после mount берём фактическую тему. Это убирает hydration mismatch.
  const Icon = mounted && resolvedTheme === "dark" ? Moon : Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="size-9" aria-label="Mavzu">
            <Icon className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            data-active={mounted && theme === "light"}
          >
            <Sun className="mr-2 size-4" />
            Yorug&apos;
            {mounted && theme === "light" && (
              <span className="text-muted-foreground ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            data-active={mounted && theme === "dark"}
          >
            <Moon className="mr-2 size-4" />
            Qorong&apos;u
            {mounted && theme === "dark" && (
              <span className="text-muted-foreground ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            data-active={mounted && theme === "system"}
          >
            <Monitor className="mr-2 size-4" />
            Tizim
            {mounted && theme === "system" && (
              <span className="text-muted-foreground ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
