import type { NextConfig } from "next"
import path from "node:path"

const nextConfig: NextConfig = {
  devIndicators: false,
  distDir: '.framekit/next',
  output: 'standalone',
  turbopack: {
    root: path.resolve(process.cwd(), '../..'),
  },
}

export default nextConfig
