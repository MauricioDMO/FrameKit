---
title: Contributing to FrameKit
description: Orient yourself in the FrameKit repository before changing the runtime, Studio, CLI, code generation, or documentation.
---

# Contributing to FrameKit

This section is for people improving FrameKit itself. It provides the orientation needed before changing the reusable runtime, the Studio, the project scaffolding CLI, code generation, or the documentation site.

## Start with the repository shape

FrameKit keeps consumer-facing runtime and editor code in `packages/framekit`, scaffolding logic and the generated project in `packages/create-framekit`, the first-party Studio in `apps/studio`, and this documentation site in `apps/docs`.

## Choose the change path

Use the area that owns the behavior you need to change, then verify the result with that area’s checks. Changes that affect generated consumers or public package behavior should also be checked from the consumer perspective, not only inside the repository.

The later contributor guides will document the detailed development, testing, and release workflows for each area.
