#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { access, cp, mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { writeTemplateModule } from './codegen/write-template-module'
import { createDevServer } from './dev/create-dev-server'
import { getServerOptions } from './dev/server-options'
import type { DiscoveredTemplate } from './discovery/types'

const usage = 'Uso: framekit <generate|check|dev|build|start>'
const require = createRequire(import.meta.url)

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function runChild(modulePath: string, args: string[], projectRoot: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [modulePath, ...args], {
      cwd: projectRoot,
      shell: false,
      stdio: 'inherit',
    })

    const forwardSignal = (signal: NodeJS.Signals) => child.kill(signal)
    const onSigint = () => forwardSignal('SIGINT')
    const onSigterm = () => forwardSignal('SIGTERM')
    process.once('SIGINT', onSigint)
    process.once('SIGTERM', onSigterm)

    const cleanup = () => {
      process.off('SIGINT', onSigint)
      process.off('SIGTERM', onSigterm)
    }

    child.once('error', (error) => {
      cleanup()
      reject(error)
    })
    child.once('exit', (code, signal) => {
      cleanup()
      resolve(code ?? (signal === 'SIGINT' ? 130 : 143))
    })
  })
}

async function generate(projectRoot: string): Promise<DiscoveredTemplate[]> {
  const templates = await writeTemplateModule({ projectRoot })
  console.log(`FrameKit: ${templates.length} plantilla(s)`)
  return templates
}

function createCheckSource(templates: readonly DiscoveredTemplate[], checkFile: string): string {
  const imports = templates.map((template, index) => {
    const templateFile = path.join(template.absolutePath, 'template.tsx')
    let specifier = path.relative(path.dirname(checkFile), templateFile).replaceAll(path.sep, '/')
    if (!specifier.startsWith('.')) specifier = `./${specifier}`
    return `import template${index} from ${JSON.stringify(specifier)}`
  })
  const entries = templates.map((template, index) =>
    `  [${JSON.stringify(path.join(template.absolutePath, 'template.tsx'))}, template${index}],`
  )

  return `${imports.join('\n')}
import { resolveTemplateData, validateTemplateData, validateTemplateDefinition } from '@mauriciodmo/framekit'

const templates = [
${entries.join('\n')}
] as const

let failed = false

for (const [templatePath, definition] of templates) {
  const definitionResult = validateTemplateDefinition(definition)

  if (!definitionResult.success) {
    console.error(\`\${templatePath}: \${definitionResult.error}\`)
    failed = true
    continue
  }

  for (const locale of Object.keys(definitionResult.definition.content)) {
    const data = resolveTemplateData(definitionResult.definition, locale, {})
    const errors = validateTemplateData(definitionResult.definition, data)

    for (const [field, error] of Object.entries(errors)) {
      const limit = 'min' in error ? \` (min: \${error.min})\` : 'max' in error ? \` (max: \${error.max})\` : ''
      console.error(\`\${templatePath}: content.\${locale}.\${field}: \${error.code}\${limit}\`)
      failed = true
    }
  }
}

if (failed) process.exitCode = 1
`
}

async function check(projectRoot: string): Promise<number> {
  const templates = await generate(projectRoot)
  const framekitDirectory = path.join(projectRoot, '.framekit')
  await mkdir(framekitDirectory, { recursive: true })
  const temporaryDirectory = await mkdtemp(path.join(framekitDirectory, 'check-'))
  const checkFile = path.join(temporaryDirectory, 'templates.mts')

  try {
    await writeFile(checkFile, createCheckSource(templates, checkFile), 'utf8')
    return await runChild(require.resolve('tsx/cli'), [checkFile], projectRoot)
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true })
  }
}

async function findStandaloneServer(projectRoot: string): Promise<string> {
  const standaloneRoot = path.join(projectRoot, '.framekit', 'next', 'standalone')

  if (!(await exists(standaloneRoot))) {
    throw new Error('No existe una build de producción. Ejecuta framekit build primero.')
  }

  const candidates: string[] = []

  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name === 'node_modules') continue
      const entryPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        await visit(entryPath)
      } else if (
        entry.name === 'server.js' &&
        await exists(path.join(directory, '.framekit', 'next', 'BUILD_ID'))
      ) {
        candidates.push(entryPath)
      }
    }
  }

  await visit(standaloneRoot)

  if (candidates.length !== 1) {
    throw new Error(`No se pudo identificar el servidor standalone en: ${standaloneRoot}`)
  }

  return candidates[0]
}

async function copyStandaloneAssets(projectRoot: string): Promise<void> {
  const serverDirectory = path.dirname(await findStandaloneServer(projectRoot))
  const publicDirectory = path.join(projectRoot, 'public')

  if (await exists(publicDirectory)) {
    await cp(publicDirectory, path.join(serverDirectory, 'public'), { recursive: true })
  }

  await cp(
    path.join(projectRoot, '.framekit', 'next', 'static'),
    path.join(serverDirectory, '.framekit', 'next', 'static'),
    { recursive: true },
  )
}

async function build(projectRoot: string): Promise<number> {
  const checkCode = await check(projectRoot)
  if (checkCode !== 0) return checkCode

  const buildCode = await runChild(require.resolve('next/dist/bin/next'), ['build'], projectRoot)
  if (buildCode !== 0) return buildCode

  await copyStandaloneAssets(projectRoot)
  return 0
}

async function dev(projectRoot: string): Promise<never> {
  const { hostname, port } = getServerOptions(process.env)
  let rejectFailure: (error: Error) => void = () => undefined
  const failure = new Promise<never>((_resolve, reject) => {
    rejectFailure = reject
  })
  let server

  try {
    server = await createDevServer({ projectRoot, hostname, port, onError: rejectFailure })
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }

  let resolveSignal: (signal: NodeJS.Signals) => void = () => undefined
  const signal = new Promise<NodeJS.Signals>((resolve) => {
    resolveSignal = resolve
  })
  const onSigint = () => resolveSignal('SIGINT')
  const onSigterm = () => resolveSignal('SIGTERM')
  process.once('SIGINT', onSigint)
  process.once('SIGTERM', onSigterm)

  let exitCode = 0

  try {
    const receivedSignal = await Promise.race([signal, failure])
    console.log(`Cerrando FrameKit (${receivedSignal})`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    exitCode = 1
  } finally {
    process.off('SIGINT', onSigint)
    process.off('SIGTERM', onSigterm)
    try {
      await server.close()
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error))
      exitCode = 1
    }
  }

  process.exit(exitCode)
}

async function main(): Promise<void> {
  const [command, ...extraArguments] = process.argv.slice(2)
  if (!command || extraArguments.length > 0) throw new Error(usage)

  const projectRoot = process.cwd()

  switch (command) {
    case 'generate':
      await generate(projectRoot)
      return
    case 'check':
      process.exitCode = await check(projectRoot)
      return
    case 'dev':
      await dev(projectRoot)
      return
    case 'build':
      process.exitCode = await build(projectRoot)
      return
    case 'start':
      process.exitCode = await runChild(await findStandaloneServer(projectRoot), [], projectRoot)
      return
    default:
      throw new Error(usage)
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
