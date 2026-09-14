# Phase 4 - API Tokens, Users, and Authorization

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

Extend `createStudioAccessHandler()` with:

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

`DELETE /tokens/:id` permits only the owner or an administrator. The users token
listing returns metadata only. Creation and password-reset payloads accept a
plaintext password only for that request and never return it.

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
packages/framekit/src/server/access/http.ts
packages/framekit/src/server.ts
packages/framekit/tests/types/
```

Keep low-level database operations internal. Export only the handler factories
and types that consumers need through supported package facades.

## Focused tests

- generated token format and entropy;
- creation response shows the secret once;
- database stores only SHA-256 and safe metadata;
- token names enforce trimming and length limits;
- owner lists and revokes only owned tokens;
- normal user cannot list or mutate users;
- administrator can manage users and inspect/revoke token metadata;
- no endpoint returns password/session/token hashes or old token secrets;
- revoked token authentication fails;
- inactive owner authentication fails;
- reactivation restores only unrevoked tokens;
- successful authentication updates `last_used_at`;
- password reset deletes sessions but preserves tokens;
- delete cascades owned sessions and tokens;
- every last-active-administrator mutation returns `409`;
- duplicate username conflicts are case-insensitive;
- malformed IDs, JSON, methods, and paths fail without mutation.

## Exit gate

Phase 4 is complete when token ownership and administrator authorization are
enforced server-side, secrets are one-time and hash-only, user state transitions
match the documented contract, and no operation can remove the last active
administrator.
