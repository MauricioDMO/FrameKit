---
name: framekit-project-setup
description: Create a new FrameKit project or integrate FrameKit into an existing Next.js App Router project. Use when users ask to scaffold FrameKit, add the FrameKit editor to a Next.js app, configure its generated template registry, run its development or production commands, or diagnose setup, template discovery, CSS, port, validation, or production-start problems.
---

# FrameKit Project Setup

Set up the project from its root directory. FrameKit commands always use the current working directory and scan `src/templates`; there is no alternate templates-directory option or CLI configuration flag.

## Choose the path

- For a new project, use `pnpm dlx @mauriciodmo/create-framekit <new-directory>`. Require Node.js 20.9.0+, pnpm 11.14.0+, and a target directory that does not exist. The creator runs installation and generation; retain its partial directory if either fails for diagnosis.
- For an existing project, use the integration sequence below. Require Node.js 20.9+, Next.js 16+, and React 19+. Use the project's package-manager equivalent for commands shown with pnpm.
- The packages are currently prerelease and are not yet published to npm. State this plainly if the installation command cannot resolve them.

## Integrate an existing project

1. Install `@mauriciodmo/framekit`.
2. Configure Next.js with `distDir: '.framekit/next'` and `output: 'standalone'`.
3. Add `"@framekit/*": ["./.framekit/*"]` to `compilerOptions.paths` in `tsconfig.json`, preserving existing aliases.
4. Import `@mauriciodmo/framekit/styles.css` in global CSS or the root layout.
5. In the App Router root layout, which must stay a server component and not emit its own document shell, wrap `children` with `FrameKitStudioRoot` from `@mauriciodmo/framekit/studio/root`.
6. Add the client route `src/app/editor/[[...slug]]/page.tsx`, rendering `FrameKitStudio` with `templates` from `@framekit/generated/templates`.
7. Redirect `src/app/page.tsx` to `/editor`.
8. Run `framekit generate` before starting development.

Read [references/integration.md](references/integration.md) before writing the configuration or route files. It has the exact snippets and generated-file rules.

## Work with the project

- Use `framekit dev` for development. It generates the initial catalog and watches structural changes under `src/templates`.
- Use `framekit check` before diagnosing validation failures. It regenerates and validates definitions and resolved locale data, but is not a typecheck or render/export test.
- Use `framekit build` for production; it runs `check`, then the Next.js build, then prepares standalone static assets.
- Run `framekit start` only after a successful build. It uses Next standalone-server environment variables, not `FRAMEKIT_HOST` or `HOST`.
- Treat `.framekit/` and `.framekit/generated/templates.ts` as generated and disposable. Never manually edit the registry.

Read [references/cli-and-troubleshooting.md](references/cli-and-troubleshooting.md) for environment variables, template discovery rules, command details, and symptom-based fixes.

## Completion check

After setup, run `framekit generate`, then `framekit check`. Start development with `framekit dev` and open `/editor`. For production, run `framekit build` followed by `framekit start`.
