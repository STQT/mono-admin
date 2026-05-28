"use client"

import { LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrentUser, useLogout } from "@/lib/hooks/use-auth"

export function UserMenu() {
  const router = useRouter()
  const logout = useLogout()
  const { data: user, isLoading } = useCurrentUser()

  if (isLoading) {
    return <Skeleton className="size-9 rounded-full" />
  }
  if (!user) return null

  const initials = (user.first_name?.[0] ?? user.username[0] ?? "?").toUpperCase()

  const onLogout = () => {
    logout()
    router.replace("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="size-9 rounded-full">
            <Avatar className="size-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-medium">{user.first_name || user.username}</span>
          <span className="text-muted-foreground text-xs">{user.email || `@${user.username}`}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <User className="mr-2 size-4" />
          {user.is_superuser ? "Superuser" : "Staff"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 size-4" />
          Chiqish
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
