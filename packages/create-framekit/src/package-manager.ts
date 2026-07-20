import { spawn } from 'node:child_process'
import type { PackageManager } from './prompts.js'

export function detectPackageManager(): PackageManager | null {
  const ua = process.env.npm_config_user_agent ?? ''
  if (ua.startsWith('pnpm/')) return 'pnpm'
  if (ua.startsWith('npm/')) return 'npm'
  return null
}

export function packageManagerCommand(pm: PackageManager): string {
  return process.platform === 'win32' && pm === 'pnpm' ? 'pnpm.cmd' : pm
}

export function packageManagerBin(pm: PackageManager): string {
  if (pm === 'pnpm') {
    return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
  }
  return 'npm'
}

export async function runCommand(
  command: string,
  args: string[],
  cwd: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: false, stdio: 'inherit' })
    child.once('error', (error) => {
      reject(new Error(`Command failed: ${command} ${args.join(' ')} (${error.message})`))
    })
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve()
        return
      }
      const result = signal ? `was terminated by ${signal}` : `exited with code ${code ?? 1}`
      reject(new Error(`Command failed: ${command} ${args.join(' ')} (${result})`))
    })
  })
}

export async function installDependencies(
  pm: PackageManager,
  target: string,
): Promise<void> {
  const bin = packageManagerBin(pm)
  await runCommand(bin, ['install'], target)
}

export async function generateCatalog(pm: PackageManager, target: string): Promise<void> {
  const bin = packageManagerBin(pm)
  if (pm === 'pnpm') {
    await runCommand(bin, ['framekit', 'generate'], target)
  } else {
    await runCommand(bin, ['exec', '--', 'framekit', 'generate'], target)
  }
}

export async function runApproveBuilds(target: string): Promise<void> {
  const bin = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
  await runCommand(bin, ['approve-builds'], target)
}
