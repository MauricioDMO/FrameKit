# FrameKit type tests

These files are compile-time contract tests executed by `tsc`, not Vitest runtime tests.

- `fields/` covers field descriptors, inferred values, and rejected field options.
- `templates/` covers template inference and extracted template composition.
- `templates/validation/` contains negative template-contract cases using `@ts-expect-error`.
- `public-api/` verifies consumer-facing package entry points and exported types.
- `integrations/next/` and `integrations/studio/` verify framework-specific public contracts.

Runtime tests continue to live in the nearest `src/**/__tests__/` directory. Browser system tests live in the repository-level `e2e/` directory.
