#!/usr/bin/env node

import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { execFile } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const exec = promisify(execFile)
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const templateRoot = path.join(repoRoot, 'packages', 'create-framekit', 'template')
const args = process.argv.slice(2).filter((argument) => argument !== '--')
const version = args[0]
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const smokeJobPath = '/api/framekit/smoke-job'
const renderJobTtlMs = 120_000

async function run (command, args, cwd = repoRoot, options = {}) {
  console.log(`[RUN] ${command} ${args.join(' ')}`)
  const result = await exec(command, args, {
    cwd,
    env: { ...process.env, CI: '1' },
    maxBuffer: 50 * 1024 * 1024
  })
  return `${result.stdout}${options.includeStderr ? `\n${result.stderr}` : ''}`.trim()
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

async function renderImage (origin, token) {
  const response = await fetch(`${origin}/api/framekit/images/render`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
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

async function verifyApi (origin) {
  const unauthorized = await fetch(`${origin}/api/framekit/images/render`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ template: 'example' })
  })
  assert.equal(unauthorized.status, 401, 'missing session or API token must return 401')

  const login = await fetch(`${origin}/api/framekit/login`, {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'framekit-docker-smoke-password' })
  })
  const loginBody = await login.text()
  assert.equal(login.status, 200, `login returned ${login.status}: ${loginBody}`)
  const administrator = JSON.parse(loginBody)
  assert.deepEqual(Object.keys(administrator), ['id', 'username', 'role'])
  assert.equal(administrator.username, 'admin')
  assert.equal(administrator.role, 'admin')
  assert.equal(typeof administrator.id, 'string')
  const sessionCookie = login.headers.get('set-cookie')?.split(';', 1)[0]
  assert(sessionCookie, 'login did not return a session cookie')

  const tokenResponse = await fetch(`${origin}/api/framekit/tokens`, {
    method: 'POST',
    headers: { cookie: sessionCookie, origin, 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Docker smoke token' })
  })
  const tokenBody = await tokenResponse.json()
  assert.equal(tokenResponse.status, 201, `token creation returned ${tokenResponse.status}: ${JSON.stringify(tokenBody)}`)
  assert.equal(tokenBody.name, 'Docker smoke token')
  assert.equal(typeof tokenBody.token, 'string', 'token creation did not return a token')

  await renderImage(origin, tokenBody.token)
  return { administrator, sessionCookie, token: tokenBody.token }
}

async function verifyReplacementApi (origin, persisted) {
  const account = await fetch(`${origin}/api/framekit/account`, {
    headers: { cookie: persisted.sessionCookie }
  })
  const accountBody = await account.text()
  assert.equal(account.status, 200, `persisted session returned ${account.status}: ${accountBody}`)
  assert.deepEqual(JSON.parse(accountBody), persisted.administrator, 'the administrator session did not persist')

  const login = await fetch(`${origin}/api/framekit/login`, {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'framekit-docker-smoke-password' })
  })
  const loginBody = await login.text()
  assert.equal(login.status, 200, `replacement login returned ${login.status}: ${loginBody}`)
  assert.deepEqual(JSON.parse(loginBody), persisted.administrator, 'bootstrap recreated or renamed the administrator')
  assert(login.headers.get('set-cookie')?.split(';', 1)[0], 'replacement login did not return a session cookie')

  await renderImage(origin, persisted.token)
}

async function createSmokeJob (origin) {
  // The request start conservatively bounds the age because the route does not expose createdAt.
  const createdAt = Date.now()
  const response = await fetch(`${origin}${smokeJobPath}`, { method: 'POST' })
  const body = await response.text()
  assert.equal(response.status, 201, `render-job creation returned ${response.status}: ${body}`)
  const job = JSON.parse(body)
  assert.match(job.id, /^[a-f0-9]{64}$/)
  assert.match(job.token, /^[a-f0-9]{64}$/)

  const available = await fetch(`${origin}${smokeJobPath}?${new URLSearchParams({ id: job.id, token: job.token })}`)
  const availableBody = await available.text()
  assert.equal(available.status, 200, `render job was not available in container A: ${availableBody}`)
  assert.deepEqual(JSON.parse(availableBody), { available: true })
  return { ...job, createdAt }
}

function assertRenderJobWithinTtl (createdAt) {
  assert(
    Date.now() - createdAt < renderJobTtlMs,
    'render job replacement is unverifiable after the 120000 ms render-job TTL'
  )
}

