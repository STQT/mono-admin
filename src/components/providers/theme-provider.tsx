"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import * as React from "react"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // По умолчанию light, но даём системе/пользователю выбор через ThemeToggle.
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  )
}
