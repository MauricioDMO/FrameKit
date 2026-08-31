# Phase 3 - Editor Orchestration

## Status

- **Status:** Proposed; not yet implemented.
- **PR boundary:** One behavior-preserving editor refactor, separate from Phase
  2's validation split.
- **Public API:** `FrameKitEditor` and the existing `./editor` exports remain
  unchanged.

## Depends on

- **Sequencing dependency:** Phase 2 must be merged first, as promised by the
  ordered roadmap.
- **Code dependency:** None on Phase 2's extracted validation modules; this
  phase uses the current editor contracts and must remain independently
  behavior-preserving.
- The current `FrameKitEditor` and every existing editor component, state
  helper, and export helper in `packages/framekit/src/editor/**`.
- Current `EditorMessages`, `TemplateBase` generics, registry entries, Studio
  validation/loading, and the existing editor test suite.

## Goal

Reduce `framekit-editor.tsx` to orchestration: connect the existing state,
data resolution, controls, preview, upload, validation, and export behavior
without recreating any existing owner. Extract only the UI that has a clear
boundary in the current file:

1. an internal editor header for the title and action buttons;
2. an internal metadata dialog containing `TemplateMetadata` and
   `TemplateTags`, including the current focus and Escape behavior.

Keep upload, export, validation/error coordination, data resolution, render
invocation, and refs needed by those flows in `FrameKitEditor` unless the
current code proves that a smaller shared owner is necessary. The expected
result is a smaller coordinator, not a new editor architecture.

## Current baseline

`FrameKitEditor` is the public generic component exported by
`packages/framekit/src/editor.ts`. Its props are currently:

```typescript
interface FrameKitEditorProps<Definition extends TemplateBase> {
  template: TemplateRegistryEntry
  definition: Definition & {
    render(props: TemplateRenderProps<Definition>): ReactNode
  }
  messages: EditorMessages
  sidebarCollapsed?: boolean
}
```

The component currently owns all of these coordination responsibilities:

- `useEditorState(slug, definition)` and its selected variant, edits, errors,
  reset version, and callbacks;
- `resolveTemplateData(definition, selectedVariant, userEdits, assets)` with a
  data-error alert fallback;
- per-field validation translation, with error clearing delegated to the
  existing `useEditorState` callbacks;
- development-only image upload to `/__framekit/assets`, including base64
  conversion, scope-to-variant selection, error state, and reload;
- export/copy validation, first-invalid-control focusing, `exporting` guard,
  error logging/alerting, PNG dimensions, and calls to `exportTemplate` and
  `copyTemplate`;
- the exact template render wrapper and render props;
- the action header and metadata modal markup.

Existing owners already cover the rest of the editor and must not be
recreated:

| Existing owner | Current responsibility | Phase 3 treatment |
|---|---|---|
| `components/editor-controls.tsx`: `EditorControls` | Variant selector, field descriptor projection, field rendering, field error/upload callbacks | Reuse unchanged. Do not make a second controls component. |
| `components/template-preview.tsx`: `TemplatePreview` | Fit/actual/custom view, resize observation, wheel zoom, pointer drag, preview accessibility | Reuse unchanged. Do not move preview state into the orchestrator or new header/dialog files. |
| `state/editor-state.ts` | Pure state shape, persistence filtering, rebasing, variant selection/reset, field updates | Reuse unchanged. |
| `state/use-editor-state.ts`: `useEditorState` | React state/persistence effects and editor callbacks | Reuse unchanged. Do not create another hook. |
| `core/resolve-template-data.ts`: `resolveTemplateData` | Canonical default/content/edit/asset resolution | Reuse unchanged; keep the resolver call and its failure fallback in the orchestrator. |
| `core/validation/data.ts`: `validateTemplateData` | Canonical resolved-data validation and error descriptors | Reuse unchanged; keep validation sequencing and localized translation in the orchestrator. |
| `export-template.ts`: `exportTemplate`, `copyTemplate`, private `renderTemplate` | Font readiness, cloned untransformed capture, browser download, clipboard write | Reuse unchanged. Do not recreate or wrap these in a new export helper. |
| `validation.ts`: `translateValidationError` | Localized field error text | Reuse unchanged. |
| `fields/editor-field.tsx`, `fields/registry.ts`, `fields/shared.tsx`, and all field components | Field dispatch and text/color/number/image/choice/boolean controls | Reuse unchanged. |
| `framekit-navigation.tsx` and `navigation.ts` | Sidebar navigation and persisted folder state | Reuse unchanged. |

