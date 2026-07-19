import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distRoot = path.join(packageRoot, 'dist')
const files = await readdir(distRoot)

for (const file of files.filter((entry) => entry.endsWith('.js'))) {
  const filePath = path.join(distRoot, file)
  const source = await readFile(filePath, 'utf8')

  for (const match of source.matchAll(/(?:from\s*|import\s*\()(['"])(\.[^'"]+)\1/g)) {
    const specifier = match[2]
    const resolved = path.resolve(path.dirname(filePath), specifier)

    if (!resolved.startsWith(`${distRoot}${path.sep}`)) {
      throw new Error(`Import fuera de dist en ${file}: ${specifier}`)
    }
  }
}
