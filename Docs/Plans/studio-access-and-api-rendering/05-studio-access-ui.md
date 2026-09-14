# Phase 5 - Studio Access UI

## Goal

Expose login, account, API-token, and administrator workflows through the
reusable Studio while preserving its current visual language, responsive shell,
locale support, and accessibility behavior.

## Depends on

- Phase 4's complete access HTTP contract.
- The current Studio shell split and published design tokens.
- The generated registry-bound `StudioClient`.

## Route and section model

Extend the current Studio section union from `editor | brand` to:

```text
editor | brand | settings
```

Replace ambiguous `isBrand` routing state with an explicit section. Editor and
brand continue to build their current navigation trees. Settings must not load a
template or brand resource.

Add Settings as a third top-level navigation destination. The current footer
popover controls locale and theme; rename it to Appearance and preserve both
controls rather than silently replacing them with account management.

## Login UI

Add a focused username/password form for `/login` with:

- associated labels and native password input;
- pending state and duplicate-submit prevention;
- generic invalid-credential message;
- clear configuration/server failure message without secret details;
- keyboard submission and visible focus;
- redirect to `/editor` after successful login.

Do not add sign-up, recovery, remember-me, social login, or password-strength
frameworks.

## Safe user handoff

Change generated Studio binding output to accept:

```ts
interface StudioClientProps {
  user: StudioUser
}
```

It passes the safe `{ id, username, role }` DTO into `FrameKitStudio`. No
database row, active flag, hash, session token, or API-token secret crosses the
Server Component boundary.

Define `StudioUser` in `packages/framekit/src/studio/types.ts` and export it from
`@mauriciodmo/framekit/studio`. The generated Client Component imports the type
from that client-safe facade alongside `FrameKitStudio`; it must never import a
type from `@mauriciodmo/framekit/server`.

Existing clients that ignore props remain valid. A client requiring unrelated
props must continue to fail the `createStudioPage()` type contract.

## Settings areas

Account:

- show username and role;
- change username;
- change password using current and new passwords;
- log out.

API Tokens:

- create a named token;
- show the new secret once with a copy action and warning;
- list name, prefix, creation time, last-used time, and revoked state;
- revoke an active token;
- never offer token editing or reveal an old secret.

Users, administrators only:

- list users and status;
- create a user or administrator;
- change username, role, and active state;
- reset password;
- delete user;
- inspect token metadata and revoke tokens;
- show the server's last-administrator conflict clearly.

The client may hide administrator UI for normal users, but all operations remain
server-authorized. Refresh safe account data after successful identity changes.
Password change and logout navigate to `/login` after the cookie is expired.

## UI implementation rules

- Reuse the existing fetch, message, button, dialog, and focus patterns.
- Do not add a client state library or form dependency.
- Use existing FrameKit CSS tokens and responsive breakpoints.
- Confirm destructive user/token actions explicitly.
- Keep one-time token display accessible to keyboard and screen-reader users.
- Add English and Spanish messages in the existing locale contract.
- Preserve editor preview behavior and the current Appearance controls.

## Expected source area

```text
packages/framekit/src/studio/framekit-studio.tsx
packages/framekit/src/studio/types.ts
packages/framekit/src/studio/login/
packages/framekit/src/studio/settings/
packages/framekit/src/studio/shell/
packages/framekit/src/studio/i18n/
packages/framekit/src/tooling/codegen/write-template-module.ts
```

Tests remain under the nearest matching `__tests__/` trees. Generated bindings
are asserted through codegen tests and are never hand-edited.

## Focused tests

- login labels, pending state, generic failure, and successful navigation;
- generated `StudioClient` accepts and forwards only `StudioUser`;
- generated `StudioClient` imports `StudioUser` only from
  `@mauriciodmo/framekit/studio`;
- editor, brand, and settings section detection;
- settings does not load template/brand resources;
- three top-level destinations expose correct `aria-current` state;
- Appearance preserves locale and theme behavior;
- account username, password, and logout flows;
- token creation displays the secret once and list refresh hides it;
- token revocation confirmation and failure handling;
- normal user never sees Users navigation/content;
- administrator user CRUD and token-metadata workflows;
- conflict and validation messages receive appropriate focus;
- desktop and mobile layouts remain usable;
- English and Spanish message objects remain structurally equivalent.

## Exit gate

Phase 5 is complete when both roles can complete their permitted workflows from
Studio, normal users cannot reach administrator UI, all server failures remain
authoritative, generated bindings are reproducible, and accessibility and
responsive component tests pass.
