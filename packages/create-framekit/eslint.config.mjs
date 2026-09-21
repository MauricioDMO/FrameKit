import { globalIgnores } from 'eslint/config'
import eslintConfigNext from 'eslint-config-next'
import standard from '../../tooling/eslint-standard.mjs'
import { consumerImportBoundary } from '../../tooling/eslint-boundaries.mjs'

const nextConfig = eslintConfigNext.map((config) => config.plugins?.import
  ? { ...config, plugins: { ...config.plugins, import: standard.plugins.import } }
  : config)

const eslintConfig = [
  standard,
  ...nextConfig,
  globalIgnores(['template/src/generated/framekit/**']),
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-undef': 'off'
    }
  },
  {
    files: ['template/src/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'comma-dangle': 'off',
      'comma-spacing': 'off',
      'key-spacing': 'off',
      'object-curly-spacing': 'off',
      'quote-props': 'off',
      quotes: 'off',
      'space-before-function-paren': 'off'
    }
  },
  {
    files: ['template/src/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': consumerImportBoundary
    }
  },
  {
    files: ['template/src/**/__tests__/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off'
    }
  }
]

export default eslintConfig
