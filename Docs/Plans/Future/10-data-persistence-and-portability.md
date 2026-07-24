# 10. Data Persistence and Portability

## Objective

Allow edits to be saved, backed up, transferred, and restored without requiring accounts or a server.

## Document model

A stored edit should be represented as a versioned document.

```ts
type FrameKitDocument = {
  schemaVersion: number
  templateSlug: string
  templateRevision?: number
  selectedVariant: string
  valuesByVariant: Record<string, Record<string, unknown>>
  assetIds: string[]
  createdAt: string
  updatedAt: string
}
```

## Version concepts

### `schemaVersion`

Version of the FrameKit document format.

It controls migrations for saved data.

### `templateRevision`

Version declared by the template author.

It helps detect whether a saved document was created against an older template contract.

### Package version

The installed FrameKit package version remains separate from document and template revisions.

## Local persistence layers

### localStorage

Use for lightweight state:

- Selected theme.
- Interface language.
- Recent templates.
- Favorites.
- Selected template and variant.
- Small references.

### IndexedDB

Use for:

- Documents.
- Large values.
- Binary assets.
- Persistent history if added.
- Imported packages.

## Autosave

Autosave should:

- Be debounced.
- Report current state.
- Avoid saving partially migrated data.
- Preserve the previous valid document when a write fails.
- Avoid unnecessary writes for preview-only state.

## Data export

Support:

```text
Export JSON
Export portable package with assets
```

JSON-only export is suitable when all assets are project or remote references.

Portable package export is required for local files.

## Import behavior

Import should:

- Validate the schema.
- Verify template slug.
- Check template revision.
- Detect unknown fields.
- Detect removed fields.
- Detect missing required fields.
- Show a summary before applying.
- Migrate known schema versions.
- Reject dangerous or oversized archives.
- Preserve the current document until import succeeds.

## Conflict handling

When a template changed, Studio should classify stored values:

- Compatible.
- Unknown.
- Removed.
- Type changed.
- Invalid under new constraints.
- Missing asset.

The user should be able to review and discard incompatible values.

## Storage adapter contract

Local persistence should be implemented behind an interface.

Future adapters may include:

- Browser local storage.
- Filesystem.
- REST API.
- Database.
- Cloud object storage.

Studio should not depend directly on a specific backend.

## Document identity

A single template may have multiple saved documents.

Each document should have:

- Stable ID.
- Optional name.
- Creation date.
- Update date.
- Template slug.
- Variant summary.

## Out of scope

- Real-time collaboration.
- User accounts.
- Cloud synchronization as a core requirement.
- Conflict-free multi-device editing in the first version.

## Completion criteria

- An edit can be exported and imported.
- Local assets travel with portable documents.
- Old documents are migrated or rejected with a useful error.
- Template changes do not silently destroy saved values.
- Local mode remains complete without a server.
- Multiple saved documents can reference the same template.
