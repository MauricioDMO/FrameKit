---
title: Manage your account and tokens
description: Sign in to Studio, update your account, manage sessions, and create or revoke API tokens.
sidebar:
  order: 5
---

This guide applies only when `FRAMEKIT_AUTH_ENABLED=true`. In open mode,
`/settings` and the access API are absent; no login, SQLite database, user, or
API token is required. See [Use Studio](/en/users/guides/use-studio) for the complete Studio workflow and [FrameKit Studio](/en/users/concepts/studio) for the access model.

## 1. Sign in to Studio

Open `/login` and enter your username and password. A successful login creates a `framekit_session` session. The session lasts 30 days and protects the `/editor`, `/brand`, and `/settings` sections.

On an empty account database, the first login creates one active administrator.
Set `FRAMEKIT_ADMIN_PASSWORD` before that login. `FRAMEKIT_ADMIN_USERNAME` is
optional and defaults to `admin`. These bootstrap variables are used only when
authentication is enabled. Once a user exists, changing them does not replace or
reset existing users.

Incorrect, unknown, invalid, or inactive credentials all fail as an unauthenticated login. A session for an inactive or deleted user is not accepted, even if the browser still has its old cookie.

## 2. Update your account

The Account section shows your username and role.

### Change your username

Enter a new username and select **Save username**. Usernames:

- contain 3 to 64 ASCII letters, numbers, `.`, `_`, or `-`;
- preserve the capitalization you enter; and
- must be unique case-insensitively.

The current session remains usable after a successful username change, and Studio updates the displayed identity. A duplicate or invalid username is rejected without changing the account.

### Change your password

Enter the current password and a new password, then select **Change password**. The new password must be between 12 and 256 UTF-8 bytes.

The current password is checked before the change. A failed check leaves the existing sessions intact. A successful change invalidates every session for the account, including the browser session that submitted the change, and Studio sends you back to `/login`. API tokens are preserved.

## 3. Log out

Select **Log out** in the Account section. Studio invalidates the current session, expires its session cookie, and returns to `/login`. Logging out is safe to repeat, including when the browser has no usable session cookie.

## 4. Manage API tokens

The API tokens section is available to every signed-in user.

### Create a token

Enter a name and select **Create token**. The name is trimmed and must contain 1 to 80 characters. New tokens start with `fk_`.

Studio shows the full secret only in the successful creation confirmation. Copy it before dismissing the confirmation: the full value is not returned when tokens are listed later, and it cannot be recovered. Later listings show safe metadata instead:

- the token name and a short `fk_` prefix;
- creation and last-used times; and
- active or revoked status, including the revocation time when applicable.

Treat the full token as a secret and keep it in the server-side integration that uses it. Current server-side image authorization accepts the full token as a Bearer credential. A token works only while it is unrevoked and its owner is active; successful use updates its last-used time.

Disabling the owner temporarily stops all of that user's unrevoked tokens from authenticating. Reactivating the owner makes those tokens usable again. Changing the password does not revoke API tokens.

### Revoke a token

Select **Revoke** and confirm. Revocation stops the token from authenticating and keeps its metadata, including its revoked status, visible in the list. The token cannot be restored from Settings. An ordinary user can revoke only their own tokens; an administrator can also inspect and revoke another user's token from the Users section.

## 5. Understand your role

Studio displays your current role in the Account section. Both `user` and `admin` accounts can manage their own account and API tokens. Administrators can additionally manage users and their token metadata; see [Manage users](/en/users/guides/manage-users).

The Settings controls are not the security boundary. The server checks the current session, role, account activity, and token ownership for every operation. Hiding an admin-only control in the UI does not grant access, and a direct request cannot bypass a server-side authorization check.
