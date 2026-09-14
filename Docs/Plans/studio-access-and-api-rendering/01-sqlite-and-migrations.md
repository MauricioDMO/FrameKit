# Phase 1 - SQLite and Migrations

## Goal

Create the smallest reusable persistence layer needed by Studio access while
keeping database creation out of module evaluation and build-time execution.

## Depends on

- The verified Server Image Rendering Steps 1-7 baseline.
- Node.js `>=22.13.0` and the current one-process runtime contract.
- The existing `@mauriciodmo/framekit/server` package boundary.

## Deliverables

- A lazy `DatabaseSync` connection owned by `packages/framekit/src/server/access/`.
- A resolved application-owned database path.
- Schema version 1 managed through `PRAGMA user_version`.
- Strict `users`, `sessions`, and `api_tokens` tables.
- Required indexes and foreign-key behavior.
- Process-global connection reuse during Next.js development reloads.
- Ignore rules for local database, WAL, and shared-memory files.
- Node 22 type declarations where compilation requires them.

## Database path

Read `FRAMEKIT_DATABASE_PATH` lazily. Resolve a relative value against
`process.cwd()` and default to:

```text
.framekit-data/framekit.sqlite
```

Create the parent directory immediately before opening the database. Do not use
`.framekit/`; that path remains disposable FrameKit output.

Tests may use `:memory:` or an isolated temporary directory. Production code
must not silently fall back to memory when a file cannot be opened.

## Connection lifecycle

Use one `DatabaseSync` connection per resolved path under a package-specific
`Symbol.for(...)` global. The implementation must not open SQLite while the
module is imported, while declarations are emitted, or while Next.js builds the
route graph.

After opening, execute:

```sql
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
```

Do not use the `DatabaseSync` constructor `timeout` option because it was added
after the repository's minimum Node 22.13 runtime.

Expose only the minimum internal reset/close hook needed by tests. Do not add a
public connection-management API.

## Migration contract

Read `PRAGMA user_version`, reject a database newer than the package understands,
and apply sequential migrations in transactions. Version `0 -> 1` creates the
three strict tables and indexes described by the master plan.

Migration failure must roll back and surface a configuration/runtime error
without replacing, deleting, or recreating an existing database.

Schema and bootstrap are separate operations. This phase may create empty
tables; Phase 2 owns the first administrator transaction.

## Expected source area

```text
packages/framekit/src/server/access/
  database.ts
  migrations.ts
```

Add further files only when later phases introduce their domain behavior.

Also update:

```text
.gitignore
packages/create-framekit/template/_gitignore
packages/create-framekit/template/.dockerignore
packages/framekit/package.json
apps/studio/package.json
packages/create-framekit/template/package.json
pnpm-lock.yaml
```

## Focused tests

- creates schema version 1 from an empty database;
- reopens an existing version 1 database without reapplying migration;
- rejects a future `user_version`;
- rolls back a failed migration;
- enforces foreign keys and cascade deletes;
- enforces role and active-value checks;
- enforces strict column types;
- enables WAL and a nonzero busy timeout;
- shares one connection for the same resolved path;
- keeps independent paths isolated in tests;
- does not open a database on module import;
- reports an unwritable or invalid database path clearly.

## Implementation order

1. Update Node type declarations and the lockfile.
2. Implement lazy path resolution and process-global connection ownership.
3. Implement migration version checks and schema version 1.
4. Add temporary-database tests.
5. Add database paths to repository, starter, and Docker ignore rules.
6. Build the public package and confirm no SQLite state enters `dist` or tarballs.

## Exit gate

Phase 1 is complete when schema, migration, lifecycle, and failure tests pass on
the minimum supported Node runtime; importing package facades performs no
filesystem work; and no local database artifact is tracked or packed.
