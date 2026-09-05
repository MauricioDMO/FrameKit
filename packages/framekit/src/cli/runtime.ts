import manifest from '../../package.json'

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
    `FrameKit requires ${name} ${requirement}. Detected ${version}. Upgrade ${name} and run the command again.`,
  )
}

export function assertSupportedRuntime(
  nodeVersion = process.versions.node,
  userAgent = process.env.npm_config_user_agent ?? '',
): void {
  const engines = manifest.engines
  assertVersion('Node.js', nodeVersion, engines.node)

  const pnpmMatch = userAgent.match(/(?:^|\s)pnpm\/(\d+(?:\.\d+){2})/)
  if (pnpmMatch) assertVersion('pnpm', pnpmMatch[1], engines.pnpm)
}
