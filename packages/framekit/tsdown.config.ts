import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    editor: 'src/editor.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  unbundle: true,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  sourcemap: false,
  external: ['next', 'react', 'react-dom', 'lucide-react', 'modern-screenshot'],
  outDir: 'dist',
})
