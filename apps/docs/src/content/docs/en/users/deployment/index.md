---
title: Deploy FrameKit
description: Prepare Chromium, SQLite, secrets, and a long-lived Node process before exposing FrameKit publicly.
sidebar:
  order: 1
---

FrameKit's supported initial deployment is one long-lived Node.js process per container, with HTTPS and request throttling provided by an external reverse proxy or load balancer. The process hosts Studio, the access API, and synchronous server-side PNG rendering.

Start with the operational constraints, then choose the runtime and container instructions:

- [Runtime and configuration](/en/users/deployment/runtime) - Node, Chromium, environment variables, render capacity, and process-local state.
- [Docker and persistence](/en/users/deployment/docker-and-persistence) - the canonical standalone image, `/data`, and restart behavior.
- [Security and reverse proxies](/en/users/deployment/security-and-reverse-proxies) - credentials, same-origin cookies, Bearer tokens, image restrictions, and public exposure.

## Deployment sequence

1. Set a strong `FRAMEKIT_ADMIN_PASSWORD` for first-user bootstrap and keep secrets outside the image and source repository.
2. Provide a writable, durable location for SQLite if users, sessions, and API tokens must survive restarts.
3. Install the Playwright Chromium browser and Linux dependencies, or use the canonical Dockerfile that does so during the image build.
4. Run a successful production build with `pnpm framekit build`.
5. Start the built application with `pnpm framekit start`.
6. Put HTTPS and login throttling in front of the process before public exposure.

`framekit start` is read-only with respect to the generated registry. It expects the successful build and does not regenerate templates for you.

## State boundaries

SQLite stores users, sessions, and API-token metadata. Render jobs are different: they live in a process-local `globalThis` map, expire after 120 seconds, and disappear when the process restarts. A durable SQLite volume therefore does not make an in-flight render job durable.

The renderer reuses one Chromium browser during the process lifetime, but gives each render an isolated context and page. Capacity is bounded per request. The timeout aborts or cancels render work; page and context cleanup is attempted in `finally`, and that cleanup wait has no separate documented limit. The supported topology is not a serverless function or a set of replicas that expects process-local render jobs and browser state to be shared.
