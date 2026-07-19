import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    editor: 'src/editor.ts',
    dev: 'src/dev.ts',
    cli: 'src/cli/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  unbundle: true,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  sourcemap: false,
  logLevel: 'error',
  external: ['next', 'react', 'react-dom', 'lucide-react', 'modern-screenshot', 'chokidar', 'tsx'],
  outDir: 'dist',
})
