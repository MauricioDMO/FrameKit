import type { NextConfig } from 'next'
import path from 'node:path'

import { withFrameKit } from '@mauriciodmo/framekit/next'

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: path.resolve(process.cwd(), '../..')
  }
}

export default withFrameKit(nextConfig)
