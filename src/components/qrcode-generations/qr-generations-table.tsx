"use client"

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Loader2,
} from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { QRGenerationCreateDialog } from "@/components/qrcode-generations/qr-generation-create-dialog"
import { QRGenerationStatusBadge } from "@/components/qrcode-generations/qr-generation-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  downloadGenerationExcel,
  type QRCodeGeneration,
} from "@/lib/api/qrcode-generations"
import { useQRGenerations } from "@/lib/hooks/use-qrcode-generations"

export function QRGenerationsTable() {
  const [page, setPage] = React.useState(1)

  const { data, isLoading, isFetching, isError, error } = useQRGenerations({ page })
  const hasInflight = React.useMemo(
    () => (data?.results ?? []).some((g) => g.status === "pending" || g.status === "processing"),
    [data]
  )

  const results = data?.results ?? []
  const count = data?.count ?? 0
  const hasNext = Boolean(data?.next)
  const hasPrev = Boolean(data?.previous)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Promo-kod yaratish</h1>
          <p className="text-muted-foreground text-sm">
            Yaratilgan partiyalar tarixi va ZIP/Excel yuklab olish.{" "}
            {count > 0 && <span>Jami: {count.toLocaleString()}</span>}
          </p>
        </div>
        <QRGenerationCreateDialog />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">#</TableHead>
              <TableHead>Turi</TableHead>
              <TableHead className="text-right">Miqdori</TableHead>
              <TableHead className="text-right">Ballar</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>Yaratgan</TableHead>
              <TableHead>Vaqti</TableHead>
              <TableHead className="w-[200px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(isLoading || (isFetching && results.length === 0)) && <LoadingRows />}
            {isError && (
              <TableRow>
                <TableCell colSpan={8} className="text-destructive text-center">
                  Xatolik: {(error as Error)?.message ?? "noma'lum"}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && results.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground text-center">
                  Hozircha partiyalar yo&apos;q
                </TableCell>
              </TableRow>
            )}
            {results.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono">#{row.id}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {row.code_type === "electrician" ? "Elektrik (E-)" : "Sotuvchi (D-)"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {row.quantity.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {row.points.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <QRGenerationStatusBadge status={row.status} />
                    {row.qr_codes_count > 0 && row.qr_codes_count !== row.quantity && (
                      <span className="text-muted-foreground text-xs">
                        {row.qr_codes_count.toLocaleString()} / {row.quantity.toLocaleString()}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {row.created_by_username ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  <div className="flex flex-col">
                    <span>{new Date(row.created_at).toLocaleString()}</span>
                    {row.completed_at && (
                      <span className="text-xs">
                        ✓ {new Date(row.completed_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DownloadActions row={row} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Sahifa {page}
          {hasInflight && (
            <span className="ml-2 inline-flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" />
              Avtomatik yangilash…
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrev || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="size-4" />
            Oldingi
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Keyingi
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function DownloadActions({ row }: { row: QRCodeGeneration }) {
  const [downloading, setDownloading] = React.useState(false)

  if (row.status === "failed") {
    return (
      <span className="text-destructive inline-flex items-center gap-1 text-xs">
        <AlertCircle className="size-3" />
        {row.error_message?.slice(0, 40) || "Xato"}
      </span>
    )
  }

  if (row.status !== "completed") {
    return <span className="text-muted-foreground text-xs">—</span>
  }

  const onExcel = async () => {
    setDownloading(true)
    try {
      const { blobUrl, filename } = await downloadGenerationExcel(row.id)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch (e) {
      const err = e as { message?: string }
      toast.error(err.message ?? "Yuklab bo'lmadi")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {row.zip_file_url && (
        <a
          href={row.zip_file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs"
        >
          <Download className="size-3" />
          ZIP
        </a>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7"
        onClick={onExcel}
        disabled={downloading}
      >
        {downloading ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <FileSpreadsheet className="size-3" />
        )}
        Excel
      </Button>
    </div>
  )
}

function LoadingRows() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <TableRow key={i}>
          {Array.from({ length: 8 }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-16" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
