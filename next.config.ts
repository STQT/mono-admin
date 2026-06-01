import path from "node:path"
import type { NextConfig } from "next"

// Sub-path для деплоя за nginx: на проде admin живёт по
// https://aksiya.monoelectric.uz/new/ (старый Django admin продолжает крутиться
// в корне домена параллельно). Переменная читается на этапе билда (NEXT_PUBLIC_*),
// поэтому смена basePath требует пересборки image. Локально не задаём — Next
// тогда сидит в корне http://localhost:3000.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

const nextConfig: NextConfig = {
  // Чтобы Turbopack не подхватил случайный package-lock.json в $HOME как корень workspace.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Standalone output для Docker-деплоя: после `next build` в
  // `.next/standalone/` лежит самодостаточный сервер с минимальной копией
  // node_modules — в финальный image копируем только его.
  output: "standalone",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: {
    // Backend медиа (banners, gifts, etc.) на том же домене, что и фронт
    // в проде, но next/image требует явный allowlist по hostname.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aksiya.monoelectric.uz",
        pathname: "/media/**",
      },
    ],
  },
}

export default nextConfig
