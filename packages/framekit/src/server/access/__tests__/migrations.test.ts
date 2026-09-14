import { DatabaseSync } from 'node:sqlite'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { getDatabase, resetDatabaseForTests } from '@/server/access/database'

let originalDatabasePath: string | undefined
let temporaryRoot = ''

beforeEach(async () => {
  resetDatabaseForTests()
  originalDatabasePath = process.env.FRAMEKIT_DATABASE_PATH
  temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-migrations-'))
  process.env.FRAMEKIT_DATABASE_PATH = path.join(temporaryRoot, 'framekit.sqlite')
})

afterEach(async () => {
  resetDatabaseForTests()
  if (originalDatabasePath === undefined) delete process.env.FRAMEKIT_DATABASE_PATH
  else process.env.FRAMEKIT_DATABASE_PATH = originalDatabasePath
  await rm(temporaryRoot, { recursive: true, force: true })
})

function databasePath (): string {
  return path.join(temporaryRoot, 'framekit.sqlite')
}

function readUserVersion (database: DatabaseSync): unknown {
  return database.prepare('PRAGMA user_version').get()?.user_version
}

function insertUser (database: DatabaseSync): void {
  database.prepare(`
    INSERT INTO users (id, username, password_hash, role, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('user-1', 'Alice', 'hash', 'user', 1, 1, 1)
}

describe('FrameKit schema migrations', () => {
  it('creates schema version 1 with strict tables and required indexes', () => {
    const database = getDatabase()
    const tables = database.prepare(`
      SELECT name, sql
      FROM sqlite_schema
      WHERE type = 'table' AND name IN ('users', 'sessions', 'api_tokens')
      ORDER BY name
    `).all()

    expect(tables.map(table => table.name)).toEqual(['api_tokens', 'sessions', 'users'])
    for (const table of tables) expect(table.sql).toMatch(/STRICT/i)

    expect(database.prepare('PRAGMA table_info(users)').all().map(column => [
      column.name,
      column.type,
      column.notnull,
      column.pk
    ])).toEqual([
      ['id', 'TEXT', 1, 1],
      ['username', 'TEXT', 0, 0],
      ['password_hash', 'TEXT', 1, 0],
      ['role', 'TEXT', 0, 0],
      ['active', 'INTEGER', 0, 0],
      ['created_at', 'INTEGER', 1, 0],
      ['updated_at', 'INTEGER', 1, 0]
    ])
    expect(database.prepare('PRAGMA table_info(sessions)').all().map(column => [
      column.name,
      column.type,
      column.notnull,
      column.pk
    ])).toEqual([
      ['token_hash', 'TEXT', 1, 1],
      ['user_id', 'TEXT', 1, 0],
      ['created_at', 'INTEGER', 1, 0],
      ['expires_at', 'INTEGER', 1, 0]
    ])
    expect(database.prepare('PRAGMA table_info(api_tokens)').all().map(column => [
      column.name,
      column.type,
      column.notnull,
      column.pk
    ])).toEqual([
      ['id', 'TEXT', 1, 1],
      ['user_id', 'TEXT', 1, 0],
      ['name', 'TEXT', 1, 0],
      ['token_prefix', 'TEXT', 1, 0],
      ['token_hash', 'TEXT', 1, 0],
      ['created_at', 'INTEGER', 1, 0],
      ['last_used_at', 'INTEGER', 0, 0],
      ['revoked_at', 'INTEGER', 0, 0]
    ])

    const indexes = database.prepare(`
      SELECT name
      FROM sqlite_schema
      WHERE type = 'index' AND name NOT LIKE 'sqlite_autoindex_%'
    `).all().map(index => index.name)
    expect(indexes).toEqual(expect.arrayContaining([
      'sessions_user_id_idx',
      'sessions_expires_at_idx',
      'api_tokens_user_id_idx'
    ]))

    insertUser(database)
    expect(() => database.prepare(`
      INSERT INTO users (id, username, password_hash, role, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('user-2', 'alice', 'hash', 'user', 1, 1, 1)).toThrow()

    const insertToken = database.prepare(`
      INSERT INTO api_tokens (id, user_id, name, token_prefix, token_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    insertToken.run('token-1', 'user-1', 'Token one', 'fk_one', 'same-hash', 1)
    expect(() => insertToken.run('token-2', 'user-1', 'Token two', 'fk_two', 'same-hash', 2)).toThrow()

    expect(readUserVersion(database)).toBe(1)
  })

  it('reopens an existing version 1 database without reapplying migration', () => {
    const first = getDatabase()
    insertUser(first)
    resetDatabaseForTests()

    const reopened = getDatabase()

    expect(reopened === first).toBe(false)
    expect(readUserVersion(reopened)).toBe(1)
    expect(reopened.prepare('SELECT username FROM users WHERE id = ?').get('user-1')?.username).toBe('Alice')
  })

  it('rejects a database with a future schema version', () => {
    const database = new DatabaseSync(databasePath())
    database.exec('PRAGMA user_version = 2')
    database.close()

    expect(() => getDatabase()).toThrow('newer than supported version 1')

    const reopened = new DatabaseSync(databasePath())
    expect(readUserVersion(reopened)).toBe(2)
    expect(reopened.prepare("SELECT COUNT(*) AS count FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").get()?.count).toBe(0)
    reopened.close()
  })

  it('rolls back a failed migration without partial schema or version changes', () => {
    const database = new DatabaseSync(databasePath())
    database.exec('CREATE TABLE sessions (conflict TEXT)')
    database.close()

    expect(() => getDatabase()).toThrow('FrameKit database migration failed')

    const reopened = new DatabaseSync(databasePath())
    expect(readUserVersion(reopened)).toBe(0)
    expect(reopened.prepare("SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all().map(table => table.name)).toEqual(['sessions'])
    expect(reopened.prepare("SELECT COUNT(*) AS count FROM sqlite_schema WHERE type = 'index' AND name NOT LIKE 'sqlite_autoindex_%'").get()?.count).toBe(0)
    reopened.close()
  })
})
