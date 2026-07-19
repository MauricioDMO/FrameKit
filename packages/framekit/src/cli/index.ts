#!/usr/bin/env node

import process from 'node:process'

import { build, start } from './production'
import { check } from './check'
import { dev } from './dev'
import { generate } from './generate'

const usage = 'Uso: framekit <generate|check|dev|build|start>'

async function main(): Promise<void> {
  const [command, ...extraArguments] = process.argv.slice(2)
  if (!command || extraArguments.length > 0) throw new Error(usage)

  const projectRoot = process.cwd()

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

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
