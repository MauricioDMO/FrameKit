#!/usr/bin/env node

import process from 'node:process'

import { installBrowser } from './browser'
import { build, start } from './production'
import { check } from './check'
import { dev } from './dev'
import { generate } from './generate'
import { assertSupportedRuntime } from './runtime'

const usage = 'Uso: framekit <generate|check|dev|build|start> | framekit browser install [--with-deps]'

async function main (): Promise<void> {
  assertSupportedRuntime()
  const [command, ...extraArguments] = process.argv.slice(2)
  if (!command) throw new Error(usage)

  const projectRoot = process.cwd()

  if (command === 'browser') {
    const [subcommand, ...browserArguments] = extraArguments
    const withDeps = browserArguments.length === 1 && browserArguments[0] === '--with-deps'
    if (subcommand !== 'install' || (browserArguments.length > 0 && !withDeps)) throw new Error(usage)

    process.exitCode = await installBrowser(projectRoot, withDeps)
    return
  }

  if (extraArguments.length > 0) throw new Error(usage)

  switch (command) {
    case 'generate':
      await generate(projectRoot)
      return
    case 'check':
      process.exitCode = await check(projectRoot)
      return
    case 'dev':
      await dev(projectRoot)
      return
    case 'build':
      process.exitCode = await build(projectRoot)
      return
    case 'start':
      process.exitCode = await start(projectRoot)
      return
    default:
      throw new Error(usage)
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
