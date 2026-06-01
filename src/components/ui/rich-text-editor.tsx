"use client"

import { Link } from "@tiptap/extension-link"
import { Underline } from "@tiptap/extension-underline"
import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import {
  Bold,
  Braces,
  Code,
  Italic,
  Link as LinkIcon,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
  Unlink,
} from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  value: string // TipTap HTML
  onChange: (html: string) => void
  placeholder?: string
  minRows?: number
}

/**
 * WYSIWYG-редактор на TipTap с тулбаром, ограниченным набором,
 * который поддерживает Telegram Bot API parse_mode='HTML':
 * жирный, курсив, подчёркивание, зачёркнутый, моноширинный код,
 * блок цитаты, ссылки. Списки и заголовки скрыты — Telegram их
 * не рендерит.
 */
export function RichTextEditor({ value, onChange, placeholder, minRows = 8 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Telegram игнорирует — скрываем из тулбара (заодно подавляем
        // markdown-shortcuts), хотя данных это всё равно не порождает.
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        horizontalRule: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content: value,
    immediatelyRender: false, // SSR — иначе hydration mismatch
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[var(--rte-min-h)] w-full rounded-b-md border-t-0 border-input bg-transparent",
          "px-3 py-2 text-sm focus:outline-none",
          "[&_p]:m-0 [&_p+p]:mt-2 [&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground/40",
          "[&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-muted [&_code]:px-1",
          "[&_code]:text-xs [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:text-xs",
          "[&_a]:text-primary [&_a]:underline"
        ),
        style: `--rte-min-h: ${minRows * 1.5}em`,
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  // Sync external value changes (e.g. when initial loads async).
  React.useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) {
    return (
      <div className="rounded-md border">
        <div className="h-9 border-b" />
        <div className="text-muted-foreground p-3 text-sm">Yuklanmoqda…</div>
      </div>
    )
  }

  const isEmpty = editor.isEmpty

  return (
    <div className="rounded-md border">
      <Toolbar editor={editor} />
      <div className="relative">
        <EditorContent editor={editor} />
        {isEmpty && placeholder && (
          <div className="text-muted-foreground pointer-events-none absolute top-2 left-3 text-sm">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
}

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null

  const promptLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Havola URL", previous ?? "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div className="bg-muted/30 flex flex-wrap items-center gap-0.5 rounded-t-md border-b p-1">
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Qalin (Ctrl+B)"
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Kursiv (Ctrl+I)"
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        label="Tagiga chizilgan (Ctrl+U)"
      >
        <UnderlineIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        label="O'chirilgan"
      >
        <Strikethrough className="size-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
        label="Inline code"
      >
        <Code className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        label="Code blok"
      >
        <Braces className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        label="Iqtibos"
      >
        <Quote className="size-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        active={editor.isActive("link")}
        onClick={promptLink}
        label="Havola qo'shish"
      >
        <LinkIcon className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        active={false}
        disabled={!editor.isActive("link")}
        onClick={() => editor.chain().focus().unsetLink().run()}
        label="Havolani olib tashlash"
      >
        <Unlink className="size-4" />
      </ToolbarButton>
    </div>
  )
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon"
      className="size-7"
      disabled={disabled}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      {children}
    </Button>
  )
}

function Divider() {
  return <div className="bg-border mx-1 h-5 w-px" />
}
