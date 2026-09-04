#!/usr/bin/env node

import assert from 'node:assert/strict'
import { access, constants, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer as createNetServer } from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const corePackageRoot = path.join(repoRoot, 'packages', 'framekit')
const creatorPackageRoot = path.join(repoRoot, 'packages', 'create-framekit')
const templateRoot = path.join(creatorPackageRoot, 'template')

function usage() {
  console.log('Usage: node scripts/smoke-tarballs.mjs [--keep-temp]')
  console.log('  --keep-temp  preserve the temporary smoke directory for diagnosis')
}

function parseArgs(args) {
  let keepTemp = false

  for (const arg of args) {
    if (arg === '--keep-temp') {
      keepTemp = true
      continue
    }
    if (arg === '--help' || arg === '-h') {
      usage()
      return null
    }
    throw new Error(`Unknown argument: ${arg}`)
  }

  return { keepTemp }
}

function redact(value, temporaryRoot) {
  return value.replaceAll(repoRoot, '<checkout>').replaceAll(temporaryRoot, '<temp>')
}

async function run(command, args, cwd, temporaryRoot, options = {}) {
  const result = await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...options.env },
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    let settled = false

    child.stdout.on('data', (chunk) => { stdout += chunk })
    child.stderr.on('data', (chunk) => { stderr += chunk })
    child.once('error', (error) => {
      if (settled) return
      settled = true
      reject(error)
    })
    child.once('close', (code, signal) => {
      if (settled) return
      settled = true
      resolve({ code: code ?? (signal ? 1 : 0), signal, stdout, stderr })
    })
  })

  const commandText = `${[command, ...args].join(' ')} (cwd: ${redact(cwd, temporaryRoot)})`
  console.log(`[${result.code === 0 ? 'PASS' : 'FAIL'}] ${commandText}`)

  if (result.code !== 0) {
    const output = redact(`${result.stdout}\n${result.stderr}`.trim(), temporaryRoot)
    throw new Error(`${commandText} exited with code ${result.code}${output ? `\n${output}` : ''}`)
  }

  return result
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

function isInside(directory, target) {
  return target === directory || target.startsWith(`${directory}${path.sep}`)
}

async function walkFiles(directory) {
  return (await readdir(directory, { withFileTypes: true, recursive: true })).flatMap((entry) => {
    if (entry.isDirectory()) return []
    if (!entry.isFile()) throw new Error(`Unexpected non-regular archive entry: ${path.join(entry.parentPath, entry.name)}`)
    return [path.join(entry.parentPath, entry.name)]
  })
}

function collectStrings(value, strings = []) {
  if (typeof value === 'string') {
    strings.push(value)
  } else if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) collectStrings(nested, strings)
  }
  return strings
}

async function validatePackageTargets(packageRoot, manifest, label) {
  for (const target of new Set([...collectStrings(manifest.exports), ...collectStrings(manifest.bin)])) {
    assert(target.startsWith('./'), `${label}: invalid package target ${target}`)
    const targetPath = path.resolve(packageRoot, target)
    assert(isInside(packageRoot, targetPath), `${label}: package target escapes package ${target}`)
    assert((await stat(targetPath).catch(() => null))?.isFile(), `${label}: package target does not exist ${target}`)
  }
}

