import { mkdirSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'

import { migrateDatabase } from './migrations'

const defaultDatabasePath = '.framekit-data/framekit.sqlite'
const databaseStateKey = Symbol.for('framekit.server.access.database')

interface DatabaseState {
  connections: Map<string, DatabaseSync>
}

const globalState = globalThis as typeof globalThis & Record<symbol, unknown>

function getDatabaseState (): DatabaseState {
  const existing = globalState[databaseStateKey] as DatabaseState | undefined
  if (existing !== undefined) return existing

  const state: DatabaseState = { connections: new Map() }
  globalState[databaseStateKey] = state
  return state
}

function closeQuietly (database: DatabaseSync): void {
  try {
    database.close()
  } catch {
    // A test reset should not prevent the remaining connections from closing.
  }
}

function resolveDatabasePath (): string {
  const configuredPath = process.env.FRAMEKIT_DATABASE_PATH ?? defaultDatabasePath
  if (configuredPath === ':memory:') return configuredPath
  return path.resolve(process.cwd(), configuredPath)
}

export function getDatabase (): DatabaseSync {
  const databasePath = resolveDatabasePath()
  const state = getDatabaseState()
  const existing = state.connections.get(databasePath)
  if (existing !== undefined) return existing

  let database: DatabaseSync | undefined
  try {
    if (databasePath !== ':memory:') mkdirSync(path.dirname(databasePath), { recursive: true })

    database = new DatabaseSync(databasePath)
    database.exec(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
      PRAGMA busy_timeout = 5000;
    `)
  } catch (error) {
    if (database !== undefined) closeQuietly(database)
    throw new Error(`FrameKit database could not be initialized at ${databasePath}`, { cause: error })
  }

  if (database === undefined) throw new Error(`FrameKit database could not be initialized at ${databasePath}`)

  try {
    migrateDatabase(database)
  } catch (error) {
    closeQuietly(database)
    throw error
  }

  state.connections.set(databasePath, database)
  return database
}

export function resetDatabaseForTests (): void {
  const state = globalState[databaseStateKey] as DatabaseState | undefined
  if (state === undefined) return

  for (const database of state.connections.values()) closeQuietly(database)
  state.connections.clear()
}
