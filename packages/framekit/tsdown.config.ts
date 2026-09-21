import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    editor: 'src/editor.ts',
    client: 'src/client/index.ts',
    next: 'src/next.ts',
    studio: 'src/studio.ts',
    'studio-root': 'src/studio-root.ts',
    dev: 'src/dev.ts',
    server: 'src/server.ts',
    cli: 'src/tooling/cli/index.ts'
  },
  format: ['esm'],
  dts: true,
  clean: true,
  unbundle: true,
  alias: {
    '@': './src'
  },
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  sourcemap: false,
  logLevel: 'error',
  external: ['next', 'react', 'react-dom', '@tabler/icons-react', 'chokidar', 'tsx', 'playwright-core'],
  outDir: 'dist'
})
