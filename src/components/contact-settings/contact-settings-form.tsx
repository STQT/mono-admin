"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { ContactSetting, ContactType } from "@/lib/api/contact-settings"
import {
  useCreateContactSetting,
  useUpdateContactSetting,
} from "@/lib/hooks/use-contact-settings"

const CONTACT_TYPES: { value: ContactType; label: string; hint: string }[] = [
  { value: "telegram", label: "Telegram username", hint: "@belgisiz, masalan: mona_support" },
  { value: "phone", label: "Telefon raqami", hint: "+998 901234567" },
  { value: "link", label: "Havola (URL)", hint: "https://example.com/contact" },
]

const schema = z.object({
  contact_type: z.enum(["telegram", "phone", "link"]),
  contact_value: z.string().min(1, "Qiymat kerak"),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

type Props = {
  initial?: ContactSetting
  onDone: () => void
}

export function ContactSettingsForm({ initial, onDone }: Props) {
  const create = useCreateContactSetting()
  const update = useUpdateContactSetting()
  const isEdit = Boolean(initial)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contact_type: initial?.contact_type ?? "telegram",
      contact_value: initial?.contact_value ?? "",
      is_active: initial?.is_active ?? true,
    },
  })

  const submit = form.handleSubmit((values) => {
    if (isEdit && initial) {
      update.mutate(
        { id: initial.id, input: values },
        { onSuccess: () => onDone() }
      )
    } else {
      create.mutate(values, { onSuccess: () => onDone() })
    }
  })

  const pending = create.isPending || update.isPending
  const watchedType = useWatch({ control: form.control, name: "contact_type" })
  const selectedHint = CONTACT_TYPES.find((t) => t.value === watchedType)?.hint

  return (
    <Form {...form}>
      <form onSubmit={submit} className="space-y-4">
        <FormField
          control={form.control}
          name="contact_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kontakt turi</FormLabel>
              <Select
                items={Object.fromEntries(CONTACT_TYPES.map((t) => [t.value, t.label]))}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTACT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qiymati</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              {selectedHint && <FormDescription>{selectedHint}</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md border p-3">
              <div className="space-y-0.5">
                <FormLabel>Faol</FormLabel>
                <FormDescription>Web App da ko&apos;rsatish</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onDone}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Saqlash" : "Qo'shish"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