## Current-to-target file and symbol map

The two new files are internal implementation files. They are not exported
from `packages/framekit/src/editor.ts`.

| Current file / symbols | Target file / symbols | Change and boundary |
|---|---|---|
| `editor/framekit-editor.tsx`: `FrameKitEditorProps`, `FrameKitEditor` | Same file and symbols | Keep the public generic component and exact props. Reduce it to coordination, state/data/error/upload/export functions, the grid, and composition of the existing/new children. |
| `framekit-editor.tsx`: header JSX and action buttons | `editor/components/editor-header.tsx`: internal `EditorHeader` | Extract presentational header markup. Receive title, messages, metadata availability, exporting state, and callbacks. Do not pass slug, definition, assets, or state internals. |
| `framekit-editor.tsx`: `metadataOpen` rendering, `metadataCloseRef`, Escape effect, backdrop close, dialog JSX | `editor/components/template-metadata-dialog.tsx`: internal `TemplateMetadataDialog` | Extract dialog lifecycle and markup. Keep `TemplateMetadata` and `TemplateTags` private in this file, with the same conditional rendering, labels, IDs, focus-on-open, Escape close, backdrop close, and focus restoration. |
| `framekit-editor.tsx`: `TemplateMetadata` | `template-metadata-dialog.tsx`: private `TemplateMetadata` | Move without changing description/marketing-description conditions or markup semantics. |
| `framekit-editor.tsx`: `TemplateTags` | `template-metadata-dialog.tsx`: private `TemplateTags` | Move without changing tag empty checks, list labeling, order, or tag text. |
| `framekit-editor.tsx`: `readFileAsBase64` | Same file and symbol | Keep with upload coordination. Do not turn upload into a generic hook or move it into the dialog/header. |
| `framekit-editor.tsx`: `changeFieldValidation`, `uploadImage`, `runExport`, `exportPng`, `copyPng` | Same file and symbols | Keep shared validation, upload, export, error, focus, and retry semantics in the orchestrator. |
| `framekit-editor.tsx`: exact render wrapper and `definition.render` invocation | Same file | Keep `exportRef`, wrapper dimensions, assets object, selected variant cast, width/height, and render props unchanged. |
| `editor.ts`: `FrameKitEditor`, `FrameKitNavigation`, navigation helpers/types exports | Same file and exports | Do not add header/dialog exports or change `./editor` public surface. |
| `components/editor-controls.tsx`: `EditorControls` | Same file and symbol | No change; existing control owner remains the only controls implementation. |
| `components/template-preview.tsx`: `TemplatePreview`, `getFittedView`, `fitToView`, `showActualSize`, `zoomAtPointer`, `handlePointerDown`, `handlePointerMove`, `endDrag` | Same file and symbols | No change; existing preview owner remains the only preview implementation. |
| `state/use-editor-state.ts`: `useEditorState`, nested `changeVariant`, `clearVariant`, `changeField` | Same file and symbols | No change to persistence hydration, `v2` storage key, rebasing, reset version, errors, or callbacks. |
| `state/editor-state.ts`: `EditorState`, `storageKey`, `getInitialState`, `filterFieldData`, `rebaseState`, `loadPersistedState`, `selectVariant`, `resetVariant`, `updateField` | Same file and symbols | No change. Preserve malformed-storage filtering and immutability behavior. |
| `export-template.ts`: `renderTemplate`, `exportTemplate`, `copyTemplate` | Same file and symbols | No change. Preserve fonts-ready, clone/removal, untransformed capture, filename, PNG size/scale, and clipboard semantics. |
| `validation.ts`: `translateValidationError` | Same file and symbol | No change to localized messages or interpolation. |
| `fields/registry.ts`: `fieldComponents` | Same file and symbol | No change; retain the single field-kind dispatch registry. |
| `fields/editor-field.tsx`: `EditorField` | Same file and symbol | No change; retain the label/container/error wiring. |
| `fields/shared.tsx`: `controlClass`, `FieldLabel` | Same file and symbols | No change; retain shared field presentation primitives. |
| `fields/components/text-field.tsx`: `TextField` | Same file and symbol | No change. |
| `fields/components/number-field.tsx`: `NumberField`, `normalizeSliderValue`, `decimalPlaces` | Same file and symbols | No change; retain draft values, validation, slider normalization, and decimal handling. |
| `fields/components/color-field.tsx`: `ColorField` | Same file and symbol | No change; retain picker throttling and text/picker synchronization. |
| `fields/components/image-field.tsx`: `ImageField` | Same file and symbol | No change; retain upload callback, file reset, loading, and image-error behavior. |
| `fields/components/choice-field.tsx`: `ChoiceField` | Same file and symbol | No change; retain unknown persisted choice display and native select behavior. |
| `fields/components/boolean-field.tsx`: `BooleanField` | Same file and symbol | No change; retain real boolean values and switch accessibility. |
| `framekit-navigation.tsx`: `FrameKitNavigation`, `FrameKitNavigationTree`, private `NavigationNode`, `NavigationFolder`, `readNavigationState`, `persistNavigationState`, `NavigationState`, and `navigationStorageKey` | Same file and symbols | No change; retain persisted folder state, pathname selection, nesting, and navigation accessibility. |
| `navigation.ts`: `TemplateManifestEntry`, `TemplateNavigationFolder`, `TemplateNavigationItem`, `TemplateNavigationNode`, `humanizeSegment`, `manifestToNavigation` | Same file and symbols | No change; retain manifest-to-tree sorting and href generation. |
| `editor/types.ts`: `EditorMessages`, `TemplateField`, `ImageFieldLabels`, `EditorFieldProps` | Same file and types | No change; the new private components consume existing message types and `TemplateMeta` only, with no new public types. |
| `framekit-editor.test.tsx` | Same file | Retain the existing editor wiring, control, validation, state, render, and copy tests. Update only imports or test setup required by the new internal children; do not replace them with snapshots. |
| `export-template.test.ts`, `framekit-navigation.test.tsx`, `navigation.test.ts`, `state/editor-state.test.ts` | Same files | Retain unchanged unless a compile-only import path requires a mechanical update. Their existing owners stay intact. |
| `studio/framekit-studio.tsx`: `FrameKitStudio` and `FrameKitStudioTemplate` | Same file and symbols | No change. Studio continues to validate loaded definitions and render `FrameKitEditor` with the same props. |

