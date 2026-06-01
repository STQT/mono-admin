/**
 * Конвертация между TipTap HTML и Telegram-совместимым HTML.
 *
 * Telegram parse_mode='HTML' принимает строго ограниченный набор тегов:
 *   <b>, <strong>, <i>, <em>, <u>, <ins>, <s>, <strike>, <del>,
 *   <a href>, <code>, <pre>, <blockquote>, <tg-spoiler>
 * Всё остальное (включая <p>, <br>, <ul>, <h*>) рендерится как plain text.
 * Поэтому перед сохранением нужно конвертировать TipTap-вывод в эту форму.
 */

/**
 * TipTap HTML → строка для DB (Telegram-готова).
 *
 * - `<p>X</p>` → `X\n\n`
 * - `<br>` → `\n`
 * - `<strong>` → `<b>`, `<em>` → `<i>`
 * - `<pre><code>…</code></pre>` → `<pre>…</pre>`
 * - всё прочее без тегов остаётся как есть
 */
export function tiptapHtmlToTelegram(html: string): string {
  if (!html) return ""

  let s = html
  // <strong>/<em> → <b>/<i> (Telegram примет оба, но канон — короткие теги).
  s = s.replace(/<strong>/gi, "<b>").replace(/<\/strong>/gi, "</b>")
  s = s.replace(/<em>/gi, "<i>").replace(/<\/em>/gi, "</i>")
  // <pre><code>…</code></pre> → <pre>…</pre>
  s = s.replace(/<pre>\s*<code(?:\s[^>]*)?>/gi, "<pre>")
  s = s.replace(/<\/code>\s*<\/pre>/gi, "</pre>")
  // <br> → \n
  s = s.replace(/<br\s*\/?>/gi, "\n")
  // <p>…</p> → …\n\n (включая пустой <p></p> как просто перевод строки)
  s = s.replace(/<p>(\s*)<\/p>/gi, "\n")
  s = s.replace(/<p>/gi, "").replace(/<\/p>/gi, "\n\n")
  // Тримим хвостовые переводы.
  s = s.replace(/\n+$/g, "")
  return s
}

/**
 * Telegram-HTML из DB → HTML для инициализации TipTap.
 * Заворачиваем многострочный текст в <p> блоки.
 */
export function telegramToTiptapHtml(stored: string | null | undefined): string {
  if (!stored) return ""
  // <b>/<i> уже понимаются TipTap StarterKit, оставляем.
  const paragraphs = stored.split(/\n{2,}/).map((p) => p.replace(/\n/g, "<br>"))
  return paragraphs.map((p) => `<p>${p}</p>`).join("")
}