async function inspectArchive({ label, archive, temporaryRoot, expectedFiles, expectedBin }) {
  const listingResult = await run('tar', ['-tzf', archive], repoRoot, temporaryRoot)
  const entries = listingResult.stdout.split(/\r?\n/).filter(Boolean)

  for (const expectedFile of expectedFiles) {
    assert(entries.includes(expectedFile), `${label}: missing archive entry ${expectedFile}`)
  }

  const forbiddenEntry = entries.find((entry) =>
    /(^|\/)(?:node_modules|tests?|__tests__)(?:\/|$)|(^|\/)\.env(?:\.|$)/i.test(entry),
  )
  assert(!forbiddenEntry, `${label}: forbidden archive entry ${forbiddenEntry}`)

  const extractionRoot = path.join(temporaryRoot, `inspect-${label}`)
  await mkdir(extractionRoot, { recursive: true })
  await run('tar', ['-xzf', archive, '-C', extractionRoot], repoRoot, temporaryRoot)
  const packageRoot = path.join(extractionRoot, 'package')
  const manifest = await readJson(path.join(packageRoot, 'package.json'))
  await validatePackageTargets(packageRoot, manifest, label)

  assert(manifest.bin && typeof manifest.bin === 'object', `${label}: missing bin manifest`)
  assert(manifest.bin[expectedBin], `${label}: missing ${expectedBin} binary`)
  const binPath = path.resolve(packageRoot, manifest.bin[expectedBin])
  const binSource = await readFile(binPath, 'utf8')
  assert(binSource.startsWith('#!'), `${label}: ${expectedBin} has no shebang`)

  for (const filePath of await walkFiles(packageRoot)) {
    const source = await readFile(filePath, 'utf8')
    const relativePath = path.relative(packageRoot, filePath)
    assert(!source.includes(repoRoot), `${label}: checkout path in ${relativePath}`)
    assert(!/\bworkspace:/i.test(source), `${label}: workspace reference in ${relativePath}`)
    assert(!/\blink:/i.test(source), `${label}: link reference in ${relativePath}`)
    assert(!/\bfile:(?:\s*)(?:\.{1,2}[\\/]|[\\/]|[A-Za-z]:[\\/])/i.test(source), `${label}: local file reference in ${relativePath}`)

    if (path.basename(filePath) === 'package.json') {
      for (const value of collectStrings(JSON.parse(source))) {
        assert(!/^(?:workspace:|link:|file:)/i.test(value), `${label}: local dependency reference in ${relativePath}`)
      }
    }
  }

  return { manifest, entries, packageRoot }
}

function pickDependencies(manifest, names, dependencyKey, dependencyLabel) {
  return Object.fromEntries(names.map((name) => {
    assert(typeof manifest[dependencyKey]?.[name] === 'string', `template is missing ${dependencyLabel} ${name}`)
    return [name, manifest[dependencyKey][name]]
  }))
}

