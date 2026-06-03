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
    <Card className="w-full max-w-sm border-white/10 bg-[#1e293b]/95 shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-xl hover:translate-y-0">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] bg-clip-text text-3xl font-extrabold tracking-[0.15em] text-transparent">
          MONA
        </CardTitle>
        <CardDescription className="text-slate-400">
          Boshqaruv paneliga kiring
        </CardDescription>
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
            <Button
              type="submit"
              disabled={login.isPending}
              className="h-11 w-full from-[#2563eb] to-[#06b6d4] text-[15px] font-semibold shadow-[0_8px_24px_rgba(37,99,235,0.4)] hover:from-[#1d4ed8] hover:to-[#0891b2]"
            >
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
