# Phase 4 - Studio Shell Responsibility Split

## Status

- **Status:** Proposed; not yet implemented.
- **PR boundary:** One behavior-preserving Studio refactor, separate from
  Phase 5's token migration.
- **Public API:** `FrameKitStudio`, `./studio`, and `./studio/root` remain
  unchanged.

## Depends on

- **Sequencing dependency:** Phase 3 must be merged first, as promised by the
  ordered roadmap.
- **Code dependency:** The extracted shell must consume the stable
  `FrameKitEditor` contract and existing editor owners from Phase 3; Phase 3
  does not introduce another public Studio-facing interface. No Phase 5 source
  change is required.
- The current canonical Studio contract, generated registries, and public
  `./studio` and `./studio/root` entry points.
- Existing `FrameKitEditor`, `FrameKitNavigationTree`, `manifestToNavigation`,
  `FrameKitBrandCatalog`, locale provider, and root modules.

## Goal

Reduce `framekit-studio.tsx` to a public orchestration facade. Extract only
the coherent owners already visible in the file: the shell/sidebar, the async
resource boundary, settings, and the loading/empty/not-found/message states.
Keep the existing editor, navigation, brand catalog, locale provider, and root
modules as the owners of their current contracts.

The result is an internal component split, not a public API change. The
facade remains the implementation behind `FrameKitStudio` and continues to
select `/editor` versus `/brand`, load the selected resource, and compose the
editor or brand catalog.

## Current baseline

- `packages/framekit/src/studio/framekit-studio.tsx` currently combines route
  interpretation, locale consumption, sidebar/settings state, async template
  and brand loading, template validation, content-state selection, and all
  sidebar/state markup.
- `FrameKitStudio` accepts the union requiring at least one of
  `templates` or `brands`; defaults omitted manifests to stable empty arrays.
- The route is read with `useParams` and `usePathname`. A slug is the joined
  parameter segments; a pathname equal to `/brand` or beginning with
  `/brand/` selects the brand branch.
- `manifestToNavigation` receives the selected manifest and `/editor` or
  `/brand`; `FrameKitNavigationTree` owns persisted folder expansion,
  selection, keyboard behavior, and focus styling.
- The template branch calls `entry.load()`, runs
  `validateTemplateDefinition`, and rejects a loaded definition when its
  width or height differs from the registry entry. The brand branch loads the
  default component without template validation.
- Both asynchronous branches use a `cancelled` flag in the effect cleanup,
  so a previous route cannot commit a later result after navigation.
- `FrameKitBrandCatalog` already owns brand preview presentation. The locale
  provider owns the interface locale and its cookie; `FrameKitStudioRoot`
  owns server cookie/header selection, the theme bootstrap script, and the
  document shell.

## Exact current-to-target map