## Target component contracts

### `EditorHeader`

Keep this presentational and internal. Its props should express only what the
current markup needs, for example:

```typescript
interface EditorHeaderProps {
  title: string
  messages: EditorMessages
  hasMetadata: boolean
  exporting: boolean
  onOpenMetadata: () => void
  onReset: () => void
  onExport: () => void
  onCopy: () => void
}
```

The exact private type can differ, but the behavior must remain:

- render the same `header` structure and title from `template.meta.title`;
- use the same localized labels and icons;
- show the metadata button only when description, marketing description, or a
  non-empty tag list exists;
- keep `aria-haspopup="dialog"` and `aria-controls="template-metadata-dialog"`;
- keep reset enabled as it is today;
- disable download/copy only while `exporting` and show `messages.generating`
  for those actions while busy;
- pass callbacks through without moving validation, upload, export, or state
  ownership into the header.

### `TemplateMetadataDialog`

Use a private contract equivalent to:

```typescript
interface TemplateMetadataDialogProps {
  open: boolean
  meta: TemplateMeta
  messages: EditorMessages
  onClose: () => void
}
```

The component must:

- return no visible dialog when `open` is false while keeping hook order valid;
- use the existing `template-metadata-dialog` ID, `role="dialog"`,
  `aria-modal="true"`, and `aria-labelledby="template-metadata-title"`;
