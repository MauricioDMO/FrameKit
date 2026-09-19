---
title: Troubleshoot Studio access
description: Diagnose Studio login, session, role, account, password, username, and token access problems.
sidebar:
  order: 1
---

Use [Manage your account and tokens](/en/users/guides/manage-account-and-tokens) for personal account and token workflows, and [Manage users](/en/users/guides/manage-users) for administrator workflows. This page maps access symptoms to those supported rules.

## Login and redirects

The supported sign-in entry point is `/login`. A successful login creates the `framekit_session` session and redirects to `/editor`. The protected Studio sections are `/editor`, `/brand`, and `/settings`.

- Without a valid session, opening a protected section redirects to `/login`.
- With a valid session, opening `/login` redirects to `/editor`.
- An unknown Studio section is a not-found route, not an access state.

If the form reports invalid credentials, check both values exactly and try again. Unknown, malformed, incorrect, and inactive credentials intentionally produce the same unauthenticated result; the login response does not reveal which case occurred.

For an empty account database, the first login requires `FRAMEKIT_ADMIN_PASSWORD`; `FRAMEKIT_ADMIN_USERNAME` is optional and defaults to `admin`. These bootstrap values apply when the database is initialized. Changing them later does not replace existing users. See [Manage your account and tokens](/en/users/guides/manage-account-and-tokens) for the complete first-login flow.

## Expired or invalidated sessions

Sessions last 30 days. The server checks the session cookie, its expiry, and whether its user is still active. A stale, malformed, logged-out, expired, deleted, or inactive user's cookie is not enough to access Studio.

Your session is also invalidated when:

- you log out;
- you change your own password;
- an administrator resets your password;
- an administrator deactivates or deletes your account.

If a page was already open when one of these changes happened, a later settings action can fail because the server no longer accepts the session. Return to `/login` and sign in again with the current credentials. Password changes invalidate sessions but do not revoke API tokens; token status is a separate concern covered by the account guide.

## Username and password failures

Usernames must satisfy the current account rules and be unique. Passwords must satisfy the byte-length rule, and a self-service password change also requires the current password. Password input is not silently normalized, so leading, trailing, or differently normalized characters are different values.

When changing an existing username, an invalid or duplicate value leaves the account unchanged. When changing a password, a failed current-password check leaves existing sessions intact; a successful change ends all sessions for that account. See [Manage your account and tokens](/en/users/guides/manage-account-and-tokens) for the accepted values and resulting session behavior.

## User and administrator permissions

Both `user` and `admin` accounts can sign in, update their own account, change their own password, and manage their own API tokens. Only an `admin` can list and manage users, change another user's role or active state, reset another user's password, delete a user, or inspect and revoke another user's token metadata.

The Users section is hidden for a `user`, but that is only a UI convenience. The server checks the current session, role, account activity, and token ownership for every operation. A hidden control is not the authorization boundary, and sending a direct request cannot grant a non-administrator access.

If an administrator cannot remove, deactivate, or demote an account, check whether it is the last active administrator. The server preserves at least one active administrator. See [Manage users](/en/users/guides/manage-users) for role and account-state rules.

## Token access

The full API token secret is shown only when the token is created. Later lists show metadata and a short prefix, not a recoverable secret. If an integration stops authenticating, use the original full secret and check that the token is not revoked and that its owner is active.

Deactivating an owner temporarily stops that owner's unrevoked tokens; reactivating the owner makes them usable again. Revoking a token is permanent, while changing a password does not revoke tokens. Users can revoke only their own tokens; administrators can also inspect and revoke another user's token metadata. See [Manage your account and tokens](/en/users/guides/manage-account-and-tokens) and [Manage users](/en/users/guides/manage-users) for the supported token workflows.

## UI visibility versus authorization

Treat the visible Studio controls as guidance, not proof of permission. The UI hides administrator-only controls for ordinary users, but server-side checks still apply when a control is visible. A forbidden result therefore requires checking the signed-in user's role, active state, session, and ownership of the target resource rather than trying to expose a hidden control.
