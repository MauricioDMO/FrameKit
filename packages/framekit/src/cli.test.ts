// @vitest-environment node

import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterEach, describe, expect, it } from 'vitest'

const cliFile = fileURLToPath(new URL('./cli/index.ts', import.meta.url))
const tsxCli = fileURLToPath(import.meta.resolve('tsx/cli'))
const temporaryRoots: string[] = []

async function createProject(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-cli-'))
  temporaryRoots.push(root)
  await writeFile(path.join(root, 'package.json'), '{"type":"module"}')
  return root
}

async function runCli(root: string, command: string): Promise<{
  code: number | null
  stdout: string
  stderr: string
}> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [tsxCli, cliFile, command], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => { stdout += chunk })
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => { stderr += chunk })
    child.once('error', reject)
    child.once('exit', (code) => resolve({ code, stdout, stderr }))
  })
}

async function addTemplate(root: string, source: string): Promise<void> {
  const directory = path.join(root, 'src', 'templates', 'example')
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, 'template.tsx'), source)
}

async function addFrameKitStub(root: string): Promise<void> {
  const directory = path.join(root, 'node_modules', '@mauriciodmo', 'framekit')
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, 'package.json'), JSON.stringify({
    name: '@mauriciodmo/framekit',
    type: 'module',
    exports: './index.js',
  }))
  await writeFile(path.join(directory, 'index.js'), `
export function validateTemplateDefinition(definition) {
  return definition.width > 0
    ? { success: true, definition }
    : { success: false, error: 'width must be a positive finite integer' }
}
export function resolveTemplateData(definition, locale) {
  return definition.content[locale]
}
export function validateTemplateData() {
  return {}
}
`)
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe('framekit CLI', () => {
  it('prints usage for an unknown command', async () => {
    const result = await runCli(await createProject(), 'unknown')

    expect(result.code).toBe(1)
    expect(result.stderr).toContain('Uso: framekit <generate|check|dev|build|start>')
    expect(result.stderr).not.toContain('at main')
  })

  it('rejects an empty template catalog without writing generated output', async () => {
    const root = await createProject()
    await mkdir(path.join(root, 'src', 'templates'), { recursive: true })

    const result = await runCli(root, 'generate')

    expect(result.code).toBe(1)
    expect(result.stderr).toContain(path.join(root, 'src', 'templates'))
    await expect(readFile(path.join(root, '.framekit', 'generated', 'templates.ts'))).rejects.toThrow()
  })

  it('reports the invalid template path and removes its temporary checker', async () => {
    const root = await createProject()
    await addFrameKitStub(root)
    await addTemplate(root, `export default {
      width: 0,
      height: 100,
      fields: {},
      content: { en: { language: 'English' } },
      render: () => null,
    }`)

    const result = await runCli(root, 'check')

    expect(result.code).toBe(1)
    expect(result.stderr).toContain(path.join(root, 'src', 'templates', 'example', 'template.tsx'))
    expect(result.stderr).toContain('width must be a positive finite integer')
    expect((await readdir(path.join(root, '.framekit'))).filter((entry) => entry.startsWith('check-'))).toEqual([])
  })

  it('does not run Next build when template checking fails', async () => {
    const root = await createProject()
    await addFrameKitStub(root)
    await addTemplate(root, `export default {
      width: 0,
      height: 100,
      fields: {},
      content: { en: { language: 'English' } },
      render: () => null,
    }`)

    const result = await runCli(root, 'build')

    expect(result.code).toBe(1)
    expect(result.stderr).not.toContain('Next.js')
    await expect(readdir(path.join(root, '.framekit', 'next'))).rejects.toThrow()
  })

  it('finds a nested standalone server and returns its exit code', async () => {
    const root = await createProject()
    const serverDirectory = path.join(root, '.framekit', 'next', 'standalone', 'apps', 'example')
    await mkdir(path.join(serverDirectory, '.framekit', 'next'), { recursive: true })
    await writeFile(path.join(serverDirectory, '.framekit', 'next', 'BUILD_ID'), 'test')
    await writeFile(path.join(serverDirectory, 'server.js'), 'process.exit(7)')

    const result = await runCli(root, 'start')

    expect(result.code).toBe(7)
  })
})