- focus the close button after opening;
- close on `Escape`, close-button activation, and a click on the backdrop itself
  (not a click inside the dialog);
- restore the element that was active before opening after close/unmount;
- preserve the close button's localized accessible name and title;
- render `TemplateTags` before `TemplateMetadata`, with the same omission rules,
  labels, values, scrolling container, and dark/light classes;
- avoid adding a focus trap, portal, animation, or new dialog dependency—the
  current behavior does not provide those features.

`FrameKitEditor` should retain `metadataOpen` state and pass `onClose`; the
dialog should own its close ref and focus/Escape effect because those behaviors
belong to the dialog boundary. This leaves the orchestrator responsible for
whether the dialog is open, without duplicating lifecycle code.

## Implementation steps

1. **Inventory and baseline.** Run the current editor, export, state,
   navigation, package, and Studio tests. Confirm the existing public import
   `@mauriciodmo/framekit/editor` resolves `FrameKitEditor` and that Studio
   passes the unchanged props.
2. **Add `EditorHeader`.** Move only the current header JSX and action button
   classes/attributes into `components/editor-header.tsx`. Keep callbacks
   dumb: the component must not know how validation, upload, download, copy,
   or persistence works.
3. **Add `TemplateMetadataDialog`.** Move the modal JSX, `TemplateMetadata`,
   `TemplateTags`, close ref, and lifecycle effect together. Implement the
   existing focus capture, close-button focus, Escape listener cleanup,
   backdrop check, and focus restoration exactly once in this owner.
4. **Wire the orchestrator.** In `framekit-editor.tsx`, keep `metadataOpen`
   state, replace the old header markup with `EditorHeader`, and render
   `TemplateMetadataDialog` with `open={metadataOpen}` (the dialog returns
    `null` while closed). Pass `title={template.meta.title}` and only the
    relevant messages/state/callbacks to `EditorHeader`; pass
    `meta={template.meta}`, `messages`, and `onClose` to the dialog. Remove
    only imports and private code made unused by the move. Keeping the dialog
    mounted lets its effect own both open and close transitions without
    conditional hooks.
5. **Do not move shared coordination.** Leave `readFileAsBase64`,
   `uploadImage`, `runExport`, data validation/focus, export/copy calls,
   `exportRef`, `useEditorState`, `resolveTemplateData`, and the render wrapper
   in `FrameKitEditor`. Do not create `useEditorState`, `EditorControls`,
   `TemplatePreview`, `exportTemplate`, or `copyTemplate` replacements.
6. **Preserve public entry points.** Keep `editor.ts` exporting exactly the
   existing editor/navigation symbols and types. The new components stay
   internal and are imported only by `framekit-editor.tsx`.
 7. **Run and extend focused tests.** Retain the current high-level tests and
    add small direct tests for header callback/disabled behavior and dialog
    accessibility/lifecycle. Explicitly test Escape and focus restoration,
    which are present in the current implementation but not fully asserted by
    the existing modal test. Extend the existing invalid-export case only as
    needed to make validation-before-export observable (the mocked helper for
    that action must not be called when validation fails).
8. **Review the diff for ownership drift.** Confirm no field, preview, state,
   export, navigation, upload, or Studio implementation was copied or
   modified. Compare rendered attributes and callback arguments before and
   after the extraction.

## Behavior, accessibility, and public API invariants

- `FrameKitEditor` remains a named export from `@mauriciodmo/framekit/editor`
  with the same generic parameter and props, including optional
  `sidebarCollapsed`.
- Studio's `FrameKitStudio` continues to load/validate definitions, compare
  registry dimensions, and pass the same `template`, `definition`,
  `messages`, and `sidebarCollapsed` values.
- The editor still resolves data with the canonical resolver using the same
  selected variant, user edits, and asset manifest. A resolver failure still
  renders the same alert text and classes.
- `EditorControls` remains the sole owner of variant and field controls. Field
  ordering, defaults, draft number behavior, localized validation, image
  upload labels, and `data-field-key` focus lookup remain unchanged.
