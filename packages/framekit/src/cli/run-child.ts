import { spawn } from 'node:child_process'
import process from 'node:process'

export async function runChild(modulePath: string, args: string[], projectRoot: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [modulePath, ...args], {
      cwd: projectRoot,
      shell: false,
      stdio: 'inherit',
    })

    const forwardSignal = (signal: NodeJS.Signals) => child.kill(signal)
    const onSigint = () => forwardSignal('SIGINT')
    const onSigterm = () => forwardSignal('SIGTERM')
    process.once('SIGINT', onSigint)
    process.once('SIGTERM', onSigterm)

    const cleanup = () => {
      process.off('SIGINT', onSigint)
      process.off('SIGTERM', onSigterm)
    }

    child.once('error', (error) => {
      cleanup()
      reject(error)
    })
    child.once('exit', (code, signal) => {
      cleanup()
      resolve(code ?? (signal === 'SIGINT' ? 130 : 143))
    })
  })
}
