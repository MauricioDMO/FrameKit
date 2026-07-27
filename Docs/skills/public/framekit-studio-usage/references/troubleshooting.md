# FrameKit Studio Troubleshooting

## Empty catalog or `framekit generate` finds nothing

- Ensure `src/templates` contains a directory with `template.tsx`.
- Use lowercase kebab-case for path segments; directories beginning with `.` or `_` are ignored.
- Read [template validation](../../framekit-template-creation/references/validation-and-troubleshooting.md), then run `framekit generate`.

## Generated registry or CSS

Use this alias in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@framekit/generated/*": ["./src/generated/framekit/*"]
    }
  }
}
```

The alias resolves `@framekit/generated/templates` to `src/generated/framekit/templates.ts`. Import `@mauriciodmo/framekit/styles.css` in global CSS or the layout.

## Development, validation, and production

Read [CLI and troubleshooting](../../framekit-project-setup/references/cli-and-troubleshooting.md) for ports, environment variables, `framekit check`, builds, starts, and installation failures.

## PNG export fails

Validate the resolved data first. Export also depends on browser DOM/canvas support, loaded fonts, and images that the browser can include in the capture. It produces PNG only at the template dimensions and scale 1.
