import { lstat, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = path.resolve(
  process.cwd(),
  process.argv[2] ?? path.relative(process.cwd(), path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')),
)
const distRoot = path.join(packageRoot, 'dist')

async function findJavaScriptFiles(directory: string): Promise<string[]> {
  const files: string[] = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await findJavaScriptFiles(filePath)))
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(filePath)
  }
  return files
}

function isInside(directory: string, target: string): boolean {
  return target === directory || target.startsWith(`${directory}${path.sep}`)
}

async function assertFile(target: string, description: string): Promise<void> {
  if (!isInside(packageRoot, target)) throw new Error(`${description} fuera del paquete: ${target}`)
  try {
    if (!(await lstat(target)).isFile()) throw new Error('no es un archivo')
  } catch {
    throw new Error(`${description} no existe: ${path.relative(packageRoot, target)}`)
  }
}

function collectTargets(value: unknown, description: string, targets: string[]): void {
  if (typeof value === 'string') {
    if (!value.startsWith('./')) throw new Error(`Target inválido en ${description}: ${value}`)
    targets.push(value)
    return
  }
  if (!value || typeof value !== 'object') return
  for (const nestedValue of Object.values(value)) collectTargets(nestedValue, description, targets)
}

const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8')) as {
  bin?: unknown
  exports?: unknown
}
const targets: string[] = []
collectTargets(manifest.exports, 'exports', targets)
collectTargets(manifest.bin, 'bin', targets)

for (const target of new Set(targets)) {
  await assertFile(path.resolve(packageRoot, target), `Target ${target}`)
}

for (const filePath of await findJavaScriptFiles(distRoot)) {
  const source = await readFile(filePath, 'utf8')

  const matches = [
    ...source.matchAll(/\b(?:import|export)\s+(?:[^'"]*?\sfrom\s+)?(['"])(\.\.?\/[^'"]+)\1/g),
    ...source.matchAll(/\bimport\s*\(\s*(['"])(\.\.?\/[^'"]+)\1/g),
  ]
  for (const match of matches) {
    const specifier = match[2]
    const resolved = path.resolve(path.dirname(filePath), specifier)
    await assertFile(resolved, `Import relativo en ${path.relative(distRoot, filePath)}: ${specifier}`)
  }
}
