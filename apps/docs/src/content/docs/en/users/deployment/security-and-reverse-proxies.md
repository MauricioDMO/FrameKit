---
title: Security and reverse proxies
description: Secure FrameKit sessions, API tokens, remote images, Chromium rendering, and public proxy exposure.
sidebar:
  order: 4
---

Read this page before exposing Studio or the image API to a public network.
Authentication is opt-in: missing or `false` leaves `/editor` and `/brand` open,
removes `/settings` and the access API, and makes image rendering credential-free.
Before exposing production to an untrusted network, explicitly set
`FRAMEKIT_AUTH_ENABLED=true`. HTTPS, request throttling, and proxy policy remain
deployment responsibilities.

## Public exposure checklist

- Terminate HTTPS at the reverse proxy or load balancer and forward requests to the long-lived Node process.
- Apply request throttling at the proxy or load balancer, including login traffic when auth is enabled.
- When auth is enabled, set a strong `FRAMEKIT_ADMIN_PASSWORD` before the first login to an empty database.
- Keep `framekit_session` cookies and full `fk_` token secrets out of logs, URLs, browser bundles, rendered DOM, and client-side code.
- Mount the SQLite directory durably when auth is enabled and account or token state must survive restarts.
- Keep the process and Chromium runtime on the supported Node and container setup.

## Session and token boundaries

When auth is enabled, the `framekit_session` cookie is `HttpOnly` and `SameSite=Lax`; production responses add `Secure`. Cookie-authenticated mutations require a same-origin `Origin`. The server verifies the current session, account activity, role, and token ownership rather than relying on whether Studio shows a control.

When auth is enabled, Bearer authentication is accepted only by `POST /api/framekit/images/render`. The full API token is returned only when it is created. Later token lists and administrator views expose metadata and a short prefix, never the recoverable secret. An inactive token owner cannot authenticate an otherwise unrevoked token; reactivation makes it usable again. In open mode, no token is required or initialized.

If an image request contains an `Authorization` header, it is authoritative. A malformed or invalid Bearer value returns `401` even when a valid session cookie is also present. Do not send both credentials as a fallback strategy.

## Same-origin proxy behavior

For cookie-authenticated mutations, the browser's `Origin` must match the origin the server derives from the request URL and trusted forwarded protocol/host information. Configure the proxy so the public HTTPS host and scheme are forwarded consistently. Do not let arbitrary client-supplied forwarding headers redefine the public origin.

Bearer requests from a trusted server-side integration do not need a session cookie or browser `Origin`, but they still need a valid, active, unrevoked token. Use a server-side environment variable or secret manager for that token.

## Image input restrictions

The renderer accepts only the following image sources:

- root-relative paths beginning with `/assets/` or `/framekit/templates/`;
- data URLs with `image/png`, `image/jpeg`, `image/webp`, or `image/gif` and a matching raster signature; and
- HTTPS URLs to exact hostnames in `FRAMEKIT_ALLOWED_IMAGE_HOSTS`.

The renderer rejects HTTP, IP literals, loopback hosts, credentials in the authority, explicit non-default ports, backslashes, fragments, traversal, SVG, invalid MIME signatures, and unsafe redirects. `https://host:443` is normalized and accepted as HTTPS without a port. Remote downloads happen in Node before Chromium receives the prepared image. Redirects are revalidated and limited to three. Each prepared image is limited to 8,000,000 bytes and the JSON request body to 12,000,000 bytes.

An asset path or a client bundle can be public. Neither is a place for credentials or other confidential data. Public assets must not be treated as secrets merely because they are used by a template.

## Render isolation

The image API validates its image-render configuration first, then authenticates before parsing input, looking up templates, fetching remote images, or reserving browser capacity. Each render uses a temporary job token for the private internal render page. The browser routing layer allows only the internal render origin and the expected render navigation, blocks unrelated navigation, and closes the page and context during cleanup. Do not publish the private render page as a separate public rendering API.

## Development-only uploads

`POST /framekit/assets` exists only on the FrameKit development server for replacing template assets from Studio. It always requires a same-origin request; authenticated mode additionally requires a valid same-origin session. It writes only to permitted template asset namespaces, is not a route under `/api/framekit/**`, and should not be treated as a production upload endpoint.

## Topology limits

The supported initial topology is one long-lived Node process per container. Browser state, render capacity, and render jobs are process-local; render jobs are lost on restart and are not a shared queue. Do not place the API in a serverless execution model or add replicas that rely on shared in-flight render state without a separately supported coordination design.
