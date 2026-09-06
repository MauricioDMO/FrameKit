import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'vitest'

const styles = await readFile(fileURLToPath(new URL('../src/styles.css', import.meta.url)), 'utf8')

const palette = {
  '--color-fk-forest-100': '#304a3e',
  '--color-fk-forest-200': '#243c31',
  '--color-fk-forest-300': '#173d31',
  '--color-fk-forest-400': '#10271f',
  '--color-fk-mint-100': '#e5f2e9',
  '--color-fk-mint-200': '#c8f7d9',
  '--color-fk-mint-300': '#77c99a',
  '--color-fk-sage-100': '#e6eee9',
  '--color-fk-sage-200': '#b8c8be',
  '--color-fk-sage-300': '#91ae9f',
  '--color-fk-sage-400': '#59665f',
  '--color-fk-ivory-100': '#faf9f5',
  '--color-fk-ivory-200': '#f0eee7',
  '--color-fk-ivory-300': '#d9d7cf',
  '--color-fk-ivory-400': '#cbd5ce'
}

function declarations () {
  return Object.fromEntries([...styles.matchAll(/^\s*(--color-fk-[\w-]+):\s*([^;]+);/gm)].map((match) => [match[1], match[2].trim()]))
}

describe('published stylesheet contract', () => {
  it('publishes only the compact numeric palette', () => {
    assert.deepEqual(declarations(), palette)
    assert.doesNotMatch(styles, /--(?:_fk|fk-(?:app|sidebar|panel|control|text|border|action|focus|preview|button|image|loading|select|toggle|overlay|shadow)-)/)
  })
})
