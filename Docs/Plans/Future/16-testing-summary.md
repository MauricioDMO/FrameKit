# 16. Testing Summary

This document defines the minimum testing layers that protect FrameKit. It is intentionally a summary rather than a complete testing implementation plan.

## Unit tests

Cover:

- Field factories and normalization.
- Type inference.
- Default value resolution.
- Variant resolution.
- Data validation.
- Template metadata validation.
- Serialization.
- Migrations.
- Export naming.
- CLI option parsing.

## Component tests

Cover:

- Built-in field controls.
- Validation messages.
- Reset behavior.
- Undo and redo.
- Navigation.
- Basic accessibility.
- Persistence state.
- Import summaries.
- Export dialogs.

## Integration tests

Cover:

- Template discovery.
- Code generation.
- CLI commands.
- Project creation.
- Project initialization.
- Build flow.
- Template loading.
- Document import and export.
- Asset persistence.
- Package tarball contents.

## End-to-end flow

The critical E2E path is:

1. Install from npm.
2. Create a project.
3. Start Studio.
4. Select a template.
5. Edit built-in fields.
6. Replace an image.
7. Export an image.
8. Run production build.
9. Start production output.

## Visual checks

Official templates should verify:

- Correct dimensions.
- Non-empty output.
- Font loading.
- Asset loading.
- Important visual regressions.
- Light and dark Studio states where relevant.

## Compatibility

Minimum targets:

- Linux.
- Windows.
- macOS.
- Node.js 22.
- Node.js 24.
- Current Chromium-based browser.

Additional browsers can be added after the browser export contract is stable.

## Release gate

A version should not be promoted to stable when any of these fail:

- Registry installation.
- Project creation.
- Template validation.
- Production build.
- Basic export.
- Platform smoke test.
- Package content inspection.
