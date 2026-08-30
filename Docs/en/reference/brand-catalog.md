# Brand Catalog Reference

FrameKit discovers brand components from a project's `src/brand` directory and
generates the metadata and loaders that Studio uses at `/brand`. A brand
component is a code-backed component with a separate preview and a short
README description.

The Studio integration contract for this behavior is tracked in [issue #13](https://github.com/MauricioDMO/FrameKit/issues/13).

## Directory contract

The scanner recursively visits `src/brand`:

```text
src/brand/
└── <segment>/...
    ├── component.tsx
    ├── preview.tsx
    └── README.md
```

At every visited level, directories whose names start with `.` or `_` are
ignored. Files are ignored during traversal. Every other visited directory name
must match this lowercase kebab-case pattern:

```text
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Thus, a segment contains lowercase ASCII letters or digits, with single
hyphens between non-empty parts. An invalid non-ignored directory causes the
scan to fail.

When a directory contains `component.tsx`, it is a leaf. The scanner then
requires both `preview.tsx` and `README.md` in that same directory and does not
recurse below it. The scanner only checks that those paths exist; it does not
read `component.tsx`. If `src/brand` does not exist, the scan returns an empty
list.

For each leaf, discovery produces:

- `slug`: all segments joined with `/` (for example,
  `communication/hero`)
- `title`: the final segment humanized by capitalizing the first character of
  each hyphen-separated word (for example, `social-card` becomes `Social Card`)
- `segments`: the original segment array
- `absolutePath`: the leaf directory path
- `description`: the first README paragraph extracted by the rules below

The final list is sorted by `slug.localeCompare(...)`, regardless of directory
enumeration order.

## README descriptions

The scanner reads `README.md` as UTF-8. It trims each line and collects the
first paragraph made of ordinary lines, joining those lines with spaces. A
blank line ends the paragraph. A line beginning with `#` or `` ``` ``, an
unordered-list marker (`-` or `*` followed by whitespace), or an ordered-list
marker such as `1. ` or `1) ` also ends the paragraph and is skipped. Once a
paragraph ends, later README content is not considered.

Before returning the description, discovery:

- changes Markdown links from `[text](url)` to `text`;
- removes backticks and the characters `*`, `_`, and `~`;
- trims the result.

If no description remains, discovery fails with a missing-description error.
These README, preview, naming, and description rules are **scan-time
requirements**. They do not validate or execute the component implementation.

## Generated runtime module

The shared generator writes the brand module to:

```text
src/generated/framekit/brands.ts
```

The generated module contains:

- `brands`: an array of entries containing `slug`, `title`, `segments`,
  `description`, and a `load` function;
- `brandManifest`: the same metadata without `load`;
- `brandRegistry`: a `Record<string, BrandLoader>` mapping each slug to its
  loader.

Each `load` function uses a dynamic import whose path points to that brand's
`preview.tsx` module. The generated module does not load `component.tsx`
directly. A preview can import and render the component as part of its own
implementation, but the generated runtime contract loads the preview module.

`writeTemplateModule` scans brands after scanning templates and writes the
brand output alongside `templates.ts`. It creates the output directory and
writes each file only when its content changes. The shared generation call
still requires at least one template; a missing `src/brand` directory itself is
allowed and produces no brand entries.

Generated files are build/codegen output. Do not hand-edit
`src/generated/framekit/brands.ts`; change the source under `src/brand` and run
the project's generation workflow instead.

## Development watching

The development watcher observes `src` with initial events ignored. For brand
content, an added, removed, or changed path anywhere under `src/brand`, and an
added or removed directory there, requests regeneration. The watcher itself
does not perform generation; the development server schedules the shared
generation function and routes errors through its error-reporting path.

The development server performs one generation before starting Next.js. If a
new request arrives while generation is running, it records a pending run and
completes another generation before the current run finishes. There is no
brand-specific runtime cache or validation described by this flow.

## Studio route and states

`FrameKitStudio` treats `/brand` and paths beginning with `/brand/` as brand
mode. It joins the catch-all route segments with `/`, looks up an exact `slug`
match in the supplied `brands` array, and builds navigation links using
`/brand` as the base.

- `/brand` has no selected slug and shows the brand empty state. If the brand
  list is empty, the navigation shows the localized no-brands message.
- `/brand/<slug>` first shows the loading state while that entry's `load`
  promise resolves.
- A matching entry renders the brand catalog with its title and description,
  and renders the loaded module's default export as the preview.
- A slug with no exact match shows the brand not-found state.
- If the loader rejects, Studio discards the rejection reason and renders the
  localized brand load-error message. It does not render raw `String(error)`.

The internal `FrameKitBrandCatalog` component receives exactly:

```ts
{
  title: string
  description: string
  preview: ComponentType
  messages: {
    componentLabel: string
    previewLabel: string
    descriptionLabel: string
    editHint: string
    badgeLabel: string
    sourceLabel: string
  }
}
```

It displays the metadata description and a code hint naming `component.tsx`;
it does not edit that file. The badge and source labels are supplied through
`messages.badgeLabel` and `messages.sourceLabel`, rather than hardcoded UI
text. For brand entries, the loaded default export is used as a React
component without the template-definition validation applied to template
entries. The implementation does not establish additional prop validation or
guarantees for the preview.
