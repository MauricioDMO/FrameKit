# 09. Accessibility and Localization

## Objective

Ensure Studio can be used with a keyboard and assistive technologies, and that interface text remains translatable without hard-coded messages.

## Language concepts

Keep these concerns separate:

- Studio interface language.
- Template content variant.
- Human-readable field labels supplied by the template.
- Machine-readable validation and error codes.

Changing the Studio language must not change the selected template variant.

## Interface localization

Studio messages should:

- Live in centralized dictionaries.
- Use stable message keys.
- Have equal key coverage across English and Spanish.
- Fail during development when a required translation is missing.
- Avoid sentence fragments that are concatenated dynamically.
- Support interpolation.
- Support pluralization where needed.

## Template labels

Template-defined labels may be:

- Static strings.
- Variant-independent localized dictionaries in a future extension.
- Resolved through a template-owned translation layer.

The first version may keep strings simple, but the contract should not prevent future localization.

## Keyboard support

Every major workflow must be available without a mouse:

- Browse categories.
- Search.
- Select template.
- Change variant.
- Edit every built-in field.
- Use dialogs.
- Reset values.
- Trigger export.
- Inspect validation errors.

## Focus management

Requirements:

- Visible focus indicator.
- Predictable focus after navigation.
- Focus moved to dialogs when opened.
- Focus restored when dialogs close.
- First invalid field can be focused.
- Hidden or collapsed invalid fields are revealed before focus.
- Focus is not trapped outside modal contexts.

## ARIA patterns

Custom controls should follow established patterns:

- Segmented choice as radio group or tabs, depending on behavior.
- Swatches with readable labels.
- Toggle as switch or checkbox.
- Tree navigation with correct semantics if implemented as a tree.
- Error summaries with live announcements.
- Loading state announcements.

## Color and contrast

Themes must provide sufficient contrast for:

- Text.
- Borders.
- Focus rings.
- Error states.
- Selected items.
- Disabled controls.
- Placeholder text.

State must not be communicated by color alone.

## Motion

Respect `prefers-reduced-motion`.

Animations should not be required to understand state changes.

## Zoom and scaling

Browser zoom must not break the layout.

Studio's canvas zoom must be separate from browser accessibility zoom.

## Future support

Possible future work:

- Additional interface languages.
- Right-to-left layout.
- Locale-aware numbers.
- Locale-aware dates when date input exists.
- Template label localization helpers.

## Completion criteria

- Selecting, editing, validating, and exporting can be completed with a keyboard.
- Field errors are announced and associated with their controls.
- Interface messages are not hard-coded in components.
- English and Spanish dictionaries have matching keys.
- Custom controls use appropriate semantics.
- Themes meet the selected accessibility target.
