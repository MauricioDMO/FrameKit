import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { createProject, main } from './cli'

const temporaryDirectories: string[] = []

async function createTemporaryDirectory(prefix: string): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), prefix))
  temporaryDirectories.push(directory)
  return directory
}

async function createFakePnpm(binDirectory: string, logFile: string): Promise<void> {
  const executable = path.join(binDirectory, 'pnpm')
  await mkdir(binDirectory, { recursive: true })
  await writeFile(
    executable,
    `#!/usr/bin/env node
import { appendFile } from 'node:fs/promises'
await appendFile(${JSON.stringify(logFile)}, JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd() }) + '\\n')
if (process.env.FRAMEKIT_TEST_FAIL === process.argv[2]) process.exit(7)
`,
    'utf8',
  )
  await chmod(executable, 0o755)
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

describe('create-framekit', () => {
  it('requires exactly one directory argument', async () => {
    await expect(main([])).rejects.toThrow('Uso: create-framekit <directorio>')
    await expect(main(['one', 'two'])).rejects.toThrow('Uso: create-framekit <directorio>')
  })

  it('rejects an existing destination without changing it', async () => {
    const root = await createTemporaryDirectory('create-framekit-existing-')
    const destination = path.join(root, 'project')
    await mkdir(destination)
    await writeFile(path.join(destination, 'keep.txt'), 'keep', 'utf8')

    await expect(createProject(destination)).rejects.toThrow('El directorio ya existe')
    await expect(readFile(path.join(destination, 'keep.txt'), 'utf8')).resolves.toBe('keep')
  })

  it('copies the template and runs install before generate', async () => {
    const root = await createTemporaryDirectory('create-framekit-success-')
    const bin = path.join(root, 'bin')
    const log = path.join(root, 'commands.jsonl')
    await createFakePnpm(bin, log)

    const previousPath = process.env.PATH
    process.env.PATH = `${bin}${path.delimiter}${previousPath ?? ''}`
    try {
      const destination = await createProject(path.join(root, 'nested', '..', 'project'))
      const commands = (await readFile(log, 'utf8')).trim().split('\n').map((line) => JSON.parse(line))

      expect(destination).toBe(path.join(root, 'project'))
      expect(commands.map(({ args }) => args)).toEqual([['install'], ['framekit', 'generate']])
      expect(commands.every(({ cwd }) => cwd === destination)).toBe(true)
      await expect(readFile(path.join(destination, '.gitignore'), 'utf8')).resolves.toContain('.framekit')
      await expect(readFile(path.join(destination, 'template', 'missing'), 'utf8')).rejects.toThrow()
    } finally {
      process.env.PATH = previousPath
    }
  })

  it('keeps the project when installation fails', async () => {
    const root = await createTemporaryDirectory('create-framekit-failure-')
    const bin = path.join(root, 'bin')
    const log = path.join(root, 'commands.jsonl')
    await createFakePnpm(bin, log)

    const previousPath = process.env.PATH
    const previousFailure = process.env.FRAMEKIT_TEST_FAIL
    process.env.PATH = `${bin}${path.delimiter}${previousPath ?? ''}`
    process.env.FRAMEKIT_TEST_FAIL = 'install'
    try {
      const destination = path.join(root, 'project')
      await expect(createProject(destination)).rejects.toThrow('Falló el comando: pnpm install')
      await expect(readFile(path.join(destination, 'package.json'), 'utf8')).resolves.toContain('framekit')
    } finally {
      process.env.PATH = previousPath
      process.env.FRAMEKIT_TEST_FAIL = previousFailure
    }
  })

  it('keeps the project when generation fails', async () => {
    const root = await createTemporaryDirectory('create-framekit-generation-failure-')
    const bin = path.join(root, 'bin')
    const log = path.join(root, 'commands.jsonl')
    await createFakePnpm(bin, log)

    const previousPath = process.env.PATH
    const previousFailure = process.env.FRAMEKIT_TEST_FAIL
    process.env.PATH = `${bin}${path.delimiter}${previousPath ?? ''}`
    process.env.FRAMEKIT_TEST_FAIL = 'framekit'
    try {
      const destination = path.join(root, 'project')
      await expect(createProject(destination)).rejects.toThrow('Falló el comando: pnpm framekit generate')
      await expect(readFile(path.join(destination, 'package.json'), 'utf8')).resolves.toContain('framekit')
    } finally {
      process.env.PATH = previousPath
      process.env.FRAMEKIT_TEST_FAIL = previousFailure
    }
  })
})
