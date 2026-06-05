"use client"

import { ChevronDown, ChevronRight, Database, Loader2, Table2, X } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { AIToolResult } from "@/lib/api/ai-chat"
import type { UIChatStep } from "@/lib/hooks/use-ai-chat"

const TOOL_LABEL: Record<string, string> = {
  list_tables: "Список таблиц",
  describe_table: "Схема таблицы",
  run_select_query: "SELECT",
}

const TOOL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  list_tables: Database,
  describe_table: Database,
  run_select_query: Table2,
}

type Props = {
  steps: UIChatStep[]
}

/**
 * Лента «что делал ассистент»: пары tool_call → tool_result.
 * Каждый result сворачивается. Для run_select_query показываем
 * SQL и таблицу строк.
 */
export function ToolTrace({ steps }: Props) {
  if (!steps.length) return null

  // Группируем call+result в пары по позиции (call всегда раньше result в стриме).
  const pairs: Array<{
    call: Extract<UIChatStep, { kind: "tool_call" }>
    result?: Extract<UIChatStep, { kind: "tool_result" }>
  }> = []
  for (const step of steps) {
    if (step.kind === "tool_call") {
      pairs.push({ call: step })
    } else if (step.kind === "tool_result") {
      const last = [...pairs].reverse().find((p) => p.call.name === step.name && !p.result)
      if (last) last.result = step
      else pairs.push({ call: { kind: "tool_call", name: step.name, args: {} }, result: step })
    }
  }

  return (
    <div className="mt-2 space-y-1.5">
      {pairs.map((pair, idx) => (
        <ToolStep key={idx} pair={pair} />
      ))}
    </div>
  )
}

function ToolStep({
  pair,
}: {
  pair: {
    call: Extract<UIChatStep, { kind: "tool_call" }>
    result?: Extract<UIChatStep, { kind: "tool_result" }>
  }
}) {
  const [open, setOpen] = React.useState(false)
  const name = pair.call.name
  const Icon = TOOL_ICON[name] ?? Database
  const label = TOOL_LABEL[name] ?? name
  const pending = !pair.result
  const failed = pair.result && !pair.result.ok

  return (
    <Card className="border-muted/60 bg-muted/30 gap-0 overflow-hidden py-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hover:bg-muted/50 flex w-full items-center gap-2 px-3 py-2 text-left text-xs"
      >
        {open ? (
          <ChevronDown className="size-3.5 shrink-0" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0" />
        )}
        <Icon className="text-muted-foreground size-3.5 shrink-0" />
        <span className="font-medium">{label}</span>
        <ToolArgsSummary args={pair.call.args} />
        <span className="ml-auto flex items-center gap-2">
          {pending && <Loader2 className="text-muted-foreground size-3.5 animate-spin" />}
          {failed && (
            <Badge variant="destructive" className="text-[10px]">
              <X className="size-2.5" />
              ошибка
            </Badge>
          )}
          {pair.result?.ok && pair.result.result.row_count !== undefined && (
            <Badge variant="outline" className="text-[10px]">
              {pair.result.result.row_count} стр
            </Badge>
          )}
        </span>
      </button>
      {open && pair.result && (
        <div className="border-muted/60 border-t px-3 py-2 text-xs">
          <ToolResultBody name={name} result={pair.result.result} />
        </div>
      )}
    </Card>
  )
}

function ToolArgsSummary({ args }: { args: Record<string, unknown> }) {
  if (!args || Object.keys(args).length === 0) return null
  if (typeof args.table_name === "string") {
    return <code className="text-muted-foreground truncate">{args.table_name}</code>
  }
  if (typeof args.sql === "string") {
    return (
      <code className="text-muted-foreground max-w-[420px] truncate">
        {args.sql.replace(/\s+/g, " ").slice(0, 80)}
      </code>
    )
  }
  return null
}

function ToolResultBody({ name, result }: { name: string; result: AIToolResult }) {
  if (!result.ok) {
    return <div className="text-destructive">{result.error || "Ошибка"}</div>
  }
  if (name === "run_select_query") {
    return <SqlResult result={result} />
  }
  if (name === "describe_table") {
    return <DescribeResult result={result} />
  }
  if (name === "list_tables") {
    return <TablesResult result={result} />
  }
  return (
    <pre className="bg-background overflow-auto rounded p-2 text-[11px]">
      {JSON.stringify(result, null, 2)}
    </pre>
  )
}

function SqlResult({ result }: { result: AIToolResult }) {
  return (
    <div className="space-y-2">
      {result.sql_executed && (
        <pre className="bg-background overflow-auto rounded p-2 font-mono text-[11px] whitespace-pre-wrap">
          {result.sql_executed}
        </pre>
      )}
      {result.columns && result.rows && result.rows.length > 0 ? (
        <div className="border-muted/60 overflow-auto rounded border">
          <table className="w-full text-[11px]">
            <thead className="bg-muted/40">
              <tr>
                {result.columns.map((c) => (
                  <th key={c} className="px-2 py-1 text-left font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.slice(0, 50).map((row, i) => (
                <tr key={i} className="border-muted/30 border-t">
                  {result.columns!.map((c) => (
                    <td key={c} className={cn("px-2 py-1 align-top", "tabular-nums")}>
                      {formatCell(row[c])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {result.rows.length > 50 && (
            <div className="text-muted-foreground border-muted/30 border-t px-2 py-1">
              … ещё {result.rows.length - 50} строк
            </div>
          )}
        </div>
      ) : (
        <div className="text-muted-foreground">пусто</div>
      )}
      {result.truncated && (
        <Badge variant="outline" className="text-[10px]">
          обрезано до {result.row_limit}
        </Badge>
      )}
    </div>
  )
}

function DescribeResult({ result }: { result: AIToolResult }) {
  const cols = (result as { columns?: Array<Record<string, unknown>> }).columns ?? []
  return (
    <div className="space-y-2">
      <div className="font-medium">{result.table_name}</div>
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-0.5">
        {cols.map((col, i) => (
          <React.Fragment key={i}>
            <span className="font-mono">{String(col.column_name)}</span>
            <span className="text-muted-foreground">{String(col.data_type)}</span>
            <span className="text-muted-foreground">
              {col.is_nullable === "NO" ? "NOT NULL" : ""}
            </span>
          </React.Fragment>
        ))}
      </div>
      {result.foreign_keys && result.foreign_keys.length > 0 && (
        <div>
          <div className="text-muted-foreground mt-2 mb-1">FK:</div>
          {result.foreign_keys.map((fk, i) => (
            <div key={i} className="font-mono">
              {fk.column_name} → {fk.references_table}.{fk.references_column}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TablesResult({ result }: { result: AIToolResult }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
      {result.tables?.map((t) => (
        <div key={t.table_name} className="flex justify-between gap-2">
          <span className="truncate font-mono">{t.table_name}</span>
          <span className="text-muted-foreground tabular-nums">≈ {t.approx_rows}</span>
        </div>
      ))}
    </div>
  )
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return "—"
  if (typeof v === "number") return v.toLocaleString()
  if (typeof v === "boolean") return v ? "да" : "нет"
  if (typeof v === "object") return JSON.stringify(v)
  return String(v)
}
