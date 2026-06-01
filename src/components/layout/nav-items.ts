import {
  Contact,
  FileText,
  Gift,
  LayoutDashboard,
  Megaphone,
  QrCode,
  Radio,
  Shield,
  ShoppingBag,
  Sparkles,
  Users,
  UserCog,
  Video,
  type LucideIcon,
} from "lucide-react"

import type { AdminPermission } from "@/lib/api/auth"

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  /** Если задано — пункт виден когда у пользователя есть ХОТЯ БЫ ОДИН из перечисленных perm-кодов (superuser получает всё автоматически). */
  requireAnyPerm?: AdminPermission[]
  /** Если true — пункт виден только суперюзеру. Имеет приоритет над requireAnyPerm. */
  superuserOnly?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Bosh sahifa", icon: LayoutDashboard },
  { href: "/telegram-users", label: "Foydalanuvchilar", icon: Users },
  { href: "/gift-redemptions", label: "Sovg'a so'rovlari", icon: ShoppingBag },
  {
    href: "/broadcasts",
    label: "Xabarlar yuborish",
    icon: Megaphone,
    requireAnyPerm: ["core.send_region_messages"],
  },
  { href: "/gifts", label: "Sovg'alar", icon: Gift },
  { href: "/promotions", label: "Aksiyalar", icon: Sparkles },
  { href: "/live-streams", label: "Jonli efirlar", icon: Radio },
  { href: "/video-instructions", label: "Video ko'rsatmalar", icon: Video },
  {
    href: "/qrcodes",
    label: "Promo-kodlar",
    icon: QrCode,
    requireAnyPerm: ["core.view_qrcode_detail"],
  },
  {
    href: "/qrcode-generations",
    label: "Promo-kod yaratish",
    icon: QrCode,
    requireAnyPerm: ["core.generate_qrcodes"],
  },
  { href: "/privacy-policy", label: "Maxfiylik siyosati", icon: FileText },
  { href: "/contact-settings", label: "Admin kontaktlar", icon: Contact },
  { href: "/admin-users", label: "Admin foydalanuvchilar", icon: UserCog, superuserOnly: true },
  { href: "/admin-groups", label: "Guruhlar va huquqlar", icon: Shield, superuserOnly: true },
]
