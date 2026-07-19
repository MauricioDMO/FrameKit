import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/cli.ts',
  format: ['esm'],
  clean: true,
  outExtensions: () => ({ js: '.js' }),
  sourcemap: false,
  logLevel: 'error',
  outDir: 'dist',
})
