import nextTs from 'eslint-config-next/typescript'
import standard from '../../tooling/eslint-standard.mjs'
import {
  clientImportBoundary,
  consumerImportBoundary,
  editorImportBoundary,
  foundationImportBoundary,
  serverImportBoundary,
  studioAdapterImportBoundary,
  studioRootAdapterImportBoundary,
  studioImportBoundary,
  toolingAssetAuthorizationImportBoundary,
  toolingImportBoundary
} from '../../tooling/eslint-boundaries.mjs'

export default [
  standard,
  ...nextTs,
  {
    files: [
      'src/index.ts',
      'src/types.ts',
      'src/core/**/*.{ts,tsx}',
      'src/markdown/**/*.{ts,tsx}',
      'src/shared/**/*.{ts,tsx}'
    ],
    rules: { 'no-restricted-imports': foundationImportBoundary }
  },
  {
    files: ['src/editor.ts', 'src/editor/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': editorImportBoundary }
  },
  {
    files: ['src/client/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': clientImportBoundary }
  },
  {
    files: ['src/studio.ts', 'src/studio/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': studioImportBoundary }
  },
  {
    files: ['src/studio/page.tsx', 'src/studio/root.tsx'],
    rules: { 'no-restricted-imports': studioAdapterImportBoundary }
  },
  {
    files: ['src/studio-root.ts'],
    rules: { 'no-restricted-imports': studioRootAdapterImportBoundary }
  },
  {
    files: ['src/server.ts', 'src/server/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': serverImportBoundary }
  },
  {
    files: ['src/tooling/**/*.{ts,tsx}', 'src/dev.ts'],
    rules: { 'no-restricted-imports': toolingImportBoundary }
  },
  {
    files: ['src/tooling/dev/create-dev-server/asset-authorization.ts'],
    rules: { 'no-restricted-imports': toolingAssetAuthorizationImportBoundary }
  },
  {
    files: ['type-tests/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': consumerImportBoundary }
  },
  {
    files: ['src/**/__tests__/**/*.{js,jsx,ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' }
  }
]
