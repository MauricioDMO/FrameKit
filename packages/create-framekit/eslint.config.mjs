import eslintConfigNext from 'eslint-config-next'

export default [
  ...eslintConfigNext,
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
]
