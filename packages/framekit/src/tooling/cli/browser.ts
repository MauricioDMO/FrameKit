import { createRequire } from 'node:module'
import path from 'node:path'

import { runChild } from './run-child'

const require = createRequire(import.meta.url)

export function installBrowser (projectRoot: string, withDeps: boolean): Promise<number> {
  const args = ['install', 'chromium', '--only-shell']
  if (withDeps) args.push('--with-deps')
  const cliPath = path.join(path.dirname(require.resolve('playwright-core/package.json')), 'cli.js')
  return runChild(cliPath, args, projectRoot)
}
