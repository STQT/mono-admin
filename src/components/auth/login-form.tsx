"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, LogIn } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useLogin } from "@/lib/hooks/use-auth"

const loginSchema = z.object({
  username: z.string().min(1, "Foydalanuvchi nomi kerak"),
  password: z.string().min(1, "Parol kerak"),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useLogin()

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  })

  const onSubmit = (values: LoginValues) => {
    login.mutate(values, {
      onSuccess: () => {
        toast.success("Xush kelibsiz")
        const next = searchParams.get("next")
        router.replace(next && next.startsWith("/") ? next : "/dashboard")
      },
      onError: (error: unknown) => {
        const err = error as { response?: { data?: { detail?: string } }; message?: string }
        toast.error(err.response?.data?.detail ?? err.message ?? "Tizimga kirib bo'lmadi")
      },
    })
  }

  return (
    <Card className="relative z-10 w-full max-w-sm shadow-lg">
      <CardHeader className="items-center space-y-1 text-center">
        <span className="mx-auto mb-2 grid size-11 place-items-center rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4338ca] text-base font-extrabold tracking-tight text-white">
          M
        </span>
        <CardTitle className="text-xl font-semibold">Mona Admin</CardTitle>
        <CardDescription>Boshqaruv paneliga kiring</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foydalanuvchi</FormLabel>
                  <FormControl>
                    <Input autoComplete="username" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parol</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={login.isPending} size="lg" className="w-full">
              {login.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              Kirish
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
