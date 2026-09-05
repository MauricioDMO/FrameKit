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
const validTemplateSource = `export default {
  meta: { title: 'Valid template' },
  width: 1080,
  height: 1080,
  fields: {},
  content: { en: {} },
  variants: { default: 'en' },
  render: () => null,
}`
const invalidDataTemplateSource = `export default {
  meta: { title: 'Invalid data template' },
  width: 1080,
  height: 1080,
  fields: { title: { kind: 'text', label: 'Title' } },
  content: { en: { title: '' } },
  variants: { default: 'en' },
  render: () => null,
}`

async function createProject(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-cli-'))
  temporaryRoots.push(root)
  await writeFile(path.join(root, 'package.json'), '{"type":"module"}')
  return root
}

async function runCli(root: string, args: readonly string[]): Promise<{
  code: number | null
  stdout: string
  stderr: string
}> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [tsxCli, cliFile, ...args], {
      cwd: root,
      env: { ...process.env, npm_config_user_agent: '' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => { stdout += chunk })
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => { stderr += chunk })
    child.once('error', reject)
    child.once('close', (code) => resolve({ code, stdout, stderr }))
  })
}

async function addTemplate(root: string, source: string): Promise<void> {
  const directory = path.join(root, 'src', 'templates', 'example')
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, 'template.tsx'), source)
}

async function addFrameKitRuntime(root: string): Promise<void> {
  const directory = path.join(root, 'node_modules', '@mauriciodmo', 'framekit')
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, 'package.json'), JSON.stringify({
    name: '@mauriciodmo/framekit',
    type: 'module',
    exports: './index.js',
  }))
  const validationModule = new URL('./core/validation/index.ts', import.meta.url).href
  const resolveTemplateDataModule = new URL('./core/resolve-template-data.ts', import.meta.url).href
  await writeFile(path.join(directory, 'index.js'), [
    `export { validateTemplateDefinition, validateTemplateData } from ${JSON.stringify(validationModule)}`,
    `export { resolveTemplateData } from ${JSON.stringify(resolveTemplateDataModule)}`,
  ].join('\n'))
}

async function addInvalidDataTemplate(root: string): Promise<void> {
  await addFrameKitRuntime(root)
  await addTemplate(root, invalidDataTemplateSource)
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })))
})

describe('framekit CLI', () => {
  it.each([
    ['unknown command', ['unknown']],
    ['missing command', []],
    ['extra arguments', ['generate', 'extra']],
  ] as const)('prints usage for %s', async (_caseName, args) => {
    const result = await runCli(await createProject(), args)

    expect(result.code).toBe(1)
    expect(result.stderr).toContain('Uso: framekit <generate|check|dev|build|start>')
  })

  it('rejects an empty template catalog without writing generated output', async () => {
    const root = await createProject()
    await mkdir(path.join(root, 'src', 'templates'), { recursive: true })

    const result = await runCli(root, ['generate'])

    expect(result.code).toBe(1)
    expect(result.stderr).toContain(path.join(root, 'src', 'templates'))
    await expect(readFile(path.join(root, 'src', 'generated', 'framekit', 'templates.ts'))).rejects.toThrow()
  })

  it('reports the invalid template path and removes its temporary checker', async () => {
    const root = await createProject()
    await addInvalidDataTemplate(root)

    const result = await runCli(root, ['check'])

    expect(result.code).toBe(1)
    expect(result.stderr).toContain(path.join(root, 'src', 'templates', 'example', 'template.tsx'))
    expect(result.stderr).toContain('content.en.title: required')
    expect((await readdir(path.join(root, '.framekit'))).filter((entry) => /^(check|summary)-/.test(entry))).toEqual([])
  })

  it('does not run Next build when template checking fails', async () => {
    const root = await createProject()
    await addInvalidDataTemplate(root)

    const result = await runCli(root, ['build'])

    expect(result.code).toBe(1)
    expect(result.stderr).toContain('content.en.title: required')
    await expect(readdir(path.join(root, '.framekit', 'next'))).rejects.toThrow()
  })

  it('generates a valid template in the source output directory', async () => {
    const root = await createProject()
    await addFrameKitRuntime(root)
    await addTemplate(root, validTemplateSource)

    const result = await runCli(root, ['generate'])

    expect(result.code).toBe(0)
    expect(result.stdout).toContain('FrameKit: 1 template')
    const generated = await readFile(path.join(root, 'src', 'generated', 'framekit', 'templates.ts'), 'utf8')
    expect(generated).toContain('export const templates')
    expect(generated).toContain('slug: "example"')
  })

  it('checks a valid template and removes temporary files', async () => {
    const root = await createProject()
    await addFrameKitRuntime(root)
    await addTemplate(root, validTemplateSource)

    const result = await runCli(root, ['check'])

    expect(result.code).toBe(0)
    expect((await readdir(path.join(root, '.framekit'))).filter((entry) => /^(check|summary)-/.test(entry))).toEqual([])
  })

  it('finds a nested standalone server and returns its exit code', async () => {
    const root = await createProject()
    const serverDirectory = path.join(root, '.framekit', 'next', 'standalone', 'apps', 'example')
    await mkdir(path.join(serverDirectory, '.framekit', 'next'), { recursive: true })
    await writeFile(path.join(serverDirectory, '.framekit', 'next', 'BUILD_ID'), 'test')
    await writeFile(path.join(serverDirectory, 'server.js'), "process.stdout.write('server-ready'); process.exitCode = 7")

    const result = await runCli(root, ['start'])

    expect(result.code).toBe(7)
    expect(result.stdout).toContain('server-ready')
  })
})
