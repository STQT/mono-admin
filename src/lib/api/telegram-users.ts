import { api } from "./client"

export type TelegramUserLookup = {
  id: number
  telegram_id: number
  username: string | null
  first_name: string
  last_name: string
  full_name: string
  phone_number: string | null
  user_type: string | null
}

export async function lookupTelegramUsers(q: string): Promise<TelegramUserLookup[]> {
  const { data } = await api.get<TelegramUserLookup[]>("/telegram-users/lookup/", {
    params: { q },
  })
  return data
}
