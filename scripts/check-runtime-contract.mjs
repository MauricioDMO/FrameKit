import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifestPaths = [
  'package.json',
  'packages/framekit/package.json',
  'packages/create-framekit/package.json',
  'packages/create-framekit/template/package.json',
  'apps/studio/package.json',
]
const documentationPaths = [
  'README.md',
  'README.es.md',
  'packages/framekit/README.md',
  'packages/create-framekit/README.md',
  'packages/create-framekit/template/README.md',
  'Docs/en/getting-started/create-project.md',
  'Docs/es/getting-started/create-project.md',
  'Docs/en/getting-started/existing-project.md',
  'Docs/es/getting-started/existing-project.md',
  'Docs/en/development/release.md',
  'Docs/es/development/release.md',
]

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'))
}

const workspace = await readJson('package.json')
const expectedNode = workspace.engines?.node
const expectedPnpm = workspace.engines?.pnpm
const errors = []

if (workspace.packageManager !== `pnpm@${expectedPnpm?.replace(/^>=\s*/, '')}`) {
  errors.push('package.json: packageManager must match the minimum pnpm engine')
}

for (const relativePath of manifestPaths) {
  const manifest = await readJson(relativePath)
  if (manifest.engines?.node !== expectedNode) {
    errors.push(`${relativePath}: engines.node must be ${expectedNode}`)
  }
  if (manifest.engines?.pnpm !== expectedPnpm) {
    errors.push(`${relativePath}: engines.pnpm must be ${expectedPnpm}`)
  }
}

for (const relativePath of documentationPaths) {
  const source = await readFile(path.join(root, relativePath), 'utf8')
  if (!source.includes(expectedNode.replace(/^>=\s*/, ''))) {
    errors.push(`${relativePath}: missing Node.js ${expectedNode.replace(/^>=\s*/, '')}`)
  }
  if (!source.includes(expectedPnpm.replace(/^>=\s*/, ''))) {
    errors.push(`${relativePath}: missing pnpm ${expectedPnpm.replace(/^>=\s*/, '')}`)
  }
}

const ci = await readFile(path.join(root, '.github/workflows/ci.yml'), 'utf8')
if (!/node:\s*\[22\.13\.0,\s*24\]/.test(ci)) {
  errors.push('.github/workflows/ci.yml: must test Node.js 22 and 24')
}
if (!new RegExp(`version:\\s*${expectedPnpm.replace(/^>=\s*/, '').replaceAll('.', '\\.')}`).test(ci)) {
  errors.push(`.github/workflows/ci.yml: must use pnpm ${expectedPnpm.replace(/^>=\s*/, '')}`)
}

if (errors.length > 0) {
  console.error('Runtime contract check failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(`Runtime contract OK: Node.js ${expectedNode}, pnpm ${expectedPnpm}`)
}
