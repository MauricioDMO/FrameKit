# Public API Reference

## Entry Points and Exports

### `@mauriciodmo/framekit` (root)

The root entry point provides the core runtime API for defining, validating, and rendering templates, along with all associated types.

The canonical definition uses `meta`, `width`, `height`, `fields`, `variants`,
field-only `content`, and `render({ data, assets, variant, width, height })`.
`meta` requires a non-empty `title` and accepts only `description`,
`marketingDescription`, and `tags` in addition. See the [template contract](./template-contract.md)
for the full shape and its Studio/server-rendering boundary, and [GitHub issue #3](https://github.com/MauricioDMO/FrameKit/issues/3)
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
| `getVariants`                | `getVariants(definition: TemplateDefinition): string[]`; returns the content variant keys of `definition.content`                                                             |
| `getDefaultValues`           | `getDefaultValues(fields: Record<string, FieldDescriptor>): Record<string, string \| number \| boolean>`; extracts field defaults                                          |

**Type exports**

| Type                          | Description                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `TemplateFieldKind`           | Discriminant union type for field kinds: `"text"` \| `"color"` \| `"number"` \| `"image"` \| `"choice"` \| `"boolean"`       |
| `ImageFieldScope`             | Scope for image assets: `"common"` \| `"variant"`                                                   |
| `BaseFieldDescriptor`         | Base shape shared by all field descriptors                                                              |
| `FieldDescriptor`             | Full field descriptor union across all field kinds                                                      |
| `TextFieldDescriptor`         | Descriptor for multiline text fields, including optional `minLength` and `maxLength`                         |
| `ColorFieldDescriptor`        | Descriptor for color fields                                                                             |
| `NumberFieldDescriptor`       | Descriptor for number fields with a required finite numeric default, optional finite bounds and step, and native input/slider control                         |
| `ImageFieldDescriptor`        | Descriptor for project-backed image fields                                                             |
| `ChoiceFieldDescriptor`       | Descriptor for ordered closed-set string options and a required default value                          |
| `BooleanFieldDescriptor`      | Descriptor for binary values with an optional boolean default; Studio uses a native checkbox           |
| `TemplateAssetManifest`       | Generated common and variant asset URL maps                                                            |
| `TemplateMeta`                | Exact metadata object with required `title` and optional `description`, `marketingDescription`, and `tags` |
| `TemplateVariants`             | Default content variant and optional display labels                                                  |
| `TemplateContent`              | Variant-keyed record of field-only content values                                                   |
| `TemplateContentEntry`        | Partial field-value record for one content variant                                                  |
| `TemplateBase`                | Base type for a template containing field definitions                                                   |
| `TemplateDefinition`          | Complete template definition combining base structure with configuration                                |
| `TemplateRenderProps`         | Props passed to a template's render function, including finite numbers for number fields                |
| `TemplateRegistryEntry`       | Entry in the generated template registry, with metadata, dimensions, variants, assets, and a dynamic loader |
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

Each entry contains `slug`, `segments`, `meta`, `width`, `height`, `variants`,
`variantKeys`, `assets`, and the dynamic `load` loader, whose promise resolves
to a module with the template definition as its default export. The generated
module has no top-level `title`, `templateManifest`, or `templateRegistry`;
the template title is `meta.title`. This is project-local generated output,
not an export of a published package entry point. See [GitHub issue #12](https://github.com/MauricioDMO/FrameKit/issues/12).

---

### `@mauriciodmo/framekit/editor`

Provides the `FrameKitEditor` component and supporting navigation utilities for the in-app editing experience.

**Runtime exports**

| Export                 | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `FrameKitEditor`       | React component that renders the template editing interface   |
| `FrameKitNavigation`   | React component that renders the template navigation tree     |
| `humanizeSegment`      | Converts a path segment into a human-readable label           |
| `manifestToNavigation` | Converts a template manifest into a navigation tree structure |

**Type exports**

| Type                       | Description                                         |
| -------------------------- | --------------------------------------------------- |
| `EditorMessages`           | Message catalog type for editor UI strings          |
| `TemplateManifestEntry`    | Entry in a template manifest                        |
| `TemplateNavigationFolder` | Navigation node representing a folder               |
| `TemplateNavigationItem`   | Navigation node representing a single template item |
| `TemplateNavigationNode`   | Union type covering all navigation node types       |

---

### `@mauriciodmo/framekit/studio`

Provides the `FrameKitStudio` component, which combines editor and navigation into a complete studio interface, along with localization utilities.

Its main component accepts `{ templates: readonly FrameKitStudioTemplate[], brands?: readonly FrameKitStudioBrand[] }`.

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
| `FrameKitStudioTemplate` | Template type scoped to the studio context |
| `FrameKitStudioBrand`    | Brand catalog entry with metadata and a preview loader |
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

Signature: `FrameKitStudioRoot({ children }: { children: React.ReactNode })`. It emits the complete `<html>`, `<head>`, and `<body>` shell, so a root layout using it must not nest another document shell.

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
| `createTemplateModule` | Generates a template module from a template definition    |
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

[Español](../../es/reference/public-api.md)
