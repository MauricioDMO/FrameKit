import { spawn } from 'node:child_process'

const child = spawn('pnpm', [
  '--filter',
  '@mauriciodmo/framekit',
  'codegen',
  '--',
  process.cwd(),
], { stdio: 'inherit' })

child.on('close', (code) => {
  process.exitCode = code ?? 1
})