async function createIndependentConsumer(temporaryRoot, coreArchive, templateManifest) {
  const consumerRoot = path.join(temporaryRoot, 'independent-consumer')
  const appRoot = path.join(consumerRoot, 'src', 'app')
  const editorRoot = path.join(appRoot, 'editor', '[[...slug]]')
  const templateDirectory = path.join(consumerRoot, 'src', 'templates', 'smoke')
  await mkdir(editorRoot, { recursive: true })
  await mkdir(templateDirectory, { recursive: true })

  await writeJson(path.join(consumerRoot, 'package.json'), {
    name: 'framekit-independent-consumer',
    version: '0.0.0',
    private: true,
    type: 'module',
    dependencies: {
      '@mauriciodmo/framekit': `file:${path.resolve(coreArchive)}`,
      ...pickDependencies(templateManifest, ['next', 'react', 'react-dom'], 'dependencies', 'dependency'),
    },
    devDependencies: pickDependencies(templateManifest, [
      '@tailwindcss/postcss',
      '@types/node',
      '@types/react',
      '@types/react-dom',
      'postcss',
      'tailwindcss',
      'typescript',
    ], 'devDependencies', 'devDependency'),
  })
  await writeFile(path.join(consumerRoot, '.gitignore'), 'node_modules\n.framekit\npublic/__framekit\nsrc/generated/framekit\n', 'utf8')
  await writeFile(path.join(consumerRoot, 'next.config.ts'), "import type { NextConfig } from 'next'\n\nconst nextConfig: NextConfig = { distDir: '.framekit/next', output: 'standalone' }\n\nexport default nextConfig\n", 'utf8')
  await writeFile(path.join(consumerRoot, 'postcss.config.mjs'), "export default { plugins: { '@tailwindcss/postcss': {} } }\n", 'utf8')
  await writeFile(path.join(consumerRoot, 'next-env.d.ts'), '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// This file is generated by Next.js.\n', 'utf8')
  await writeJson(path.join(consumerRoot, 'tsconfig.json'), {
    compilerOptions: {
      target: 'ES2017',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [{ name: 'next' }],
      baseUrl: '.',
      paths: {
        '@/*': ['./src/*'],
        '@framekit/generated/*': ['./src/generated/framekit/*'],
      },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.framekit/next/types/**/*.ts'],
    exclude: ['node_modules'],
  })
  await writeFile(path.join(appRoot, 'globals.css'), '@import "tailwindcss";\n@import "@mauriciodmo/framekit/styles.css";\n', 'utf8')
  await writeFile(path.join(appRoot, 'layout.tsx'), "import { FrameKitStudioRoot } from '@mauriciodmo/framekit/studio/root'\nimport './globals.css'\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return <FrameKitStudioRoot>{children}</FrameKitStudioRoot>\n}\n", 'utf8')
  await writeFile(path.join(appRoot, 'page.tsx'), "import { redirect } from 'next/navigation'\n\nexport default function HomePage() {\n  redirect('/editor')\n}\n", 'utf8')
  await writeFile(path.join(editorRoot, 'page.tsx'), "'use client'\n\nimport { FrameKitStudio } from '@mauriciodmo/framekit/studio'\nimport { templates } from '@framekit/generated/templates'\n\nexport default function EditorPage() {\n  return <FrameKitStudio templates={templates} />\n}\n", 'utf8')
  await writeFile(path.join(templateDirectory, 'template.tsx'), "import { defineTemplate, field } from '@mauriciodmo/framekit'\n\nexport default defineTemplate({\n  meta: { title: 'Independent smoke template' },\n  width: 640,\n  height: 360,\n  fields: { title: field.text({ label: 'Title', required: true, minLength: 1 }) },\n  content: { default: { title: 'Independent consumer' } },\n  variants: { default: 'default' },\n  render({ data, width, height }) {\n    return <div style={{ width, height, padding: 32, background: '#173d31', color: 'white' }}>{data.title}</div>\n  },\n})\n", 'utf8')

  return consumerRoot
}

async function checkInstalledPackage(consumerRoot, packageName, expectedBin, temporaryRoot) {
  const packageRoot = path.join(consumerRoot, 'node_modules', ...packageName.split('/'))
  const manifest = await readJson(path.join(packageRoot, 'package.json'))
  await validatePackageTargets(packageRoot, manifest, packageName)

  const binPath = path.join(consumerRoot, 'node_modules', '.bin', expectedBin)
  await access(binPath, constants.X_OK)
  console.log(`[PASS] installed ${packageName} exports and ${expectedBin} binary (cwd: ${redact(consumerRoot, temporaryRoot)})`)
  return manifest
}

async function resolvePublicExports(consumerRoot, temporaryRoot) {
  const source = "for (const specifier of ['@mauriciodmo/framekit', '@mauriciodmo/framekit/editor', '@mauriciodmo/framekit/studio', '@mauriciodmo/framekit/studio/root', '@mauriciodmo/framekit/dev', '@mauriciodmo/framekit/styles.css']) console.log(specifier, import.meta.resolve(specifier))"
  await run('node', ['--input-type=module', '-e', source], consumerRoot, temporaryRoot)
}

async function runFrameKit(consumerRoot, command, temporaryRoot) {
  await run('npx', ['--no-install', 'framekit', command], consumerRoot, temporaryRoot)
}

async function findFreePort() {
  const server = createNetServer()
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  assert(address && typeof address !== 'string', 'could not determine an available TCP port')
  const port = address.port
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  return port
}

async function waitForHttp(child, url, temporaryRoot) {
  const deadline = Date.now() + 30_000
  let lastError = ''

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`server exited before readiness with code ${child.exitCode}\n${redact(child.output(), temporaryRoot)}`)
    }
    try {
      const response = await fetch(url)
      if (response.ok) {
        await response.text()
        return response.status
      }
      lastError = `HTTP ${response.status}`
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`HTTP readiness failed for ${url}: ${lastError}\n${redact(child.output(), temporaryRoot)}`)
}

