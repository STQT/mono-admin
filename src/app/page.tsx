import { redirect } from "next/navigation"

export default function Home() {
  // Корень: layout-guard в (admin)/layout.tsx сам уведёт на /login,
  // если токенов нет. Здесь просто переадресуем на основную страницу.
  redirect("/contact-settings")
}
