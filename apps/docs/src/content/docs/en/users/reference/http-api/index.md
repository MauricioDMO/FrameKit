---
title: HTTP API
description: Understand the optional-access FrameKit HTTP API for account management and server-side PNG rendering.
sidebar:
  order: 1
---

FrameKit exposes a Node.js HTTP handler for optional Studio access and synchronous PNG rendering. In the canonical project, mount it from the App Router catch-all route at `/api/framekit/[...action]` and keep that route on the Node.js runtime. The [existing-project integration](/en/users/getting-started/existing-project) shows the complete route setup.

The dispatcher exposes only the routes documented in this section. `POST /api/framekit/images/render` is the image endpoint in both modes. The other routes manage the Studio session, account, API tokens, and users only when `FRAMEKIT_AUTH_ENABLED=true`; in open mode they are absent.

## Choose a reference

- [Access API](/en/users/reference/http-api/access) - session authentication, account operations, API tokens, and administrator user management.
- [Image render API](/en/users/reference/http-api/image-render) - request shape, authentication, image inputs, and the PNG response.
- [Image API errors](/en/users/reference/http-api/errors) - stable status codes and error codes for clients.

## Common response rules

Access responses are JSON and use `Cache-Control: no-store`. Image errors are also JSON and use `Cache-Control: no-store`; a successful image response is a PNG with the same cache directive. Clients should branch on the documented `error` code rather than parsing human-readable messages.

The API is synchronous. A render request authenticates first, resolves the template and its data, starts the server-side Chromium render, and returns the PNG bytes in the same response.

## Security boundary

The session cookie is for same-origin Studio access when authentication is
enabled. A Bearer API token is accepted only by the image render endpoint and
only in authenticated mode. In open mode the image endpoint needs no
credential. Do not put a token in a URL, browser bundle, rendered DOM, or
client-side code. Read [Security and reverse proxies](/en/users/deployment/security-and-reverse-proxies) before exposing the handler publicly.
