#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { cp, lstat, rename } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const usage = 'Uso: create-framekit <directorio>'
const templateDirectory = fileURLToPath(new URL('../template/', import.meta.url))

function packageManagerCommand(): string {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
}

function runCommand(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      shell: false,
      stdio: 'inherit',
    })

    child.once('error', (error) => {
      reject(new Error(`Falló el comando: ${command} ${args.join(' ')} (${error.message})`))
    })
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve()
        return
      }

      const result = signal ? `terminó por ${signal}` : `salió con código ${code ?? 1}`
      reject(new Error(`Falló el comando: ${command} ${args.join(' ')} (${result})`))
    })
  })
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await lstat(target)
    return true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw error
  }
}

export async function createProject(rawTarget: string): Promise<string> {
  const target = path.resolve(process.cwd(), rawTarget)

  if (await pathExists(target)) {
    throw new Error(`El directorio ya existe: ${target}`)
  }

  await cp(templateDirectory, target, { recursive: true })
  await rename(path.join(target, '_gitignore'), path.join(target, '.gitignore'))

  const packageManager = packageManagerCommand()
  await runCommand(packageManager, ['install'], target)
  await runCommand(packageManager, ['framekit', 'generate'], target)

  return target
}

export async function main(args = process.argv.slice(2)): Promise<void> {
  if (args.length !== 1 || !args[0]) throw new Error(usage)

  const target = await createProject(args[0])
  const displayPath = path.isAbsolute(args[0])
    ? target
    : path.relative(process.cwd(), target) || '.'

  console.log('\nProyecto FrameKit creado.')
  console.log(`  cd ${JSON.stringify(displayPath)}`)
  console.log('  pnpm dev')
}

const invokedFile = process.argv[1]
if (invokedFile && import.meta.url === pathToFileURL(invokedFile).href) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
