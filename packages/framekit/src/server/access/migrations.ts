import type { DatabaseSync } from 'node:sqlite'

const schemaVersion = 1
const schema = `
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'user')),
    active INTEGER CHECK(active IN (0, 1)),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  ) STRICT;

  CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  ) STRICT;

  CREATE TABLE api_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    token_prefix TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    created_at INTEGER NOT NULL,
    last_used_at INTEGER NULL,
    revoked_at INTEGER NULL
  ) STRICT;

  CREATE INDEX sessions_user_id_idx ON sessions(user_id);
  CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);
  CREATE INDEX api_tokens_user_id_idx ON api_tokens(user_id);
`

function readSchemaVersion (database: DatabaseSync): number {
  const row = database.prepare('PRAGMA user_version').get()
  const version = row?.user_version
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 0) {
    throw new Error('FrameKit database has an invalid schema version')
  }
  return version
}

export function migrateDatabase (database: DatabaseSync): void {
  let version: number
  try {
    version = readSchemaVersion(database)
  } catch (error) {
    throw new Error('FrameKit database schema version could not be read', { cause: error })
  }

  if (version > schemaVersion) {
    throw new Error(`FrameKit database schema version ${version} is newer than supported version ${schemaVersion}`)
  }
  if (version === schemaVersion) return

  let transactionStarted = false
  try {
    database.exec('BEGIN IMMEDIATE')
    transactionStarted = true
    database.exec(schema)
    database.exec(`PRAGMA user_version = ${schemaVersion}`)
    database.exec('COMMIT')
    transactionStarted = false
  } catch (error) {
    if (transactionStarted) {
      try {
        database.exec('ROLLBACK')
      } catch {
        // Preserve the migration error if rollback itself cannot complete.
      }
    }
    throw new Error('FrameKit database migration failed', { cause: error })
  }
}
