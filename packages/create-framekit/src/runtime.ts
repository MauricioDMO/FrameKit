import { execFileSync } from 'node:child_process'

import manifest from '../package.json'

import { packageManagerBin } from './package-manager.js'
import type { PackageManager } from './prompts.js'

type Version = readonly [number, number, number]

function parseVersion(value: string): Version | undefined {
  const match = value.trim().match(/^v?(\d+)\.(\d+)\.(\d+)$/)
  if (!match) return undefined
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function minimumVersion(range: string): Version {
  const match = range.match(/^>=\s*(\d+\.\d+\.\d+)/)
  const version = match && parseVersion(match[1])
  if (!version) throw new Error(`Invalid runtime requirement: ${range}`)
  return version
}

function meetsMinimum(version: string, requirement: string): boolean {
  const actual = parseVersion(version)
  if (!actual) return false
  const minimum = minimumVersion(requirement)
  for (let index = 0; index < minimum.length; index += 1) {
    if (actual[index] !== minimum[index]) return actual[index] > minimum[index]
  }
  return true
}

function assertVersion(
  name: string,
  version: string,
  requirement: string,
): void {
  if (meetsMinimum(version, requirement)) return
  throw new Error(
    `The FrameKit project creator requires ${name} ${requirement}. Detected ${version}. Upgrade ${name} and run the command again.`,
  )
}

export function assertSupportedNodeRuntime(version = process.versions.node): void {
  assertVersion('Node.js', version, manifest.engines.node)
}

function detectPnpmVersion(userAgent = process.env.npm_config_user_agent ?? ''): string | undefined {
  return userAgent.match(/(?:^|\s)pnpm\/(\d+(?:\.\d+){2})/)?.[1]
}

function readPnpmVersion(): string {
  const detected = detectPnpmVersion()
  if (detected) return detected

  const command = packageManagerBin('pnpm')
  try {
    return execFileSync(command, ['--version'], {
      encoding: 'utf8',
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    throw new Error(
      `The FrameKit project creator requires pnpm ${manifest.engines.pnpm}. Install a supported pnpm version and run the command again.`,
    )
  }
}

export function assertSupportedPackageManager(packageManager: PackageManager): void {
  assertSupportedNodeRuntime()
  if (packageManager === 'pnpm') {
    assertVersion('pnpm', readPnpmVersion(), manifest.engines.pnpm)
  }
}