async function stopProcess(child) {
  if (child.exitCode !== null) return true

  for (const signal of ['SIGTERM', 'SIGKILL']) {
    try {
      if (process.platform === 'win32') child.kill(signal)
      else if (child.pid) process.kill(-child.pid, signal)
    } catch (error) {
      if (error?.code !== 'ESRCH') throw error
    }

    const exited = await Promise.race([
      child.exit,
      new Promise((resolve) => setTimeout(() => resolve(false), 5_000)),
    ])
    if (exited !== false) return true
  }

  return false
}

function startServer(consumerRoot, port) {
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
  const child = spawn(command, ['--no-install', 'framekit', 'start'], {
    cwd: consumerRoot,
    env: { ...process.env, HOSTNAME: '127.0.0.1', PORT: String(port) },
    detached: process.platform !== 'win32',
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let output = ''
  child.stdout.on('data', (chunk) => { output += chunk })
  child.stderr.on('data', (chunk) => { output += chunk })
  child.output = () => output
  child.exit = once(child, 'close').then(([code, signal]) => ({ code, signal }))
  return child
}

async function runStartSmoke(consumerRoot, temporaryRoot) {
  const port = await findFreePort()
  const child = startServer(consumerRoot, port)
  let stopped = false
  try {
    const status = await waitForHttp(child, `http://127.0.0.1:${port}/editor`, temporaryRoot)
    console.log(`[PASS] framekit start HTTP readiness /editor returned ${status} (cwd: ${redact(consumerRoot, temporaryRoot)})`)
  } finally {
    stopped = await stopProcess(child)
    assert(stopped, 'could not stop the standalone server cleanly')
  }
}

async function runSmoke({ keepTemp }) {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-tarball-smoke-'))
  let result = 'FAIL'

  try {
    const coreManifest = await readJson(path.join(corePackageRoot, 'package.json'))
    const creatorManifest = await readJson(path.join(creatorPackageRoot, 'package.json'))
    const templateManifest = await readJson(path.join(templateRoot, 'package.json'))

    await run('pnpm', ['--filter', '@mauriciodmo/framekit', 'build'], repoRoot, temporaryRoot)
    await run('pnpm', ['--filter', '@mauriciodmo/create-framekit', 'build'], repoRoot, temporaryRoot)
    await run('pnpm', ['--filter', '@mauriciodmo/framekit', 'pack', '--pack-destination', temporaryRoot], repoRoot, temporaryRoot)
    await run('pnpm', ['--filter', '@mauriciodmo/create-framekit', 'pack', '--pack-destination', temporaryRoot], repoRoot, temporaryRoot)

    const archiveNames = (await readdir(temporaryRoot)).filter((entry) => entry.endsWith('.tgz'))
    const coreArchives = archiveNames.filter((entry) => entry.startsWith('mauriciodmo-framekit-'))
    const creatorArchives = archiveNames.filter((entry) => entry.startsWith('mauriciodmo-create-framekit-'))
    assert(coreArchives.length === 1, `expected one FrameKit tarball, found ${coreArchives.join(', ')}`)
    assert(creatorArchives.length === 1, `expected one creator tarball, found ${creatorArchives.join(', ')}`)
    const coreArchive = path.join(temporaryRoot, coreArchives[0])
    const creatorArchive = path.join(temporaryRoot, creatorArchives[0])

    const inspectedCore = await inspectArchive({
      label: 'core',
      archive: coreArchive,
      temporaryRoot,
      expectedFiles: ['package/bin/framekit.js', 'package/dist/index.js', 'package/dist/styles.css', 'package/README.md', 'package/LICENSE'],
      expectedBin: 'framekit',
    })
    const inspectedCreator = await inspectArchive({
      label: 'creator',
      archive: creatorArchive,
      temporaryRoot,
      expectedFiles: ['package/dist/cli.js', 'package/template/package.json', 'package/README.md', 'package/LICENSE'],
      expectedBin: 'create-framekit',
    })
    assert(inspectedCore.manifest.version === coreManifest.version, 'core archive version changed during pack')
    assert(inspectedCreator.manifest.version === creatorManifest.version, 'creator archive version changed during pack')

    const independentRoot = await createIndependentConsumer(temporaryRoot, coreArchive, templateManifest)
    await run('npm', ['install', '--no-audit', '--no-fund'], independentRoot, temporaryRoot)
    await checkInstalledPackage(independentRoot, '@mauriciodmo/framekit', 'framekit', temporaryRoot)
    await resolvePublicExports(independentRoot, temporaryRoot)
    await runFrameKit(independentRoot, 'generate', temporaryRoot)
    await runFrameKit(independentRoot, 'check', temporaryRoot)
    await runFrameKit(independentRoot, 'build', temporaryRoot)
    assert(await exists(path.join(independentRoot, 'src', 'generated', 'framekit', 'templates.ts')), 'independent consumer did not generate templates.ts')

    const runnerRoot = path.join(temporaryRoot, 'creator-runner')
    const generatedRoot = path.join(temporaryRoot, 'creator-consumer')
    await mkdir(runnerRoot, { recursive: true })
    await run('npm', ['init', '-y'], runnerRoot, temporaryRoot)
    await run('npm', ['install', '--no-audit', '--no-fund', creatorArchive], runnerRoot, temporaryRoot)
    await checkInstalledPackage(runnerRoot, '@mauriciodmo/create-framekit', 'create-framekit', temporaryRoot)
    await run('npx', ['--no-install', 'create-framekit', generatedRoot, '-n'], runnerRoot, temporaryRoot)

    assert(!(await exists(path.join(generatedRoot, 'node_modules'))), 'creator generated consumer was not clean before install')
    const generatedPackagePath = path.join(generatedRoot, 'package.json')
    const generatedPackage = await readJson(generatedPackagePath)
    const declaredFrameKit = generatedPackage.dependencies?.['@mauriciodmo/framekit']
    assert(typeof declaredFrameKit === 'string' && declaredFrameKit.length > 0, 'creator template has no FrameKit dependency')
    generatedPackage.dependencies['@mauriciodmo/framekit'] = `file:${path.resolve(coreArchive)}`
    await writeJson(generatedPackagePath, generatedPackage)
    await run('npm', ['install', '--no-audit', '--no-fund'], generatedRoot, temporaryRoot)
    const installedCoreManifest = await checkInstalledPackage(generatedRoot, '@mauriciodmo/framekit', 'framekit', temporaryRoot)
    await resolvePublicExports(generatedRoot, temporaryRoot)
    assert(installedCoreManifest.version === coreManifest.version, `generated consumer installed unexpected FrameKit ${installedCoreManifest.version}`)
    await runFrameKit(generatedRoot, 'generate', temporaryRoot)
    await runFrameKit(generatedRoot, 'check', temporaryRoot)
    await runFrameKit(generatedRoot, 'build', temporaryRoot)
    assert(await exists(path.join(generatedRoot, 'src', 'generated', 'framekit', 'templates.ts')), 'creator consumer did not generate templates.ts')
    const generatedGitignore = await readFile(path.join(generatedRoot, '.gitignore'), 'utf8')
    assert(/^src\/generated\/framekit$/m.test(generatedGitignore), 'creator consumer .gitignore misses generated registry')
    await runStartSmoke(generatedRoot, temporaryRoot)

    result = 'PASS'
    console.log(`Tarballs: ${coreArchives[0]}, ${creatorArchives[0]}`)
    console.log(`Creator declared FrameKit dependency before replacement: ${declaredFrameKit}`)
    console.log(`Temporary root: ${keepTemp ? redact(temporaryRoot, temporaryRoot) : '<removed after run>'}`)
    console.log(`SMOKE RESULT: ${result}`)
  } finally {
    if (!keepTemp) await rm(temporaryRoot, { recursive: true, force: true })
    if (result !== 'PASS') console.log(`SMOKE RESULT: ${result}`)
  }
}

try {
  const options = parseArgs(process.argv.slice(2))
  if (options) await runSmoke(options)
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
