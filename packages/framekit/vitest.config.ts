import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'node',
    setupFiles: './vitest.setup.ts',
    // Child-process-heavy tests need room for their tsx subprocesses.
    maxWorkers: 4
  },
})
