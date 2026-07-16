import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingIncludes: {
    '/*': [
      'src/templates/**/_folder.json',
      'src/templates/**/config.ts',
    ],
  },
}

export default nextConfig
