"use client"

import { ExternalLink, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import * as React from "react"

import { ContactSettingsForm } from "@/components/contact-settings/contact-settings-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ContactSetting } from "@/lib/api/contact-settings"
import {
  useContactSettings,
  useDeleteContactSetting,
} from "@/lib/hooks/use-contact-settings"

export function ContactSettingsTable() {
  const { data, isLoading, isError, error } = useContactSettings()
  const deleteMutation = useDeleteContactSetting()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ContactSetting | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin kontaktlar</h1>
          <p className="text-muted-foreground text-sm">
            Telegram Web App da ko&apos;rsatiladigan aloqa kanallari.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="size-4" />
                Qo&apos;shish
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi kontakt</DialogTitle>
              <DialogDescription>Telegram, telefon yoki havola qo&apos;shing.</DialogDescription>
            </DialogHeader>
            <ContactSettingsForm onDone={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Turi</TableHead>
              <TableHead>Qiymati</TableHead>
              <TableHead>Holati</TableHead>
              <TableHead>Yangilangan</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <LoadingRows />}
            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="text-destructive text-center">
                  Xatolik: {(error as Error)?.message ?? "noma'lum"}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground text-center">
                  Hozircha kontaktlar yo&apos;q
                </TableCell>
              </TableRow>
            )}
            {data?.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.contact_type_display}</TableCell>
                <TableCell>
                  <a
                    href={row.contact_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex items-center gap-1 hover:underline"
                  >
                    {row.contact_value}
                    <ExternalLink className="size-3" />
                  </a>
                </TableCell>
                <TableCell>
                  {row.is_active ? (
                    <Badge variant="default">Faol</Badge>
                  ) : (
                    <Badge variant="secondary">Nofaol</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(row.updated_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditing(row)}>
                        <Pencil className="mr-2 size-4" />
                        Tahrirlash
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          if (confirm(`"${row.contact_value}" o'chirilsinmi?`)) {
                            deleteMutation.mutate(row.id)
                          }
                        }}
                      >
                        <Trash2 className="mr-2 size-4" />
                        O&apos;chirish
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kontaktni tahrirlash</DialogTitle>
            <DialogDescription>O&apos;zgartirishlar darhol qo&apos;llaniladi.</DialogDescription>
          </DialogHeader>
          {editing && (
            <ContactSettingsForm initial={editing} onDone={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LoadingRows() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-12 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="size-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}
