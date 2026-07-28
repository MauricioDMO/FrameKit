# Troubleshooting

Use [CLI failures](../../fk-release/references/cli-and-failures.md) for
template discovery, generated projects, ports, installation, build, and start
failures.

For repository-specific issues, also check:

- Unstyled editor: import `@mauriciodmo/framekit/styles.css` in global CSS or the layout.
- Unresolved generated import: map `@framekit/*` to `.framekit/*` in `tsconfig.json`.
- Missing structural changes: regenerate and restart `framekit dev`.
- PNG failures: validate data, fonts, cross-origin images, and browser canvas support.
