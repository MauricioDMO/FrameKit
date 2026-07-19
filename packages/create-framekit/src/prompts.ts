import { createInterface } from 'node:readline/promises'

export interface CliOptions {
  projectName: string
  packageManager: PackageManager
  installDependencies: boolean
  runApproveBuilds: boolean
  initGit: boolean
}

export type PackageManager = 'pnpm' | 'npm'

export async function promptProjectName(): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const name = await rl.question('Nombre del proyecto: ')
  rl.close()
  return name.trim()
}

export async function promptPackageManager(): Promise<PackageManager> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question('¿Gestor de paquetes? (pnpm/npm, por defecto pnpm): ')
  rl.close()
  const trimmed = answer.trim().toLowerCase()
  if (trimmed === 'npm') return 'npm'
  return 'pnpm'
}

export async function promptInstallDependencies(): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question('¿Instalar dependencias? (Y/n): ')
  rl.close()
  const trimmed = answer.trim().toLowerCase()
  if (trimmed === 'n') return false
  return true
}

export async function promptApproveBuilds(): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question('¿Abrir approve-builds de pnpm? (S/n): ')
  rl.close()
  const trimmed = answer.trim().toLowerCase()
  if (trimmed === 'n') return false
  return true
}

export async function promptInitGit(): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question('¿Inicializar repositorio Git? (Y/n): ')
  rl.close()
  const trimmed = answer.trim().toLowerCase()
  if (trimmed === 'n') return false
  return true
}
