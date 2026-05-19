import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Next.js 16 Vercel compatibility
  },
}

export default nextConfig
