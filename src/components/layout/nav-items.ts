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
  Sparkle,
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
  /** Заголовок секции — если задан, пункт открывает новую группу в сайдбаре (как в JIP admin). */
  section?: string
  /** Если задано — пункт виден когда у пользователя есть ХОТЯ БЫ ОДИН из перечисленных perm-кодов (superuser получает всё автоматически). */
  requireAnyPerm?: AdminPermission[]
  /** Если true — пункт виден только суперюзеру. Имеет приоритет над requireAnyPerm. */
  superuserOnly?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Bosh sahifa", icon: LayoutDashboard, section: "Boshqaruv" },
  {
    href: "/telegram-users",
    label: "Foydalanuvchilar",
    icon: Users,
    section: "Foydalanuvchilar",
  },
  {
    href: "/broadcasts",
    label: "Xabarlar yuborish",
    icon: Megaphone,
    requireAnyPerm: ["core.send_region_messages"],
  },
  { href: "/gifts", label: "Sovg'alar", icon: Gift, section: "Sovg'alar" },
  { href: "/gift-redemptions", label: "Sovg'a so'rovlari", icon: ShoppingBag },
  {
    href: "/qrcodes",
    label: "Promo-kodlar",
    icon: QrCode,
    section: "Promo-kodlar",
    requireAnyPerm: ["core.view_qrcode_detail"],
  },
  {
    href: "/qrcode-generations",
    label: "Promo-kod yaratish",
    icon: QrCode,
    requireAnyPerm: ["core.generate_qrcodes"],
  },
  { href: "/promotions", label: "Aksiyalar", icon: Sparkles, section: "Kontent" },
  { href: "/live-streams", label: "Jonli efirlar", icon: Radio },
  { href: "/video-instructions", label: "Video ko'rsatmalar", icon: Video },
  { href: "/privacy-policy", label: "Maxfiylik siyosati", icon: FileText },
  { href: "/contact-settings", label: "Admin kontaktlar", icon: Contact, section: "Tizim" },
  { href: "/admin-users", label: "Admin foydalanuvchilar", icon: UserCog, superuserOnly: true },
  { href: "/admin-groups", label: "Guruhlar va huquqlar", icon: Shield, superuserOnly: true },
  { href: "/ai", label: "AI Yordamchi", icon: Sparkle, section: "Sun'iy intellekt", superuserOnly: true },
]
