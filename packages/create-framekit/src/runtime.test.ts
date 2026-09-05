import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { assertSupportedNodeRuntime, assertSupportedPackageManager } from './runtime'

const temporaryDirectories: string[] = []
const initialCwd = process.cwd()
const initialEnvironment = {
  PATH: process.env.PATH,
  npm_config_user_agent: process.env.npm_config_user_agent,
}

async function createTemporaryDirectory(prefix: string): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), prefix))
  temporaryDirectories.push(directory)
  return directory
}

async function createFakePnpm(
  binDirectory: string,
  logFile: string,
  version: string,
  versionExitCode = 0,
): Promise<void> {
  await mkdir(binDirectory)
  const source = `
import { appendFile } from 'node:fs/promises'
await appendFile(${JSON.stringify(logFile)}, JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd() }) + '\\n')
if (process.argv[2] === '--version') {
  console.log(${JSON.stringify(version)})
  process.exit(${versionExitCode})
}
`

  if (process.platform === 'win32') {
    const script = path.join(binDirectory, 'pnpm.mjs')
    await writeFile(script, source, 'utf8')
    await writeFile(
      path.join(binDirectory, 'pnpm.cmd'),
      `@echo off\r\n"${process.execPath}" "${script}" %*\r\nexit /b %errorlevel%\r\n`,
      'utf8',
    )
    return
  }

  const executable = path.join(binDirectory, 'pnpm')
  await writeFile(executable, `#!${process.execPath}\n${source}`, 'utf8')
  await chmod(executable, 0o755)
}

function restoreEnvironment(): void {
  process.chdir(initialCwd)
  for (const [name, value] of Object.entries(initialEnvironment)) {
    if (value === undefined) delete process.env[name]
    else process.env[name] = value
  }
}

describe('runtime requirements', () => {
  it('accepts the documented Node.js minimum', () => {
    expect(() => assertSupportedNodeRuntime('22.13.0')).not.toThrow()
  })

  it('rejects an unsupported Node.js version', () => {
    expect(() => assertSupportedNodeRuntime('20.9.0')).toThrow('requires Node.js >=22.13.0')
  })

  it.each(['', '22.13', 'not-a-version', '22.13.0-basura'])('rejects an invalid Node.js version: %j', (version) => {
    expect(() => assertSupportedNodeRuntime(version)).toThrow('requires Node.js >=22.13.0')
  })

  it('rejects an unsupported pnpm version', () => {
    process.env.npm_config_user_agent = 'pnpm/11.13.0 npm/? node/v22.13.0'
    expect(() => assertSupportedPackageManager('pnpm')).toThrow('requires pnpm >=11.14.0')
  })

  it('uses the pnpm executable when the user agent does not identify pnpm', async () => {
    const root = await createTemporaryDirectory('create-framekit-runtime-pnpm-')
    const bin = path.join(root, 'bin')
    const log = path.join(root, 'commands.jsonl')
    await createFakePnpm(bin, log, '11.14.0')

    process.env.PATH = bin
    delete process.env.npm_config_user_agent
    expect(() => assertSupportedPackageManager('pnpm')).not.toThrow()
    const commands = (await readFile(log, 'utf8')).trim().split('\n').map((line) => JSON.parse(line))
    expect(commands).toEqual([{ args: ['--version'], cwd: initialCwd }])
  })

  it('rejects an unsupported pnpm version from the fallback executable', async () => {
    const root = await createTemporaryDirectory('create-framekit-runtime-pnpm-old-')
    const bin = path.join(root, 'bin')
    const log = path.join(root, 'commands.jsonl')
    await createFakePnpm(bin, log, '11.13.0')

    process.env.PATH = bin
    delete process.env.npm_config_user_agent
    expect(() => assertSupportedPackageManager('pnpm')).toThrow('requires pnpm >=11.14.0')
    await expect(readFile(log, 'utf8')).resolves.toContain('"--version"')
  })

  it('reports a failed pnpm fallback without using a real command', async () => {
    const root = await createTemporaryDirectory('create-framekit-runtime-pnpm-failure-')
    const bin = path.join(root, 'bin')
    const log = path.join(root, 'commands.jsonl')
    await createFakePnpm(bin, log, '11.14.0', 7)

    process.env.PATH = bin
    delete process.env.npm_config_user_agent
    expect(() => assertSupportedPackageManager('pnpm')).toThrow('requires pnpm >=11.14.0')
    await expect(readFile(log, 'utf8')).resolves.toContain('"--version"')
  })

  it('does not require pnpm when npm is selected', async () => {
    const root = await createTemporaryDirectory('create-framekit-runtime-npm-')
    const bin = path.join(root, 'bin')
    const log = path.join(root, 'commands.jsonl')
    await createFakePnpm(bin, log, '0.0.0', 7)

    process.env.PATH = bin
    delete process.env.npm_config_user_agent
    expect(() => assertSupportedPackageManager('npm')).not.toThrow()
    await expect(readFile(log, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
  })
})

afterEach(async () => {
  restoreEnvironment()
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  )
})
