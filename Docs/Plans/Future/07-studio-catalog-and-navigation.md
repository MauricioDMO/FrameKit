# 07. Studio Catalog and Navigation

## Objective

Keep Studio usable when a project contains dozens or hundreds of templates.

## Catalog home

The main Studio route should display a gallery with:

- Preview.
- Title.
- Dimensions.
- Category.
- Tags.
- Available variants.
- Template status.
- Validation state when relevant.

## Sidebar navigation

Filesystem-based navigation remains available for hierarchical browsing.

It should support:

- Expand and collapse.
- Remembering open folders.
- Keyboard navigation.
- Current template indication.
- Template count per category.
- Stable selection after catalog regeneration.
- Category labels derived from folder segments.
- Optional metadata overrides for human-readable labels.

## Search

Search should consider:

- Title.
- Slug.
- Description.
- Tags.
- Keywords.
- Dimensions.
- Category.

Search should remain fast with at least one hundred templates.

## Filters

Initial filters:

- Category.
- Tags.
- Aspect ratio.
- Orientation.
- Dimensions.
- Favorites.
- Recently opened.
- Template status.

Platform-specific filters should not enter the core. Platforms should be represented through tags or external presets.

## Sorting

Supported sort modes:

- Author-defined order.
- Alphabetical.
- Recently opened.
- Recently modified when data exists.
- Dimensions.
- Category.

## Favorites and recent templates

Favorites and recent history can be local-only.

They should not require accounts or server persistence.

## Preview generation

A preview should:

- Render with valid initial data.
- Preserve aspect ratio.
- Use a small thumbnail size.
- Load lazily.
- Be cached.
- Regenerate when the template or relevant assets change.
- Display a clear placeholder when generation fails.

## Large catalogs

Possible optimizations:

- Lazy template imports.
- Lazy thumbnail generation.
- Virtualized lists or grids when needed.
- Search index generated from metadata.
- Cancellation of obsolete preview work.
- Limits on simultaneous preview rendering.

## URL behavior

The URL should continue to identify the selected template.

Search and filter state may optionally be represented in query parameters for shareable views.

## Empty and error states

Studio should clearly distinguish:

- No templates exist.
- No template matches the filters.
- Preview failed.
- Template definition is invalid.
- Template module failed to load.
- Requested slug does not exist.

## Accessibility

The catalog and sidebar must support:

- Keyboard navigation.
- Visible focus.
- Correct current-item semantics.
- Screen-reader labels.
- Predictable focus after navigation.
- Non-color-only selection indicators.

## Completion criteria

- A user can find a template without knowing its slug.
- The catalog remains responsive with at least one hundred templates.
- Keyboard navigation covers catalog and sidebar.
- Categories continue to derive from the filesystem.
- Filters use generic metadata rather than platform-specific core properties.
- Preview failures do not break the entire catalog.
