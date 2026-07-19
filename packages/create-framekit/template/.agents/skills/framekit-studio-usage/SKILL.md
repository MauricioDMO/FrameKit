---
name: framekit-studio-usage
description: Use when helping users of a generated FrameKit project use, configure, integrate, or troubleshoot FrameKit Studio, including template catalog navigation, editing and locale behavior, PNG export, themes, generated template registries, CLI commands, and Studio setup errors. Apply this skill whenever a user mentions FrameKit Studio, its editor, an empty template catalog, or a Studio export problem.
---

# FrameKit Studio Usage

Help users operate or diagnose the Studio included with a generated FrameKit project. Keep advice specific to observed behavior and use the existing project commands rather than proposing custom tooling.

## Choose The Relevant Reference

- For using the Studio interface, editing values, languages, saved edits, preview controls, themes, or PNG export, read [references/using-studio.md](references/using-studio.md).
- For an empty catalog, invalid template paths, generated registry issues, CSS, ports, validation, build/start failures, or broken PNG output, read [references/troubleshooting.md](references/troubleshooting.md).
- For integrating Studio into an application, use `FrameKitStudio` from `@mauriciodmo/framekit/studio`. It accepts `{ templates: readonly FrameKitStudioTemplate[] }`. Import `@mauriciodmo/framekit/styles.css` in the layout or global CSS. Use `FrameKitStudioRoot` only from a server component or layout; it supplies the full document shell and must not be nested in another one.

## Work Method

1. Identify whether the problem is Studio behavior, a template/catalog issue, project setup, or production deployment.
2. For template and build problems, run `framekit check` first when a detailed validation error is needed. It validates definitions and resolved locale data, but not rendering or PNG capture.
3. Use `framekit generate` after correcting template discovery issues. Run `framekit build` before `framekit start`.
4. State the cause, the smallest corrective action, and any relevant limitation, such as browser-only PNG export or local-only edits.

Do not imply server synchronization, account-based persistence, export formats besides PNG, DPI controls, or arbitrary Studio interface languages. Design locales can be any template locale key; the Studio interface supports English and Spanish.
