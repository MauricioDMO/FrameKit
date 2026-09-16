# Phase 4 - API Tokens, Users, and Authorization

## Status

Implemented and verified on 2026-09-15. The Phase 5 Studio access UI is
implemented separately; authenticated image API/session export remain pending in
Phases 6-8 and are not implemented in this phase.

## Goal

Complete owner-scoped API tokens and administrator user management behind one
server-owned authorization boundary.

## Depends on

- Phase 3 sessions and access handler.
- Phase 2 transactional user invariants.
- The existing Bearer-header parsing conventions used by the image API.

## API-token contract

Generate tokens as:

```text
fk_<32 random bytes encoded as base64url>
```

Return the full token only from its successful creation response. Store its
SHA-256 hash, owner, name, safe prefix, creation time, optional last-used time,
and optional revocation time.

Generated-token metadata may show a short `fk_...` prefix. A migrated legacy API
key shows only `legacy`, so a short existing secret cannot be reconstructed from
metadata.

Token lookup accepts a bounded non-empty Bearer value rather than requiring the
`fk_` prefix, because an imported legacy key may use another format. Authentication
requires an unrevoked token and an active owner. Update `last_used_at` after
successful authentication, even when later request validation fails.

Do not add token editing. Rotation is create, update the external client, then
revoke the old token.

## User authorization

Normal users may:

- read and update their account;
- change their password;
- create and list their API tokens;
- revoke their API tokens.

Administrators may additionally:

- list users;
- create `user` or `admin` accounts;
- change another username, role, or active state;
- reset another password;
- delete another account or themselves when invariants permit;
- list another user's token metadata;
- revoke another user's token.

Every operation repeats authorization in the server data/handler layer. UI
visibility is not trusted. Return `401` for missing/invalid authentication,
`403` for an authenticated role/ownership failure, `404` for an inaccessible or
missing resource where appropriate, and `409` for uniqueness or last-admin
conflicts.

## HTTP actions

Implemented in `createStudioAccessHandler()` with these exact routes:

```text
GET    /api/framekit/tokens
POST   /api/framekit/tokens
DELETE /api/framekit/tokens/:id

GET    /api/framekit/users
POST   /api/framekit/users
PATCH  /api/framekit/users/:id
DELETE /api/framekit/users/:id
POST   /api/framekit/users/:id/password
GET    /api/framekit/users/:id/tokens
```

`DELETE /api/framekit/tokens/:id` permits only the owner or an administrator.
The user-token listing returns metadata only. Creation and password-reset
payloads accept a plaintext password only for that request and never return it.
The generated consumer and Studio App Router adapters export `GET`, `POST`,
`PATCH`, and `DELETE` to the same handler, including the required DELETE
adapter.

Use prepared statements and exact DTO projections. Never return database row
objects directly.

## State transitions

- Disable deletes all sessions and temporarily blocks unrevoked API tokens.
- Enable does not recreate sessions; the user logs in again.
- Enable restores use of previously unrevoked tokens.
- Password change/reset deletes all sessions but preserves API tokens.
- Token revoke sets `revoked_at`; it does not delete audit metadata.
- User delete cascades sessions and API tokens.
- Delete, disable, and demote preserve at least one active administrator.

## Expected source area

```text
packages/framekit/src/server/access/api-tokens.ts
packages/framekit/src/server/access/http/index.ts
packages/framekit/src/server/access/http/routes.ts
packages/framekit/src/server.ts
packages/framekit/tests/types/
```

Keep low-level database operations internal. Export only the handler factories
and types that consumers need through supported package facades.

## Implementation record

- Owner operations create, list, and revoke only the owner's API tokens. An
  administrator can inspect another user's token metadata and revoke that user's
  token, but never receives its secret.
- Generated tokens use `fk_` plus 32 random bytes encoded as base64url. The full
  generated secret is returned only by the creation response; storage keeps its
  SHA-256 hash and safe metadata (`tokenPrefix`, name, timestamps, and
  revocation state). Imported legacy credentials remain hash-only and may use a
  non-`fk_` format.
- Bounded Bearer credentials are looked up by SHA-256 hash only when the token
  is unrevoked and its owner is active. Successful lookup updates
  `last_used_at`.
- User and token responses use explicit safe DTO projections. Password hashes,
  session secrets, token hashes, and previously created token secrets are not
  returned.
- The last-active-administrator check and mutation run in one immediate
  transaction. Delete, deactivation, and demotion are rejected with `409` when
  they would remove the last active administrator.
- The exact access routes are covered by the handler, including path and method
  matching for token deletion and user-management actions. The adapters at
  `apps/studio/src/app/api/framekit/[...action]/route.ts` and
  `packages/create-framekit/template/src/app/api/framekit/[...action]/route.ts`
  export the DELETE method.

## Focused tests

- [x] generated token format and entropy;
- [x] creation response shows the secret once;
- [x] database stores only SHA-256 and safe metadata;
- [x] token names enforce trimming and length limits;
- [x] owner lists and revokes only owned tokens;
- [x] normal user cannot list or mutate users;
- [x] administrator can manage users and inspect/revoke token metadata;
- [x] no endpoint returns password/session/token hashes or old token secrets;
- [x] revoked token authentication fails;
- [x] inactive owner authentication fails;
- [x] reactivation restores only unrevoked tokens;
- [x] successful authentication updates `last_used_at`;
- [x] password reset deletes sessions but preserves tokens;
- [x] delete cascades owned sessions and tokens;
- [x] every last-active-administrator mutation returns `409`;
- [x] duplicate username conflicts are case-insensitive;
- [x] malformed IDs, JSON, methods, and paths fail without mutation.

Verification passed on 2026-09-15:

- `pnpm --filter @mauriciodmo/framekit exec vitest run src/server/access/__tests__/api-tokens.test.ts src/server/access/__tests__/http.test.ts src/server/access/__tests__/users.test.ts` (3 files, 43 tests).
- `pnpm --filter @mauriciodmo/framekit test -- src/server/access/__tests__/api-tokens.test.ts src/server/access/__tests__/http.test.ts src/server/access/__tests__/users.test.ts` (74 files, 794 tests).
- `pnpm --filter @mauriciodmo/framekit typecheck`.
- `pnpm --filter @mauriciodmo/framekit lint`.
- `pnpm --filter @mauriciodmo/framekit build`.

## Exit gate

**Status: Passed on 2026-09-15.**

Phase 4 is complete when token ownership and administrator authorization are
enforced server-side, secrets are one-time and hash-only, user state transitions
match the documented contract, and no operation can remove the last active
administrator.
