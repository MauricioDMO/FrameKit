# Public API Reference

## Entry Points and Exports

### `@mauriciodmo/framekit` (root)

The root entry point provides the core runtime API for defining, validating, and rendering templates, along with all associated types.

The canonical definition uses `meta`, `width`, `height`, `fields`, `variants`,
field-only `content`, and `render({ data, assets, variant, width, height })`.
`meta` requires a non-empty `title` and may include `description`,
`marketingDescription`, and `tags`. See the [template contract](./template-contract.md)
for the full shape, and [GitHub issue #3](https://github.com/MauricioDMO/FrameKit/issues/3)
for the metadata contract.

The semantic field contract is defined by [GitHub issue #5](https://github.com/MauricioDMO/FrameKit/issues/5).
The choice field contract is defined by [GitHub issue #6](https://github.com/MauricioDMO/FrameKit/issues/6).
The boolean field contract is defined by [GitHub issue #7](https://github.com/MauricioDMO/FrameKit/issues/7).
The number field contract is defined by [GitHub issue #8](https://github.com/MauricioDMO/FrameKit/issues/8).

`field.number` requires a finite numeric `defaultValue`, does not accept
`required`, and supports the native `input` control by default or the native
`slider` control when explicit finite `min` and `max` bounds are supplied. Any
supplied `min` and `max` bounds must be finite and ordered, and `step` must be
finite and positive; it defaults to `1` with native numeric/range semantics. Number content, edits,
resolved data, and render props are finite numbers. Numeric strings are rejected
without coercion, and an incomplete local editor draft is not render data.

**Runtime exports**

| Export                       | Description                                                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `defineTemplate`             | Defines and validates the versionless canonical template shape with metadata, fields, variants, content, and a render function                                                |
| `defineTemplateBase`         | Defines and validates a template base without a render function                                                                                                                |
| `field`                      | Collection of field descriptor builders (`field.text`, `field.color`, `field.number`, `field.image`, `field.choice`, `field.boolean`)                                      |
| `Markdown`                   | Renders supported markdown content with inline formatting and optional lists                                                                                                   |
| `validateTemplateBase`       | Validates the canonical template shape without requiring a render function                                                                                                    |
| `validateTemplateData`       | Validates template data against a template definition                                                                                                                          |
| `validateTemplateDefinition` | Validates the structural integrity of a template definition                                                                                                                    |
| `resolveTemplateData`        | `resolveTemplateData(definition, variant, edits, assets?)`; applies defaults -> variant content -> user edits, then image assets                                |
| `getVariants`                | `getVariants(definition: TemplateBase): string[]`; returns the content variant keys of `definition.content`                                                                     |
| `getDefaultValues`           | `getDefaultValues(fields: Record<string, FieldDescriptor>): Record<string, string \| number \| boolean>`; extracts field defaults                                          |

**Type exports**

| Type                          | Description                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `TemplateFieldKind`           | Discriminant union type for field kinds: `"text"` \| `"color"` \| `"number"` \| `"image"` \| `"choice"` \| `"boolean"`       |
| `ImageFieldScope`             | Scope for image assets: `"common"` \| `"variant"`                                                   |
| `BaseFieldDescriptor`         | Base shape shared by text, color, and image field descriptors                                           |
| `FieldDescriptor`             | Full field descriptor union across all field kinds                                                      |
| `TextFieldDescriptor`         | Descriptor for multiline text fields, including optional `minLength` and `maxLength`                         |
| `ColorFieldDescriptor`        | Descriptor for color fields                                                                             |
| `NumberFieldDescriptor`       | Descriptor for number fields with a required finite numeric default, optional finite bounds and step, and native input/slider control                         |
| `ImageFieldDescriptor`        | Descriptor for project-backed image fields                                                             |
| `ChoiceFieldDescriptor`       | Descriptor for ordered closed-set string options and a required default value                          |
| `BooleanFieldDescriptor`      | Descriptor for binary values with an optional boolean default (`false` when omitted); Studio uses a native checkbox |
| `TemplateAssetManifest`       | Generated common and variant asset URL maps                                                            |
| `TemplateMeta`                | Exact metadata object with required `title` and optional `description`, `marketingDescription`, and `tags` |
| `TemplateVariants`             | Default content variant and optional display labels                                                  |
| `TemplateContent`              | Variant-keyed record of field-only content values                                                   |
| `TemplateContentEntry`        | Partial field-value record for one content variant                                                  |
| `TemplateBase`                | Base type for a template containing field definitions                                                   |
| `TemplateDefinition`          | Complete template definition combining base structure with configuration                                |
| `TemplateRenderProps`         | Props passed to a template's render function, including finite numbers for number fields                |
| `TemplateRegistryEntry`       | Canonical entry in the generated template registry, with metadata, dimensions, variants, assets, and a dynamic loader |
| `InferTemplateData<T>`        | Utility type that extracts the data shape from a template definition                                    |
| `TemplateDataValidationError` | Per-field validation error union used by `validateTemplateData`                                        |

---

### Generated template registry

The optional `framekit generate` command writes the project-local module
`src/generated/framekit/templates.ts`. Its only runtime export is
`templates: TemplateRegistryEntry[]`:

```ts
export const templates: TemplateRegistryEntry[] = [
  {
    slug,
    segments,
    meta,
    width,
    height,
    variants,
    variantKeys,
    assets,
    load: () => import("..."),
  },
]
```

Each entry contains `slug`, `segments`, validated `meta`, `width`, `height`,
`variants`, declaration-ordered `variantKeys`, `assets`, and the dynamic `load`
loader, whose promise resolves to a module with the template definition as its
default export. The template title is `meta.title`; there is no top-level
`title` field. `meta.title` supplies Studio's navigation
label and selected editor heading; when present, Studio also displays the
optional `description`, `marketingDescription`, and `tags`. The registry's
dimensions, variants, asset manifest, and lazy loader are passed through the
Studio load boundary. This is project-local generated output, not an export of
a published package entry point. See [GitHub issue #12](https://github.com/MauricioDMO/FrameKit/issues/12)
and [GitHub issue #13](https://github.com/MauricioDMO/FrameKit/issues/13).

`framekit generate` is the explicit one-off regeneration command; it writes
`src/generated/framekit/templates.ts` and `src/generated/framekit/brands.ts`.
`framekit dev` generates them initially and
regenerates them when paths under `src/templates` or `src/brand` change.
`framekit check` generates first, then validates every definition and the data
resolved for each content variant with its discovered assets. `framekit build`
runs `check` before the production build and copies the standalone public and
Next static assets on success. `framekit start` does not generate; it requires a
production standalone build and starts its server.

---

### `@mauriciodmo/framekit/editor`

Provides the `FrameKitEditor` component and supporting navigation utilities for the in-app editing experience.

`FrameKitEditor` receives the canonical `template: TemplateRegistryEntry` plus
the loaded `definition` and `messages` (and optional `sidebarCollapsed`). The
registry entry supplies the editor's `slug` and `assets`; callers do not pass
separate `slug` or `assets` props.

**Runtime exports**

| Export                 | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `FrameKitEditor`       | React component that renders the template editing interface   |
| `FrameKitNavigation`   | React component that renders the template navigation tree     |
| `humanizeSegment`      | Converts a path segment into a human-readable label           |
| `manifestToNavigation` | Converts template or brand registry entries into a navigation tree structure |

**Type exports**

| Type                       | Description                                         |
| -------------------------- | --------------------------------------------------- |
| `EditorMessages`           | Message catalog type for editor UI strings          |
| `TemplateNavigationFolder` | Navigation node representing a folder               |
| `TemplateNavigationItem`   | Navigation node representing a single template item |
| `TemplateNavigationNode`   | Union type covering all navigation node types       |

---

### `@mauriciodmo/framekit/studio`

Provides the `FrameKitStudio` component, which combines editor and navigation into a complete studio interface, along with localization utilities.

Its main component accepts either `{ templates: readonly TemplateRegistryEntry[], brands?: readonly FrameKitStudioBrand[] }` or
`{ templates?: readonly TemplateRegistryEntry[], brands: readonly FrameKitStudioBrand[] }`;
at least one catalog is required, and an omitted catalog defaults to an empty
array.
The generated `templates` array can be passed directly to `FrameKitStudio`
without an adapter:

```tsx
import { templates } from './generated/framekit/templates'
import { FrameKitStudio } from '@mauriciodmo/framekit/studio'

<FrameKitStudio templates={templates} />
```

Studio starts with `definition.variants.default`. Variant keys are generic content
keys, not language identifiers; option labels use
`definition.variants.labels?.[key] ?? key`. The Studio interface locale is an
independent EN/ES setting and does not select or change a template variant.

The six built-in field controls preserve typed values: text uses a native
`textarea`, choice a native `select`, boolean a native checkbox, number its
declared native number or range input, color its color control, and image its
project-asset control. Strings remain strings, numbers remain finite numbers,
and booleans remain booleans. Temporary number drafts stay inside the number
control and are not passed to the template render function.

Editor edits persist per template and variant under `framekit:<slug>:v2`.
Older state is intentionally invalidated rather than migrated. Preview and render
use committed typed values; download and copy validate the current committed data
before producing output and focus the first invalid control.

See the [brand catalog reference](./brand-catalog.md) for the `src/brand`
discovery contract, generated registries, and `/brand` behavior.

**Runtime exports**

| Export              | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `FrameKitStudio`    | React component that composes the full studio experience |
| `frameKitMessages`  | Pre-defined message catalog for studio UI strings        |
| `getFrameKitLocale` | Resolves a supported locale from an optional locale value |

**Type exports**

| Type                     | Description                                |
| ------------------------ | ------------------------------------------ |
| `FrameKitStudioBrand`    | Brand catalog entry with `slug`, `title`, `segments`, `description`, and a preview loader |
| `FrameKitLocale`         | Locale type used within the studio         |
| `FrameKitStudioMessages` | Message catalog type for studio UI strings |

`FrameKitBrandCatalog` is an internal implementation component. It is not
exported from `@mauriciodmo/framekit/studio` or from a package export path, so
it is not part of the public API. The generated project's `brands`,
`brandManifest`, and `brandRegistry` values are likewise project-local
generated output, not exports of the `@mauriciodmo/framekit` package.

---

### `@mauriciodmo/framekit/studio/root`

**Runtime exports**

| Export               | Description                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `FrameKitStudioRoot` | Server component that bootstraps the studio; must be used in server components or layouts only. Do not import in client-side code. |

Signature: `FrameKitStudioRoot({ children, htmlClassName? }: { children: React.ReactNode, htmlClassName?: string })`. It emits the complete `<html>`, `<head>`, and `<body>` shell, so a root layout using it must not nest another document shell.

---

### `@mauriciodmo/framekit/dev`

Advanced server-side utilities for development workflows including dev server spawning, template discovery, code generation, and file watching. These entry points are server-side only.

**Runtime exports**

| Export                 | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `createDevServer`      | Spawns a development server instance                      |
| `findTemplates`        | Scans the filesystem for template modules                 |
| `findBrandComponents`  | Scans a brand directory for brand component leaves       |
| `collectTemplateSummaries` | Loads and validates serializable template summaries   |
| `createTemplateModule` | Generates the template registry module source from discovered templates |
| `createBrandModule`    | Generates the brand metadata and loader module            |
| `writeTemplateModule`  | Writes generated template and brand modules to disk       |
| `watchTemplates`       | Watches template and brand paths for changes and triggers callbacks |
| `getServerOptions`     | Resolves server configuration options                     |

**Type exports**

| Type                 | Description                                    |
| -------------------- | ---------------------------------------------- |
| `DevServer`          | Dev server instance type                       |
| `DevServerOptions`   | Options for creating a dev server              |
| `DiscoveredTemplate` | Template discovered during filesystem scanning |
| `DiscoveredBrandComponent` | Brand component discovered during filesystem scanning |
| `TemplateSummary`    | Serializable template metadata used by codegen |
| `TemplateWatcher`    | Watcher instance returned by `watchTemplates`  |

`createTemplateModule(templates, { outputDirectory, assetsBySlug, summariesBySlug })`
returns the source for the generated template registry. It uses each discovered
template's `slug` and `segments`, the supplied summary and asset manifest (or an
empty manifest), and a lazy loader for the template module; it throws if a
template has no corresponding summary. `writeTemplateModule` discovers the
templates and brands, gathers summaries and assets, writes both generated
modules, and synchronizes template assets under `public/__framekit/templates`.

---

### `@mauriciodmo/framekit/styles.css`

Import this stylesheet in your Next.js layout or global CSS file to apply FrameKit's base styles:

```css
@import "@mauriciodmo/framekit/styles.css";
```

Or via a CSS link in your layout:

```tsx
import "@mauriciodmo/framekit/styles.css";
```

---

## Peer Dependencies

FrameKit's peer dependencies are:

- **Next.js**: `>=16 <17`
- **React** and **React DOM**: `>=19 <20`

These are peer requirements. The package will emit a warning during installation if the installed versions do not satisfy the constraints, but installation will not be blocked.

---

## Browser vs. Server Suitability

| Export                                                   | Side             | Reason                                                                                             |
| -------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------- |
| `FrameKitEditor`, `FrameKitStudio`, `FrameKitNavigation` | Client           | Interactive React components that manage state and respond to user input                           |
| `Markdown`                                               | Server or client | Pure React rendering component; the implementation uses no browser-only APIs                       |
| `FrameKitStudioRoot`                                     | Server           | Uses `next/headers` for request-level APIs; must only be used in server components or layouts      |
| `@mauriciodmo/framekit/dev` entry points                 | Server           | Dev server, template discovery, code generation, and file watching are all server-side operations  |

---

## Package Properties

- **Module system**: ESM-only (`"type": "module"` in `package.json`). There is no CommonJS export.
- **Published files**: `bin/`, `dist/`, `README.md`, `LICENSE`
- **CLI**: `bin/framekit.js` is the entry point for the `framekit` command-line executable

[Español](../../es/reference/public-api.md) · [GitHub issue #13](https://github.com/MauricioDMO/FrameKit/issues/13)
