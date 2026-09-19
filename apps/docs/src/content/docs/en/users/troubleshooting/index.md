---
title: Troubleshooting
description: Find actionable diagnostics for installing, generating, using, and deploying FrameKit projects.
sidebar:
  order: 1
---

Start with the page that matches the failing part of your project:

- [Installation](/en/users/troubleshooting/installation) covers project creation, dependencies, and starting development.
- [Templates and assets](/en/users/troubleshooting/templates-and-assets) covers source discovery and image files.
- [Generated registry](/en/users/troubleshooting/generated-registry) covers generated modules and stale output.
- [Studio](/en/users/troubleshooting/studio) covers the editor, brand catalog, uploads, and PNG export.
- [Access](/en/users/troubleshooting/access) covers login, sessions, users, and API tokens.
- [Rendering](/en/users/troubleshooting/rendering) covers the server-side image API.
- [Deployment](/en/users/troubleshooting/deployment) covers runtime, persistence, proxies, and production startup.

## First checks

From the project root, run the check that matches the symptom:

```bash
pnpm framekit check
pnpm framekit generate
```

`check` validates template definitions and resolved content. `generate` refreshes the disposable registry, generated clients, and copied template assets. Fix files under `src/templates/` or `src/brand/`, then run the command again; do not edit generated output.

For setup instructions, see [Create a project](/en/users/getting-started/create-project), [Project structure](/en/users/getting-started/project-structure), and [Use Studio](/en/users/guides/use-studio).