| Current symbol/file | Target owner | Required change |
| --- | --- | --- |
| `FrameKitStudioBrand`, `TemplateRegistryEntry`, and the props union in `studio/framekit-studio.tsx` | `studio/framekit-studio.tsx` | Keep the brand type and consume the canonical registry entry directly in the facade. Keep the same public Studio exports through `studio.ts`. |
| `emptyTemplates`, `emptyBrands`, and `navigation` in `FrameKitStudio` | `studio/framekit-studio.tsx` | Keep stable empty defaults and compute `manifestToNavigation(isBrand ? brands : templates, isBrand ? '/brand' : '/editor')` in the facade; pass the resulting tree to the shell. |
| `useParams`, `usePathname`, `slug`, `isBrand`, and `messages` in `FrameKitStudio` | `studio/framekit-studio.tsx` | Keep route and locale interpretation in the facade; do not make the shell infer route kind or create a second locale lookup. |
| `LoadState` and the `useEffect` in `FrameKitStudio` | New `studio/use-studio-resource.ts` | Move the route-kind-aware load state and effect into `useStudioResource`. Keep the `loading`, `not-found`, `error`, `invalid`, and both `ready` shapes. Preserve cancellation cleanup, template validation, and registry dimension comparison. |
| `sidebarCollapsed` state and the value needed by `FrameKitEditor` | `studio/framekit-studio.tsx` | Keep this state in the facade because it is an input to the editor. Pass the value and an `onToggleSidebar` callback to the shell. |
| `settingsOpen`, `setSettingsOpen`, and the sidebar JSX in `FrameKitStudio` | New `studio/framekit-studio-shell.tsx` | `FrameKitStudioShell` owns the outer grid, `<aside>`, route tabs, navigation slot, collapsed rail, footer, and `<main>{children}</main>`. Its sidebar toggle closes settings exactly as today. |
| `toggleTheme` and the settings popup JSX | New `studio/framekit-settings.tsx` | `FrameKitStudioSettings` owns the settings popup and theme cookie/class toggle. It accepts locale, messages, and an `onLocaleChange` callback; it does not create a second locale provider. |
| `LoadingState`, `EmptyState`, `NotFoundState`, `MessageState` | New `studio/studio-states.tsx` | Move these private components. Pass the already-read messages from the facade; do not make the state file discover a different locale or add fallback copy. |
| `FrameKitNavigationTree` and `manifestToNavigation` | Existing `editor/framekit-navigation.tsx` and `editor/navigation.ts` | Reuse without moving or duplicating them. The shell receives the computed navigation and renders the existing tree. |
| `FrameKitBrandCatalog` | Existing `studio/brand-catalog.tsx` | Reuse unchanged in this phase; the facade still passes the loaded component and `messages.brand`. |
| `content` selection chain in `FrameKitStudio` | `studio/framekit-studio.tsx` plus `studio/studio-states.tsx` | Keep the discriminated ordering: empty route, loading, ready template, ready brand, invalid, error, then not-found. The facade supplies `children` to the shell. |
| `useFrameKitLocale` / `FrameKitLocaleProvider` | Existing `studio/locale-provider.tsx` | Keep the provider boundary and cookie behavior unchanged. `FrameKitStudio` reads the locale/messages once and passes messages to extracted owners; the settings owner delegates locale changes to the provider callback rather than writing a second locale cookie. |
| `FrameKitStudioRoot` | Existing `studio/root.tsx`, re-exported by `studio-root.ts` | No ownership change. Preserve the theme bootstrap, `lang`, `locale`, and theme cookies. |
| `FrameKitStudio` composition | Existing `studio/framekit-studio.tsx` | Retain route derivation, `useStudioResource`, content discriminant, editor/brand selection, and shell composition. It should no longer contain sidebar/settings/state markup. |
| First-party route pages | `apps/studio/src/app/editor/[[...slug]]/page.tsx`, `apps/studio/src/app/brand/[[...slug]]/page.tsx` | No API adapter. Continue passing generated `templates` and `brands` directly. |
| Canonical-template route pages | `packages/create-framekit/template/src/app/editor/[[...slug]]/page.tsx`, `packages/create-framekit/template/src/app/brand/[[...slug]]/page.tsx` | No API adapter. Continue passing the generated single-manifest prop directly. |
| Export surfaces | `packages/framekit/src/studio.ts`, `packages/framekit/src/studio-root.ts`, `packages/framekit/package.json` | No export or package condition change. `./studio` still exposes `FrameKitStudio`, public manifest types, and messages; `./studio/root` still exposes `FrameKitStudioRoot`. |
| Existing tests | `studio/framekit-studio.test.tsx`, `studio/brand-catalog.test.tsx`, `editor/framekit-navigation.test.tsx`, `tests/types/studio-props.ts` | Extend these existing suites at the public facade/component boundary. Prefer `studio/framekit-studio.test.tsx` for route/resource races, settings/collapse interaction, and the observable content branches (empty route, loading, not-found, invalid, loader error for both kinds, ready template, and ready brand); retain the brand/navigation and type-union coverage. No new focused test files are prescribed because the existing integration boundary can exercise the extracted owners. |

### Target internal interfaces

Use the smallest props that make ownership explicit; these are internal and
must not be exported from `@mauriciodmo/framekit/studio`.

```ts
// Conceptual shape; use the repository's existing message and navigation types.
type FrameKitStudioShellProps = {
  isBrand: boolean
  navigation: readonly TemplateNavigationNode[]
  messages: FrameKitStudioMessages
  locale: FrameKitLocale
  onLocaleChange: (locale: FrameKitLocale) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  children: React.ReactNode
}

type FrameKitStudioSettingsProps = {
  open: boolean
  locale: FrameKitLocale
  messages: FrameKitStudioMessages
  onLocaleChange: (locale: FrameKitLocale) => void
}

type StudioResourceInput = {
  slug: string | undefined
  isBrand: boolean
  templates: readonly TemplateRegistryEntry[]
  brands: readonly FrameKitStudioBrand[]
}
```

