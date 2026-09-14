import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { getDatabase, resetDatabaseForTests } from '@/server/access/database'

const execFileAsync = promisify(execFile)
const tsxCli = fileURLToPath(import.meta.resolve('tsx/cli'))

let originalCwd = ''
let originalDatabasePath: string | undefined
let temporaryRoot = ''

beforeEach(async () => {
  resetDatabaseForTests()
  originalCwd = process.cwd()
  originalDatabasePath = process.env.FRAMEKIT_DATABASE_PATH
  temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-database-'))
  process.env.FRAMEKIT_DATABASE_PATH = path.join(temporaryRoot, 'framekit.sqlite')
})

afterEach(async () => {
  resetDatabaseForTests()
  process.chdir(originalCwd)
  if (originalDatabasePath === undefined) delete process.env.FRAMEKIT_DATABASE_PATH
  else process.env.FRAMEKIT_DATABASE_PATH = originalDatabasePath
  await rm(temporaryRoot, { recursive: true, force: true })
})

function useDatabasePath (databasePath: string): string {
  process.env.FRAMEKIT_DATABASE_PATH = databasePath
  if (databasePath === ':memory:') return databasePath
  return path.resolve(process.cwd(), databasePath)
}

function insertUser (database: ReturnType<typeof getDatabase>, id: string, username: string | null = null): void {
  database.prepare(`
    INSERT INTO users (id, username, password_hash, role, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, username, 'hash', 'user', 1, 1, 1)
}

describe('FrameKit database lifecycle', () => {
  it('resolves the default path and creates its parent before opening', () => {
    delete process.env.FRAMEKIT_DATABASE_PATH
    process.chdir(temporaryRoot)

    getDatabase()

    expect(existsSync(path.join(temporaryRoot, '.framekit-data', 'framekit.sqlite'))).toBe(true)
  })

  it('shares one connection for the same resolved path', () => {
    process.chdir(temporaryRoot)
    useDatabasePath('nested/../framekit.sqlite')
    const first = getDatabase()

    useDatabasePath('./framekit.sqlite')

    expect(getDatabase()).toBe(first)
  })

  it('keeps independent database paths isolated', () => {
    process.chdir(temporaryRoot)
    useDatabasePath('first/framekit.sqlite')
    const first = getDatabase()
    insertUser(first, 'first-user')

    useDatabasePath('second/framekit.sqlite')
    const second = getDatabase()

    expect(second).not.toBe(first)
    expect(second.prepare('SELECT COUNT(*) AS count FROM users').get()?.count).toBe(0)
  })

  it('enables WAL and a nonzero busy timeout', () => {
    const database = getDatabase()

    expect(database.prepare('PRAGMA journal_mode').get()?.journal_mode).toBe('wal')
    expect(database.prepare('PRAGMA busy_timeout').get()?.timeout).toBeGreaterThan(0)
  })

  it('enforces foreign keys and cascades owned records on user deletion', () => {
    const database = getDatabase()
    insertUser(database, 'owner')

    expect(() => database.prepare(`
      INSERT INTO sessions (token_hash, user_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `).run('orphan-session', 'missing', 1, 2)).toThrow()

    database.prepare(`
      INSERT INTO sessions (token_hash, user_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `).run('session', 'owner', 1, 2)
    database.prepare(`
      INSERT INTO api_tokens (id, user_id, name, token_prefix, token_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('api-token', 'owner', 'Test token', 'fk_test', 'token-hash', 1)

    database.prepare('DELETE FROM users WHERE id = ?').run('owner')

    expect(database.prepare('SELECT COUNT(*) AS count FROM sessions').get()?.count).toBe(0)
    expect(database.prepare('SELECT COUNT(*) AS count FROM api_tokens').get()?.count).toBe(0)
  })

  it('enforces the role and active-value checks', () => {
    const database = getDatabase()
    const insert = database.prepare(`
      INSERT INTO users (id, password_hash, role, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    insert.run('admin', 'hash', 'admin', 1, 1, 1)
    insert.run('inactive', 'hash', 'user', 0, 1, 1)
    expect(() => insert.run('invalid-role', 'hash', 'owner', 1, 1, 1)).toThrow()
    expect(() => insert.run('invalid-active', 'hash', 'user', 2, 1, 1)).toThrow()
  })

  it('enforces strict column types', () => {
    const database = getDatabase()
    const insert = database.prepare(`
      INSERT INTO users (id, password_hash, role, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    expect(() => insert.run(new Uint8Array([1]), 'hash', 'user', 1, 1, 1)).toThrow()
    expect(() => insert.run('invalid-time', 'hash', 'user', 1, 'not-an-integer', 1)).toThrow()
  })

  it('reports an invalid database path without falling back to memory', async () => {
    const parentFile = path.join(temporaryRoot, 'database-parent')
    await writeFile(parentFile, 'not a directory')
    const databasePath = path.join(parentFile, 'framekit.sqlite')
    useDatabasePath(databasePath)

    expect(() => getDatabase()).toThrow(`FrameKit database could not be initialized at ${databasePath}`)
    expect(existsSync(databasePath)).toBe(false)
  })

  it('does not open a database while the module is imported', async () => {
    const databasePath = path.join(temporaryRoot, 'lazy', 'framekit.sqlite')
    const databaseModule = new URL('../database.ts', import.meta.url).href
    const script = `
      import { existsSync } from 'node:fs'
      void (async () => {
        await import(${JSON.stringify(databaseModule)})
        if (existsSync(${JSON.stringify(path.dirname(databasePath))}) || existsSync(${JSON.stringify(databasePath)})) {
          throw new Error('FrameKit database opened during module import')
        }
      })().catch(error => {
        console.error(error)
        process.exitCode = 1
      })
    `

    await expect(execFileAsync(process.execPath, [tsxCli, '--eval', script], {
      cwd: temporaryRoot,
      env: { ...process.env, FRAMEKIT_DATABASE_PATH: databasePath }
    })).resolves.toBeDefined()
  })
})
