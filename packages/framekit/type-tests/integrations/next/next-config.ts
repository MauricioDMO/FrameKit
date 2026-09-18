import { withFrameKit } from '@mauriciodmo/framekit/next'
import type { NextConfig } from 'next/types'

const config = {
  turbopack: { root: '/workspace' },
  headers: async () => [],
  rewrites: async () => [],
  redirects: async () => [{ source: '/legacy', destination: '/editor', permanent: false }]
} satisfies NextConfig

const result: NextConfig = withFrameKit(config)
const defaultResult: NextConfig = withFrameKit()

export { result, defaultResult }
