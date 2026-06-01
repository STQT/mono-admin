"use client"

import { useQuery } from "@tanstack/react-query"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { lookupTelegramUsers, type TelegramUserLookup } from "@/lib/api/telegram-users"

type Props = {
  selected: TelegramUserLookup | null
  onSelect: (user: TelegramUserLookup) => void
  disabled?: boolean
}

export function TelegramUserCombobox({ selected, onSelect, disabled }: Props) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const debouncedQ = useDebounced(search, 250)

  const { data, isFetching } = useQuery({
    queryKey: ["telegram-users", "lookup", debouncedQ],
    queryFn: () => lookupTelegramUsers(debouncedQ),
    enabled: open,
    staleTime: 30_000,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            {selected ? (
              <span className="truncate">
                {selected.full_name || selected.username || `TG ${selected.telegram_id}`}
                <span className="text-muted-foreground ml-2">TG {selected.telegram_id}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">Foydalanuvchini tanlang…</span>
            )}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        }
      />
      <PopoverContent
        className="w-(--anchor-width) min-w-[320px] p-0"
        align="start"
        sideOffset={4}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Username, ism, telegram_id, telefon…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isFetching && (
              <div className="text-muted-foreground flex items-center justify-center gap-2 py-4 text-sm">
                <Loader2 className="size-3 animate-spin" /> Qidirilmoqda…
              </div>
            )}
            {!isFetching && (!data || data.length === 0) && (
              <CommandEmpty>Hech narsa topilmadi</CommandEmpty>
            )}
            {data && data.length > 0 && (
              <CommandGroup>
                {data.map((u) => (
                  <CommandItem
                    key={u.id}
                    value={String(u.id)}
                    onSelect={() => {
                      onSelect(u)
                      setOpen(false)
                    }}
                  >
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium">
                        {u.full_name || u.username || `TG ${u.telegram_id}`}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {u.username ? `@${u.username} · ` : ""}
                        TG {u.telegram_id}
                        {u.phone_number ? ` · ${u.phone_number}` : ""}
                        {u.user_type ? ` · ${u.user_type}` : ""}
                      </span>
                    </div>
                    {selected?.id === u.id && <Check className="size-4 opacity-70" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(t)
  }, [value, delayMs])
  return debounced
}