- Development upload remains disabled in production, posts the same JSON to
  `/__framekit/assets`, uses `common` or the selected variant with the same
  scope rule, reloads on success, sets the same localized field error on
  failure, and rethrows to the existing field owner.
- Export/copy still validate the resolved data before browser work, merge
  translated errors, focus the first visible invalid control, prevent
  concurrent actions with `exporting`, log/alert the same failures, and reset
  the busy state in `finally`.
- `exportTemplate` and `copyTemplate` remain the only export implementations;
  output remains PNG at declared definition dimensions and scale `1`, with the
  current slug-to-filename conversion and clipboard behavior.
- `exportRef` still points at the exact-size render wrapper, and
  `definition.render` receives the same `data`, `assets`, `variant`, `width`,
  and `height` values in the same wrapper.
- State persistence remains keyed by `framekit:${slug}:v2`; hydration,
  malformed-storage handling, variant isolation, reset behavior, rebase
  behavior, and localStorage failure tolerance remain unchanged.
- Header buttons retain `type="button"`, localized accessible names, disabled
  state, metadata dialog relationship, icon visibility, and the existing
  visual classes. No localization strings are added or hard-coded.
- The metadata dialog retains its role, modal/label relationships, IDs,
  close-button name/title, keyboard Escape behavior, backdrop behavior, focus
  on open, and focus restoration. The extraction must not accidentally add a
  focus trap or lose focus to the body.
- `./editor` exports do not expose the new internal header/dialog, and no new
  package subpath, dependency, state library, or compatibility layer is added.

## Tests: moved versus added

### Retained, not recreated

No existing test needs to be replaced by a snapshot or a new suite:

- `framekit-editor.test.tsx` stays the high-level contract suite. Its metadata
  open/close test remains useful because it proves header-to-dialog wiring;
  controls, validation/error, local-persistence, render-output, and copy-wiring
  coverage remain in this file. Its colocated `EditorField` and `NumberField`
  characterization cases also remain unless an import becomes unavailable.
- `export-template.test.ts` remains the capture/copy-helper suite.
- `state/editor-state.test.ts` remains the pure persistence/state suite.
- `framekit-navigation.test.tsx` and `navigation.test.ts` remain the navigation
  suites.

Only mechanical import/setup changes are acceptable if extraction makes a
previously private symbol unavailable. Do not move field or export assertions
into header/dialog tests.

### Added focused tests

Add these colocated tests without snapshots:

- `packages/framekit/src/editor/components/editor-header.test.tsx`
  - renders the title and localized action names;
  - hides the metadata trigger when `hasMetadata` is false;
  - invokes metadata/reset/export/copy callbacks;
  - disables only export/copy while exporting and uses the generating label;
  - preserves the dialog relationship attributes and button types.
- `packages/framekit/src/editor/components/template-metadata-dialog.test.tsx`
  - renders description, marketing description, and ordered tags;
  - omits optional sections when absent and renders nothing when closed;
  - focuses the close button after opening;
  - closes on Escape and removes the listener after close;
  - closes on the backdrop but not an inner-dialog click;
  - closes through the localized close button and restores the trigger focus;
  - preserves dialog role, modal state, title relationship, close label, and
    tags list label.

Keep the existing `FrameKitEditor` metadata test as the integration/wiring
check, and add only the lifecycle assertions that cannot be observed clearly
through the extracted component. Do not add visual snapshots.

## Focused tests

Run these while implementing:

```sh
pnpm --filter @mauriciodmo/framekit exec vitest run \
  src/editor/components/editor-header.test.tsx \
  src/editor/components/template-metadata-dialog.test.tsx \
  src/editor/framekit-editor.test.tsx \
  src/editor/export-template.test.ts \
  src/editor/state/editor-state.test.ts \
  src/editor/framekit-navigation.test.tsx \
  src/editor/navigation.test.ts
pnpm --filter @mauriciodmo/framekit build
pnpm --filter studio test -- src/test/framekit/generation.integration.test.ts
```

