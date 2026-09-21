---
title: Troubleshoot Studio access
description: Diagnose Studio login, session, role, account, password, username, and token access problems.
sidebar:
  order: 6
---

Use [Manage your account and tokens](/en/users/guides/manage-account-and-tokens) for personal account and token workflows, and [Manage users](/en/users/guides/manage-users) for administrator workflows.

Check `FRAMEKIT_AUTH_ENABLED` first. Missing or `false` is open mode: `/editor`
and `/brand` should work without login, `/login` should redirect to `/editor`,
and `/settings` plus the access API should return not found. Set exactly
`FRAMEKIT_AUTH_ENABLED=true` before diagnosing users, sessions, or tokens.

## Login redirects back to the login page

**Symptom:** With `FRAMEKIT_AUTH_ENABLED=true`, opening `/editor`, `/brand`, or `/settings` redirects to `/login`, or the login form reports invalid credentials.

**Probable cause:** Authentication is enabled and the session cookie is missing, expired, invalid, or belongs to an inactive user; the submitted username or password may also be incorrect. If the switch is missing or `false`, the redirect is unexpected because open mode does not require login.

**Check:** Sign in again with the current credentials and confirm that the server can read the configured database. Unknown, malformed, incorrect, and inactive credentials intentionally produce the same unauthenticated result.

**Fix:** Return to `/login` and sign in again. If the account is inactive or the password was reset, ask an administrator to restore access or use the current password.

## First login fails on a new database

**Symptom:** With `FRAMEKIT_AUTH_ENABLED=true`, the first login returns a service-unavailable error on an empty database.

**Probable cause:** `FRAMEKIT_ADMIN_PASSWORD` is missing or invalid, or `FRAMEKIT_ADMIN_USERNAME` does not satisfy the account rules.

**Check:** Confirm the auth switch and runtime values before retrying. The
password must be 12–256 UTF-8 bytes; the optional username defaults to `admin`
and must be 3–64 ASCII letters, numbers, `.`, `_`, or `-`. These variables are
ignored when auth is disabled.

**Fix:** Set valid values in the runtime environment and retry the first login. These values create the first administrator only; changing them later does not replace an existing user. See [Configuration](/en/users/reference/configuration).

Switching auth back to `false` does not delete stored users, sessions, or tokens;
it only makes the access surfaces unavailable until auth is enabled again.

## A session stops working after an account change

**Symptom:** A previously open Studio page rejects a later action or sends the user to login.

**Probable cause:** Sessions are invalidated by logout, a password change, an administrator password reset, or account deactivation or deletion. Sessions also expire after 30 days.

**Check:** Return to `/login` and authenticate again with the current credentials.

**Fix:** Sign in again. If the account is inactive or deleted, an administrator must restore or recreate the account.

## A user cannot access an administrator action

**Symptom:** User management actions return forbidden or are not visible.

**Probable cause:** Only an active administrator can list and manage users, change another user's role or active state, reset another user's password, delete a user, or inspect and revoke another user's token metadata.

**Check:** Confirm the signed-in account's role and active state.

**Fix:** Sign in with an active administrator account for administrator actions. Users can still manage their own account, password, and tokens. Do not treat a hidden control as an authorization boundary.

## An API token no longer authenticates

**Symptom:** A server-side request using `Authorization: Bearer <token>` returns unauthorized.

**Probable cause:** The token was revoked, its owner is inactive, or the request uses a truncated secret. The full token is shown only when it is created.

**Check:** Use the original full secret, confirm the token is not revoked, and confirm that its owner is active.

**Fix:** Revoke the unusable token and create a new one in Studio settings. Store the full secret in the calling service's secret manager, not in a browser bundle, URL, template, or log. See [Render images with the API](/en/users/guides/render-images-with-the-api).