async function verifySmokeJobGone (origin, job) {
  assertRenderJobWithinTtl(job.createdAt)
  const response = await fetch(`${origin}${smokeJobPath}?${new URLSearchParams({ id: job.id, token: job.token })}`)
  const body = await response.text()
  assertRenderJobWithinTtl(job.createdAt)
  assert.equal(response.status, 404, `render job survived container replacement: ${body}`)
  assert.deepEqual(JSON.parse(body), { available: false })
}

async function smoke () {
  if (args.length !== 1 || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version ?? '')) {
    throw new Error('Usage: pnpm smoke:docker -- <exact-published-framekit-version>')
  }

  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-docker-smoke-'))
  const consumerRoot = path.join(temporaryRoot, 'consumer')
  const tag = `framekit-docker-smoke:${process.pid}`
  const containerA = `framekit-docker-smoke-${process.pid}-a`
  const containerB = `framekit-docker-smoke-${process.pid}-b`
  const volume = `framekit-docker-smoke-volume-${process.pid}`
  const startedContainers = new Set()
  const savedLogs = new Map()

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
    const smokeRouteDirectory = path.join(consumerRoot, 'src', 'app', 'api', 'framekit', 'smoke-job')
    await mkdir(smokeRouteDirectory, { recursive: true })
    await writeFile(path.join(smokeRouteDirectory, 'route.ts'), `import { createRenderJob, loadRenderRequest } from '@mauriciodmo/framekit/server'
import type { ResolvedRenderPayload } from '@mauriciodmo/framekit/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const payload: ResolvedRenderPayload = {
  template: 'example',
  variant: 'default',
  data: {},
  assets: { common: {}, variants: { default: {} } },
  width: 1200,
  height: 800
}

export function POST () {
  return Response.json(createRenderJob(payload), { status: 201 })
}

export function GET (request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const token = url.searchParams.get('token')
  const available = id !== null && token !== null && loadRenderRequest(id, token) !== undefined
  return Response.json({ available }, { status: available ? 200 : 404 })
}
`, 'utf8')

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

    assert.equal(await run('docker', ['volume', 'create', volume]), volume)
    startedContainers.add(containerA)
    await run('docker', [
      'run', '--detach', '--name', containerA,
      '--publish', '127.0.0.1::3000',
      '--env', 'FRAMEKIT_ADMIN_PASSWORD=framekit-docker-smoke-password',
      '--mount', `type=volume,source=${volume},target=/data`,
      tag
    ])
    const mappingA = await run('docker', ['port', containerA, '3000/tcp'])
    const portA = mappingA.match(/:(\d+)$/)?.[1]
    assert(portA, `could not determine Docker port from: ${mappingA}`)

    const originA = `http://127.0.0.1:${portA}`
    await waitForHttp(originA)
    const persisted = await verifyApi(originA)
    const job = await createSmokeJob(originA)

    savedLogs.set(containerA, await run('docker', ['logs', containerA], repoRoot, { includeStderr: true }).catch(() => ''))
    await run('docker', ['stop', containerA])
    await run('docker', ['rm', containerA])

    startedContainers.add(containerB)
    await run('docker', [
      'run', '--detach', '--name', containerB,
      '--publish', '127.0.0.1::3000',
      '--env', 'FRAMEKIT_ADMIN_PASSWORD=framekit-docker-smoke-password',
      '--mount', `type=volume,source=${volume},target=/data`,
      tag
    ])
    const mappingB = await run('docker', ['port', containerB, '3000/tcp'])
    const portB = mappingB.match(/:(\d+)$/)?.[1]
    assert(portB, `could not determine Docker port from: ${mappingB}`)

    const originB = `http://127.0.0.1:${portB}`
    await waitForHttp(originB)
    await verifySmokeJobGone(originB, job)
    await verifyReplacementApi(originB, persisted)
    console.log(`DOCKER SMOKE RESULT: PASS (${version})`)
  } catch (error) {
    for (const container of startedContainers) {
      const logs = savedLogs.get(container) ?? await run('docker', ['logs', container], repoRoot, { includeStderr: true }).catch(() => '')
      if (logs) console.error(`[DOCKER LOGS ${container}]\n${logs}`)
    }
    throw error
  } finally {
    await run('docker', ['rm', '--force', containerA]).catch(() => undefined)
    await run('docker', ['rm', '--force', containerB]).catch(() => undefined)
    await run('docker', ['image', 'rm', '--force', tag]).catch(() => undefined)
    await run('docker', ['volume', 'rm', '--force', volume]).catch(() => undefined)
    await rm(temporaryRoot, { recursive: true, force: true }).catch(() => undefined)
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
