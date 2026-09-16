#!/usr/bin/env node

import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { execFile } from 'node:child_process'
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const exec = promisify(execFile)
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const templateRoot = path.join(repoRoot, 'packages', 'create-framekit', 'template')
const args = process.argv.slice(2).filter((argument) => argument !== '--')
const version = args[0]
const apiKey = 'framekit-docker-smoke'
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

async function run (command, args, cwd = repoRoot) {
  console.log(`[RUN] ${command} ${args.join(' ')}`)
  const result = await exec(command, args, {
    cwd,
    env: { ...process.env, CI: '1' },
    maxBuffer: 50 * 1024 * 1024
  })
  return result.stdout.trim()
}

async function waitForHttp (origin) {
  const deadline = Date.now() + 60_000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/editor`, { signal: AbortSignal.timeout(5_000) })
      await response.arrayBuffer()
      if (response.ok) return
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error('Docker container did not become ready')
}

async function verifyApi (origin) {
  const removedRoute = await fetch(`${origin}/api/v1/images`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ template: 'example' })
  })
  assert.equal(removedRoute.status, 404, 'the removed versioned image route must return 404')

  const unauthorized = await fetch(`${origin}/api/framekit/images/render`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ template: 'example' })
  })
  assert.equal(unauthorized.status, 401, 'missing API key must return 401')

  const response = await fetch(`${origin}/api/framekit/images/render`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ template: 'example' }),
    signal: AbortSignal.timeout(90_000)
  })
  const bytes = Buffer.from(await response.arrayBuffer())

  assert.equal(response.status, 200, `image API returned ${response.status}: ${bytes.toString('utf8')}`)
  assert.equal(response.headers.get('content-type'), 'image/png')
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.deepEqual(bytes.subarray(0, pngSignature.length), pngSignature)
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR')
  assert.equal(bytes.readUInt32BE(16), 1200)
  assert.equal(bytes.readUInt32BE(20), 800)
}

async function smoke () {
  if (args.length !== 1 || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version ?? '')) {
    throw new Error('Usage: pnpm smoke:docker -- <exact-published-framekit-version>')
  }

  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-docker-smoke-'))
  const consumerRoot = path.join(temporaryRoot, 'consumer')
  const tag = `framekit-docker-smoke:${process.pid}`
  const container = `framekit-docker-smoke-${process.pid}`
  let started = false

  try {
    assert.equal(
      await run('npm', ['view', `@mauriciodmo/framekit@${version}`, 'version']),
      version,
      'FrameKit version is not available from npm'
    )
    assert(
      await run('npm', ['view', `@mauriciodmo/framekit@${version}`, 'dependencies.playwright-core']),
      `FrameKit ${version} does not include the Docker browser runtime`
    )
    await cp(templateRoot, consumerRoot, {
      recursive: true,
      filter: (source) => path.basename(source) !== 'node_modules'
    })

    const packagePath = path.join(consumerRoot, 'package.json')
    const manifest = JSON.parse(await readFile(packagePath, 'utf8'))
    manifest.dependencies['@mauriciodmo/framekit'] = version
    await writeFile(packagePath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

    await run('pnpm', ['install', '--lockfile-only', '--ignore-scripts'], consumerRoot)
    await run('docker', ['build', '--tag', tag, '.'], consumerRoot)
    assert.equal(
      await run('docker', ['image', 'inspect', '--format', '{{.Config.User}}|{{json .Config.Entrypoint}}', tag]),
      'node|["/usr/bin/tini","--"]'
    )

    await run('docker', [
      'run', '--detach', '--rm', '--name', container,
      '--publish', '127.0.0.1::3000',
      '--env', `FRAMEKIT_API_KEY=${apiKey}`,
      tag
    ])
    started = true
    const mapping = await run('docker', ['port', container, '3000/tcp'])
    const port = mapping.match(/:(\d+)$/)?.[1]
    assert(port, `could not determine Docker port from: ${mapping}`)

    const origin = `http://127.0.0.1:${port}`
    await waitForHttp(origin)
    await verifyApi(origin)
    console.log(`DOCKER SMOKE RESULT: PASS (${version})`)
  } catch (error) {
    if (started) {
      const logs = await run('docker', ['logs', container]).catch(() => '')
      if (logs) console.error(logs)
    }
    throw error
  } finally {
    await run('docker', ['rm', '--force', container]).catch(() => undefined)
    await run('docker', ['image', 'rm', '--force', tag]).catch(() => undefined)
    await rm(temporaryRoot, { recursive: true, force: true })
  }
}

try {
  await smoke()
} catch (error) {
  const detail = typeof error?.stderr === 'string' && error.stderr.trim() !== ''
    ? error.stderr.trim()
    : error instanceof Error ? error.message : String(error)
  console.error(detail)
  process.exitCode = 1
}
