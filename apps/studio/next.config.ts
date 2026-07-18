import type { NextConfig } from "next"
import path from "node:path"

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@mauriciodmo/framekit'],
  turbopack: {
    root: path.resolve(process.cwd(), '../..'),
  },
}

export default nextConfig