`useStudioResource` may keep `LoadState` private to the module, but its return
value must remain discriminated enough for the facade to pass the exact
loaded template definition or brand component to the existing consumers.
`FrameKitStudioShell` owns its own `settingsOpen` state and settings trigger;
it passes `open`, `locale`, `messages`, and `onLocaleChange` to
`FrameKitStudioSettings`. The shell's sidebar toggle must close that state.
`FrameKitStudioSettings` owns only the popup markup and theme side effect; it
does not own or recreate locale state.

## Exact implementation steps

1. Record the current focused test baseline and inspect the public declaration
   output for `./studio` and `./studio/root`. Do not begin by changing an
   export or renaming a public type.
2. Add `studio/use-studio-resource.ts`. Move the current `LoadState` and
   effect logic with the two explicit branches. Keep the dependency set
   equivalent to `[slug, isBrand, templates, brands]`, the initial loading
   state, the no-slug no-load path, and the not-found path. Return the cleanup
   that marks the request cancelled before starting another one; do not add a
   cache, abort-controller contract, retry policy, or global loading store.
3. Add `studio/studio-states.tsx` and move the four current private state
   components. Pass `messages` from the facade so empty, loading, not-found,
   and alert text remains localized and unchanged. Preserve `aria-busy`,
   `aria-label`, `role="alert"`, route-specific back links, and the current
   light/dark class behavior.
4. Add `studio/framekit-settings.tsx`. Move the settings panel markup and
   `toggleTheme` behavior. Preserve the `sidebar-settings` id, `aria-controls`,
   `aria-expanded`, 44px minimum button target, theme cookie, and document
   `dark` class toggle. Route the language select through the
   `onLocaleChange` callback so the existing locale provider remains the owner
   of the interface-locale cookie and `document.documentElement.lang` update.
5. Add `studio/framekit-studio-shell.tsx`. Move the outer layout and sidebar
   markup. Keep route links, `aria-current`, the collapsed rail, logo path,
   `FrameKitNavigationTree`, footer link, responsive grid widths, and settings
   close-on-sidebar-toggle behavior. Render the settings owner rather than
   duplicating its panel.
6. Reduce `FrameKitStudio` to route detection, locale/message acquisition,
   `useStudioResource`, content discriminant selection, and the shell call.
   Preserve `key={slug}` on `FrameKitEditor` and all current props passed to
   `FrameKitEditor` and `FrameKitBrandCatalog`.
7. Keep `brand-catalog.tsx`, `locale-provider.tsx`, `root.tsx`, navigation, and
   editor modules in place. Remove only imports and private definitions made
   unused by the split; do not rename public files or add compatibility
   wrappers.
 8. Extend the mapped existing tests for the extracted boundaries: route-kind
     selection, empty route, loading, unknown slug, loader rejection for both
     resource kinds, stale promise resolution after route/kind/manifest changes,
     invalid template, and registry dimension mismatch; settings locale/theme
     persistence and collapse interaction; and both ready content owners. Prefer
     the existing `FrameKitStudio` test wrapper for integration coverage; do not
     add a direct component test when that wrapper already observes the behavior.
9. Verify the first-party app and a generated canonical-template consumer
   without adding scripts to the template. The template currently defines
   `dev`, `build`, `start`, and `check` only; do not claim template lint, test,
   or typecheck support.
10. Review the diff for public declaration changes and confirm that the
    implementation PR contains only the mapped sources, existing tests, and
    internal new modules.

## Invariants

- `FrameKitStudio` remains a client component and retains the same union
  props: `{ templates }`, `{ brands }`, or `{ templates, brands }`; `{}` stays
  a type error.
- `/editor`, `/editor/:slug`, `/brand`, and `/brand/:slug` route behavior is
  unchanged. Empty manifests render the existing empty state rather than a
  loader or a new catalog.
- A stale template or brand promise cannot commit after route, kind, or
  manifest changes. Unmount cleanup remains effective.
- Template definitions are validated after loading, and loaded dimensions must
  exactly match the registry entry. Brand modules are still treated as
  previews and are not passed through template validation.
- Navigation still uses `manifestToNavigation` and `FrameKitNavigationTree`;
  folder persistence, nested expansion, selected links, keyboard operation,
  visible focus, and accessible labels remain owned by those modules.
- `FrameKitStudioRoot` still reads the locale cookie/header, sets the document
  language, bootstraps the theme before hydration, and preserves the
  `./studio/root` export.
- Sidebar collapse still changes the editor control layout through
  `sidebarCollapsed`; opening settings and changing interface locale do not
  reset the selected template variant or editor state.
