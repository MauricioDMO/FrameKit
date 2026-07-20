import { createInterface } from 'node:readline/promises'

import { bold, cyan, dim } from './terminal.js'

export interface CliOptions {
  projectName: string
  packageManager: PackageManager
  installDependencies: boolean
  runApproveBuilds: boolean
  initGit: boolean
}

export type PackageManager = 'pnpm' | 'npm'

async function ask(label: string, hint?: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const suffix = hint ? ` ${dim(`(${hint})`)}` : ''
  const answer = await rl.question(`${cyan('?')} ${bold(label)}${suffix}: `)
  rl.close()
  return answer.trim()
}

export async function promptProjectName(): Promise<string> {
  return ask('Project name')
}

export async function promptPackageManager(): Promise<PackageManager> {
  const trimmed = (await ask('Package manager', 'pnpm/npm, default: pnpm')).toLowerCase()
  if (trimmed === 'npm') return 'npm'
  return 'pnpm'
}

export async function promptInstallDependencies(): Promise<boolean> {
  const trimmed = (await ask('Install dependencies', 'Y/n')).toLowerCase()
  if (trimmed === 'n') return false
  return true
}

export async function promptApproveBuilds(): Promise<boolean> {
  const trimmed = (await ask('Run pnpm approve-builds', 'Y/n')).toLowerCase()
  if (trimmed === 'n') return false
  return true
}

export async function promptInitGit(): Promise<boolean> {
  const trimmed = (await ask('Initialize a Git repository', 'Y/n')).toLowerCase()
  if (trimmed === 'n') return false
  return true
}