The focused run must prove both new component boundaries and the unchanged
orchestration paths. In particular, a passing header test alone is not enough:
the editor test must still cover validation-before-export, first-error focus,
local persistence, render output, and copy invocation.

## Full commands

From the repository root, after focused tests pass:

```sh
pnpm install --frozen-lockfile
pnpm format:check
pnpm check:runtime
pnpm --filter @mauriciodmo/framekit lint
pnpm --filter @mauriciodmo/framekit test
pnpm --filter @mauriciodmo/framekit typecheck
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
pnpm --filter studio lint
pnpm --filter studio test
pnpm --filter studio typecheck
pnpm --filter studio build
pnpm lint
pnpm test
pnpm typecheck
pnpm build
pnpm --filter @mauriciodmo/framekit pack --dry-run
pnpm --filter @mauriciodmo/create-framekit pack --dry-run
git diff --check
```

Build the reusable package before Studio or generated-consumer verification,
as required by the repository workflow. Do not edit generated registry output.

## Exit gate

Phase 3 is complete when:

- `FrameKitEditor` is a small orchestrator and the only new implementation
  files are justified header/dialog boundaries;
- no replacement exists for `EditorControls`, `TemplatePreview`,
  `useEditorState`, `exportTemplate`, or `copyTemplate`;
- upload, export, validation/error, state, render, and persistence coordination
  remains behaviorally owned by the orchestrator and existing helpers;
- `FrameKitEditor` props/generics, render contract, localization, accessibility,
  upload semantics, clipboard/download behavior, PNG output, state persistence,
  and `./editor` exports are unchanged;
- the rendered editor UI and runtime behavior are unchanged: extracted header
  and dialog markup, classes, attributes, event timing, and focus behavior match
  the baseline, and no visual redesign or runtime/API change is included;
- current tests remain in their owning suites, added tests are focused and
  non-snapshot-heavy, and Escape/focus behavior is directly covered;
- package, Studio, and repository-wide lint/test/typecheck/build commands pass.

## Rollback and review guidance

### Rollback

Revert the PR as one unit if the public editor import, callback arguments,
render wrapper, persisted state, upload request, export output, or dialog focus
behavior changes. If only a new component test is unstable, fix the test or
remove the unnecessary direct test rather than changing production behavior.

### Review checklist

- Inspect the full existing editor inventory before accepting any additional
  extraction. A new abstraction must have a current, independently testable
  owner; “smaller file” alone is not sufficient.
- Confirm header/dialog props are presentation callbacks and do not duplicate
  state, data resolution, validation, upload, or export logic.
- Compare all header/dialog ARIA attributes, labels, IDs, button disabled rules,
  and classes with the baseline.
- Verify the dialog captures the pre-open active element, focuses close, handles
  Escape once, cleans up, and restores focus.
- Verify `runExport` still owns validation and first-visible-control focus, and
  that the existing helpers still receive the same element and dimensions.
- Verify the exact render wrapper and `definition.render` call remain in the
  orchestrator.
- Confirm `editor.ts` has no new public exports and Studio has no source change.
- Confirm the PR changes only the permitted editor files; no generated output or
  unrelated source is included.

## Out of scope

- Recreating or renaming `EditorControls`, `TemplatePreview`, `useEditorState`,
  `exportTemplate`, `copyTemplate`, field components, navigation, or state
  helpers.
- Moving upload/export/error coordination merely to reduce line count.
- Changing `FrameKitEditor` props, generic inference, JSX render contract,
  wrapper dimensions, asset precedence, selected variant, or render timing.
- Changing localStorage keys, persistence schema, hydration/rebase behavior,
  clipboard/download semantics, filename rules, or export dimensions/scale.
- Changing upload endpoints, payload fields, environment gating, reload
  behavior, error messages, or image scope semantics.
- Adding a focus trap, portal, animation, modal library, state library,
  localization strings, package subpath, compatibility layer, or package split.
- Snapshot-heavy visual testing, broad UI redesign, accessibility behavior not
  present in the current component, or unrelated Studio/navigation refactors.
- Editing validation logic, source code outside the editor scope, generated
  files, package configuration, tests outside the permitted scope, or skills.
