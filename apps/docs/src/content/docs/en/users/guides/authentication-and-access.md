---
title: Authentication and access
description: Choose open or authenticated mode, bootstrap Studio access, and manage accounts and API tokens.
---

FrameKit supports two access modes controlled by `FRAMEKIT_AUTH_ENABLED`.

## Open mode

When `FRAMEKIT_AUTH_ENABLED` is missing or `false`, `/editor` and `/brand` are available without a session, `/login` redirects to `/editor`, `/settings` and the access API are absent, and image rendering does not require a credential.

Use open mode only for trusted local or internal environments. Set `FRAMEKIT_AUTH_ENABLED=true` before exposing a deployment to an untrusted network.

## Authenticated mode

Set:

```bash
FRAMEKIT_AUTH_ENABLED=true
FRAMEKIT_ADMIN_PASSWORD='replace-with-a-strong-password'
```

`FRAMEKIT_ADMIN_USERNAME` is optional and defaults to `admin`.

On an empty database, the first successful login creates the initial administrator. After that bootstrap, users and credentials are managed from Studio Settings instead of environment variables.

Authenticated mode protects `/editor`, `/brand`, and `/settings` with the `framekit_session` cookie. API tokens are separate credentials intended for external integrations such as server-side image rendering.

## Account and token management

Signed-in users can update their own account, change their password, sign out, and create or revoke their own API tokens.

Read [Manage your account and tokens](/en/users/guides/manage-account-and-tokens) for the complete workflow.

Administrators can additionally create, edit, disable, reset, and delete users, inspect user token metadata, and revoke another user's token.

Read [Manage users](/en/users/guides/manage-users) for administrator workflows.

## Deployment persistence

Authenticated mode stores users, sessions, and API-token metadata in SQLite by default. In Docker deployments, persist `/data` and keep `FRAMEKIT_DATABASE_PATH=/data/framekit.sqlite` unless you intentionally configure another location.

See [Deployment](/en/users/deployment) and [Docker and persistence](/en/users/deployment/docker-and-persistence) for production setup.
