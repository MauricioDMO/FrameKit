---
title: Contributing to FrameKit
description: Find the clean-checkout path for changing FrameKit's runtime, Studio, CLI, generated project, or documentation.
---

# Contributing to FrameKit

This section is for contributors changing FrameKit itself. It is separate from the [user documentation](/en/users/), which explains how to use FrameKit in an application.

## Follow the contributor path

1. Start with [getting started](/en/contributors/getting-started) for prerequisites and the first local development run.
2. Read the [architecture guide](/en/contributors/architecture) for repository, package, generated-code, Studio, server, and tooling boundaries.
3. Use the [development guide](/en/contributors/development) for contributor-facing implementation rules.
4. Continue with [development](/en/contributors/development) for implementation rules and [local development](/en/contributors/getting-started/local-development) for focused workspace commands and checks.
5. For public-package or release work, confirm ownership and exports in [package architecture](/en/contributors/architecture/packages). For documentation changes, use [local development](/en/contributors/getting-started/local-development) for docs workspace commands and keep consumer-facing material in the [user documentation](/en/users/).

## Choose the audience

Use this section when the change is in the FrameKit repository: the reusable package, first-party Studio, project creator, generated consumer, or documentation site. Use the user section when the goal is to build with FrameKit rather than modify the repository.

Choose the workspace that owns the behavior, then verify it with that workspace's checks. Changes affecting generated consumers or public package behavior also need consumer-facing verification.