- No loader error string, template data error, or private exception is exposed
  in place of the existing localized messages.

## Tests and commands

Run from the repository root with Node.js `>=22.13.0` and pnpm `11.14.0`, after
Phases 1–3 have supplied the shared repository checks:

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

For the canonical-template consumer, build and pack the local public runtime,
build the creator, create an isolated project with the existing non-interactive
CLI, install the packed runtime into that generated project, then run only
commands the generated project actually provides. The local tarball step is
required; a plain install would resolve the template's published `0.8.1`
dependency and could miss the runtime under test.

```sh
rm -rf "/tmp/framekit-phase-4-package" "/tmp/framekit-phase-4-consumer"
mkdir -p "/tmp/framekit-phase-4-package"
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/framekit pack --pack-destination "/tmp/framekit-phase-4-package"
pnpm --filter @mauriciodmo/create-framekit build
node "packages/create-framekit/dist/cli.js" "/tmp/framekit-phase-4-consumer" -n
pnpm --dir "/tmp/framekit-phase-4-consumer" add --save-exact "/tmp/framekit-phase-4-package/"*.tgz
pnpm --dir "/tmp/framekit-phase-4-consumer" exec framekit generate
pnpm --dir "/tmp/framekit-phase-4-consumer" exec framekit check
pnpm --dir "/tmp/framekit-phase-4-consumer" exec framekit build
```

The exact first-party verification is `pnpm --filter studio test`,
`pnpm --filter studio typecheck`, and `pnpm --filter studio build`; it uses
`apps/studio/src/app/**` and generated first-party registries. The exact
canonical-template verification is the isolated command sequence above; its
route pages must continue to import `@mauriciodmo/framekit/studio` and pass
generated manifests directly.

## Visual and integration checks

- In the first-party Studio, open `/editor` and `/brand` with their populated
  generated registries. Check expanded/collapsed desktop sidebar, mobile
  stacked layout, route-tab current state, navigation folder persistence,
  settings popup positioning, and visible keyboard focus. Exercise empty
  manifests through the existing `FrameKitStudio` test wrapper; the current
  first-party route pages always pass generated manifests.
- Open one valid template and one brand component from generated registries.
  Confirm the loading state resolves to the correct existing content owner.
- Navigate quickly between two lazy routes whose loaders resolve in reverse
  order. The visible route must keep its own content.
- Exercise a bad loader for each resource kind, an invalid template definition,
  and a registry dimension mismatch through the facade boundary. Confirm the
  localized alert states remain distinct and private loader errors are not
  rendered.
- Repeat the same route and settings checks in the generated canonical
  consumer after `generate`, `check`, and `build`; do not substitute a claim
  that the template has lint, test, or typecheck scripts.
- Run an accessibility smoke with keyboard-only navigation and inspect the
  sidebar, settings control, loading label, and alert semantics.

## Exit gate

Phase 4 is complete when:

- `framekit-studio.tsx` is a small orchestration facade and the four requested
  responsibilities have one coherent internal owner each.
- All existing focused behavior and public type/export checks pass, including
  race cancellation, validation/dimension rejection, locale/theme cookies,
  sidebar/settings interaction, and accessible states.
- First-party Studio and the canonical generated consumer pass their exact
  command sequences and visual/integration checks.
- No public prop, route, module export, generated file, or consumer adapter was
  added or changed.

## Rollback and review guidance

- Review the diff by responsibility: resource lifecycle, state rendering,
  settings/browser side effects, and shell markup. A facade diff should mostly
  be imports, hook calls, and composition.
- If a behavior regression appears, revert the extraction commit/module by
  module and restore the corresponding private function in the facade; do not
  change the public union or add a compatibility layer.
- Review asynchronous cleanup and route dependencies first. A stale result,
  an accidental state reset, or a changed initial loading state is a blocker.
- Confirm generated `dist/` and `.framekit/` output is not hand-edited or
  committed as part of the implementation.

## Out of scope

- Public component/package split, new exports, prop aliases, route changes, or
  a consumer migration.
- New navigation search/filter/catalog behavior, navigation persistence format,
  loader cache, retry, suspense boundary, server-side resource loading, or
  global state management.
- Changes to template validation rules, manifest metadata, editor state,
  variant semantics, asset upload, export/copy behavior, brand component
  rendering, or locale message content.
- Visual redesign, palette replacement, Tailwind migration, or token naming;
  those belong to Phase 5.
- Editing generated files, `dist/`, or documentation unrelated to Phase 4.
