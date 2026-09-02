# Troubleshooting

Use [CLI failures](../../fk-release/references/cli-and-failures.md) for
template discovery, generated projects, ports, installation, build, and start
failures.

For repository-specific issues, also check:

- Unstyled editor: import `@mauriciodmo/framekit/styles.css` in global CSS or the layout.
- Unresolved generated import: map `@framekit/generated/*` to
  `src/generated/framekit/*` in `tsconfig.json`.
- Missing structural changes: inspect the `framekit dev` terminal for generation
  or HMR errors; the watcher regenerates for changes under `src/templates` and
  `src/brand`.
- PNG failures: validate data, fonts, cross-origin images, and browser canvas support.
