/**
 * basePath — префикс для деплоя за nginx-сабпатом (например, `/new`).
 *
 * - Next router (useRouter, Link, redirect()) умеет это сам: получает путь
 *   БЕЗ префикса, добавляет при навигации/рендере.
 * - Но прямые window.location.* НЕ знают про basePath. Используй
 *   `withBasePath(path)` ниже когда дёргаешь window.location.assign/href.
 * - И при чтении window.location.pathname для редиректа после логина —
 *   нужно срезать basePath, чтобы потом router.replace не добавил его второй раз.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ""

/** Добавить basePath перед путём для window.location.* */
export function withBasePath(path: string): string {
  if (!BASE_PATH) return path
  if (path.startsWith(BASE_PATH + "/") || path === BASE_PATH) return path
  return BASE_PATH + (path.startsWith("/") ? path : `/${path}`)
}

/** Срезать basePath с начала pathname (если он там есть). */
export function stripBasePath(path: string): string {
  if (!BASE_PATH) return path
  if (path === BASE_PATH) return "/"
  if (path.startsWith(BASE_PATH + "/")) return path.slice(BASE_PATH.length)
  return path
}
