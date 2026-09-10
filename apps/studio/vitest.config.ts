import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@framekit/generated/templates': fileURLToPath(new URL('./src/generated/framekit/templates.ts', import.meta.url)),
      '@framekit/generated/render-client': fileURLToPath(new URL('./src/generated/framekit/render-client.tsx', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    setupFiles: './vitest.setup.ts'
  }
})
