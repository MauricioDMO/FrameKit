import eslintConfigNext from 'eslint-config-next'
import standard from '../../scripts/eslint-standard.mjs'

const nextConfig = eslintConfigNext.map((config) => config.plugins?.import
  ? { ...config, plugins: { ...config.plugins, import: standard.plugins.import } }
  : config)

const eslintConfig = [
  standard,
  ...nextConfig,
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
  }
]

export default eslintConfig
