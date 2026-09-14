# Phase 2 - Users, Passwords, and Bootstrap

## Goal

Add local credentials, first-boot administrator creation, and one-time migration
of the existing shared API key without introducing an identity framework.

## Depends on

- Phase 1 schema and database lifecycle.
- Node's asynchronous `crypto.scrypt`, random-byte, UUID, SHA-256, and
  timing-safe comparison APIs.

## Password contract

Use a versioned stored format:

```text
scrypt:v1:<base64url-salt>:<base64url-hash>
```

Version `v1` means exactly:

```text
N       = 131072 (2^17)
r       = 8
p       = 1
maxmem  = 268435456 bytes (256 MiB)
salt    = 16 random bytes
keylen  = 64 bytes
```

These values follow OWASP's primary minimum scrypt profile, while `maxmem`
provides headroom above Node's approximate `128 * N * r` requirement. Hashing
and verification use asynchronous `crypto.scrypt`; do not block the event loop
with `scryptSync`.

Reject malformed versions, encoding, salt length, and hash length before calling
`timingSafeEqual`. Missing, inactive, and unknown users must run verification
against a fixed valid dummy hash before returning the same generic invalid-login
result. Never expose whether a username exists.

Accept passwords from 12 through 256 UTF-8 bytes. Do not trim or normalize a
password silently.

## Username contract

Accept 3-64 ASCII letters, numbers, `.`, `_`, and `-`. Store the submitted case
but enforce uniqueness with `COLLATE NOCASE`. Do not rely on SQLite `NOCASE` for
general Unicode folding.

All user projections crossing a public boundary are explicit DTOs. The common
safe identity is:

```ts
interface StudioUser {
  id: string
  username: string
  role: 'admin' | 'user'
}
```

`StudioUser` lives in `packages/framekit/src/studio/types.ts` and is exported
from `@mauriciodmo/framekit/studio`. Code under `server/access/**` may import the
client-safe source type internally. Client Components and generated clients must
never import it from `@mauriciodmo/framekit/server`.

## First-boot bootstrap

After migrations, count users in an immediate transaction.

When the table is empty:

1. Require a valid `FRAMEKIT_ADMIN_PASSWORD`.
2. Validate `FRAMEKIT_ADMIN_USERNAME` or use `admin`.
3. Create one active administrator with `crypto.randomUUID()`.
4. If `FRAMEKIT_API_KEY` is non-empty, insert its SHA-256 hash into
   `api_tokens` for that administrator.
5. Name that token `Legacy FRAMEKIT_API_KEY` and set `token_prefix` to `legacy`.
6. Commit all bootstrap records together.

When any user exists, ignore all three bootstrap environment values for account
synchronization. Renaming the administrator in Studio must survive restarts.

A missing first-boot password is a clear fail-closed configuration error. It
must not affect `next build`, because bootstrap remains request-time and lazy.

## User operations

Implement internal operations for:

- get a safe user by ID;
- authenticate username/password;
- create a user or administrator;
- update username;
- update role or active state;
- change or reset password;
- delete a user;
- count active administrators.

The last-active-administrator check and mutation must share one immediate
transaction. Return a domain conflict for delete, deactivate, or demotion when
only one active administrator remains.

Do not add HTTP handlers or UI in this phase.

## Expected source area

```text
packages/framekit/src/server/access/
  passwords.ts
  users.ts
```

Bootstrap may remain with the database/user initialization path unless a
separate file becomes necessary during implementation.

## Focused tests

- two hashes of one password differ and both verify;
- correct, incorrect, malformed, and unsupported hashes behave safely;
- timing-safe comparison is reached only with equal-length buffers;
- unknown and inactive logins perform dummy verification;
- usernames enforce length, character, and case-insensitive uniqueness rules;
- first empty-database boot requires an administrator password;
- bootstrap creates exactly one active administrator;
- repeated initialization does not synchronize environment values;
- a renamed administrator is not recreated after restart;
- legacy API key import stores only SHA-256 and the literal `legacy` prefix;
- administrator and legacy token roll back together on failure;
- the last active administrator cannot be deleted, disabled, or demoted;
- a mutation succeeds when another active administrator exists.

## Implementation order

1. Freeze and test the password format and input limits.
2. Implement safe user DTOs and prepared statements.
3. Implement transactional first-boot bootstrap.
4. Add one-time legacy API-key insertion.
5. Implement user mutations and the last-admin invariant.
6. Benchmark the fixed `v1` profile on the minimum Node 22/Docker baseline and
   record the result. The benchmark validates the contract; it does not select
   or silently change its parameters. If the profile is not viable, amend this
   plan before any `v1` hash is persisted.

## Exit gate

Phase 2 is complete when credentials are never persisted or returned in
plaintext, bootstrap is one-time and transactional, login does not disclose
username existence through its public result, and the active-administrator
invariant survives all covered mutations.
