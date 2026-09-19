---
title: Manage users
description: Create and administer Studio users, roles, passwords, activity, and token access.
sidebar:
  order: 6
---

Only an administrator can use the **Users** section in Studio Settings. See [Manage your account and tokens](/en/users/guides/manage-account-and-tokens) for personal account, session, and token workflows.

## 1. Understand roles

FrameKit has two roles:

| Role | Access |
| --- | --- |
| `user` | Sign in, update the user's own account, change the user's own password, and create, list, or revoke the user's own API tokens. |
| `admin` | All `user` access, plus user listing, user creation, user editing, activation and deactivation, password reset, user deletion, and inspection or revocation of another user's token metadata. |

The Users section is hidden for a `user`, but visibility is only a UI convenience. The server checks the role and ownership again for every operation, so a non-administrator cannot gain user-management access by sending a direct request.

## 2. Create a user

In **Settings > Users**, enter a username and temporary password, choose `user` or `admin`, and select **Create user**. New accounts are active immediately. The role defaults to `user` when no administrator role is selected.

Usernames must contain 3 to 64 ASCII letters, numbers, `.`, `_`, or `-`. They preserve capitalization and must be unique case-insensitively. Passwords must be between 12 and 256 UTF-8 bytes. Passwords are accepted for the creation operation only; they are not returned in the user list or user details.

## 3. Edit a user

Each user row shows the username, role, and active or inactive state. An administrator can change the username, role, and active state, then select **Save changes**.

- An invalid or duplicate username leaves the existing user unchanged.
- Deactivating a user deletes all of that user's sessions. The user cannot sign in while inactive, and the user's API tokens stop authenticating temporarily.
- Reactivating a user does not recreate sessions. The user must sign in again, while previously unrevoked API tokens become usable again.
- Role changes are applied by the server on subsequent authorization checks. Changing your own role does not itself sign you out; demoting yourself removes administrator access from later checks.

## 4. Reset a password

Enter a new password in the user's row and select **Reset password**. An administrator does not need the user's current password. The new password must be between 12 and 256 UTF-8 bytes.

Resetting a password invalidates every session for that user and preserves the user's API tokens. Resetting your own password ends the current session and returns you to `/login`; sign in again with the new password.

## 5. Inspect and revoke user tokens

Select **View tokens** on a user row to see that user's token metadata. The full token secret is never shown there. Metadata includes the name, short token prefix, creation and last-used times, and active or revoked status.

An administrator can select **Revoke** for another user's token and confirm the action. The token stops authenticating, while its revocation metadata remains available for review. A `user` can view and revoke only their own tokens.

## 6. Delete a user

Select **Delete user** and confirm. Deletion removes the user, all of the user's sessions, and all of the user's API tokens. Deleting your own account ends the current session and returns you to `/login`.

## 7. Keep an active administrator

The server always protects the last active administrator. It rejects each of these actions when it would leave no active administrator:

- deleting the last active administrator;
- deactivating the last active administrator; or
- changing the last active administrator's role from `admin` to `user`.

The action is rejected without changing the account. If another active administrator remains, an administrator can perform the same action, including on their own account.

## 8. Trust server authorization

The UI does not grant permissions. Every user, password, activity, and token action is authorized server-side using the current session and stored user state. A visible control is not proof that an operation is allowed, and an absent control is not the only protection against unauthorized access.
