import { access, cp, mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const skills = path.join(root, 'Docs', 'skills')

const targets = [
  ['internal', path.join(root, '.agents', 'skills')],
  ['public', path.join(root, 'packages', 'create-framekit', 'template', '.agents', 'skills')],
]

async function verifySource(source) {
  const entries = await readdir(source, { withFileTypes: true })
  const directories = entries.filter((entry) => entry.isDirectory())
  if (directories.length === 0) throw new Error(`No skills found in ${source}`)
  await Promise.all(directories.map((entry) => access(path.join(source, entry.name, 'SKILL.md'))))
}

for (const [group, target] of targets) {
  const source = path.join(skills, group)
  await verifySource(source)
  await rm(target, { recursive: true, force: true })
  await mkdir(path.dirname(target), { recursive: true })
  await cp(source, target, { recursive: true })
}
