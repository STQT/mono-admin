import path from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Чтобы Turbopack не подхватил случайный package-lock.json в $HOME как корень workspace.
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
