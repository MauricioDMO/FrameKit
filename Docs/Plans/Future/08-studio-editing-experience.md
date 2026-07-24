# 08. Studio Editing Experience

## Objective

Make editing fast, predictable, and recoverable without turning Studio into a free-canvas editor.

## Field organization

Template authors should be able to add UI metadata:

```tsx
fields: {
  title: fields.text({
    label: 'Title',
    ui: {
      group: 'Content',
      order: 10,
      description: 'Main headline shown in the design',
    },
  }),
}
```

Studio may render:

- Sections.
- Collapsible groups.
- Descriptions.
- Required indicators.
- Units.
- Help text.
- Related controls.
- Advanced sections.

UI metadata must not change the runtime data contract.

## Undo and redo

Add:

- Undo.
- Redo.
- Template-and-variant-specific history.
- `Ctrl/Cmd + Z`.
- `Ctrl/Cmd + Shift + Z`.

History should include content changes, field resets, and imported data.

History should not include:

- Zoom.
- Pan.
- Sidebar state.
- Theme.
- Catalog search.

## Reset behavior

Support:

- Reset one field.
- Reset one group.
- Reset current variant.
- Reset all variants for the template.

Each destructive action must clearly state its scope.

## Save state

Studio should show:

- Unsaved in-memory change.
- Saving locally.
- Saved locally.
- Persistence failure.
- Missing asset.
- Imported document with unresolved warnings.

## Variations

Users should be able to duplicate a current local edit as another document or variant-specific working copy.

This does not duplicate template source code.

## Preview workspace

Keep:

- Fit.
- Actual size.
- Zoom.
- Pan.
- Responsive resizing.

Add:

- Configurable workspace background.
- Optional grid.
- Dimension indicator.
- Current scale indicator.
- Transparent background checkerboard.
- Before/after comparison when edits exist.
- Optional safe-area overlays supplied by presets.

## Keyboard shortcuts

Suggested initial shortcuts:

```text
Ctrl/Cmd + Z: undo
Ctrl/Cmd + Shift + Z: redo
0: fit
1: actual size
Ctrl/Cmd + E: export
Ctrl/Cmd + S: save or export document data
```

Shortcuts must not interfere with typing inside inputs.

## Validation experience

Validation should:

- Display field-level messages.
- Focus or reveal the first invalid field.
- Keep preview available.
- Clear or update errors as values change.
- Distinguish data errors from asset and export errors.
- Provide a summary when multiple errors exist.

## Unsaved navigation

When navigation could discard in-memory data that has not been persisted, Studio should warn the user.

If persistence is automatic and successful, no unnecessary confirmation should appear.

## Mobile and small screens

Studio should remain usable on smaller screens, but desktop is the primary editing environment.

Possible layout:

- Preview-first tabs.
- Controls drawer.
- Catalog drawer.
- Fixed export action.

## Completion criteria

- Users can recover editing mistakes with undo.
- Reset scope is always visible.
- Field grouping does not alter runtime values.
- Studio communicates persistence state.
- Preview scale does not change unexpectedly.
- Validation points users to actionable problems.
