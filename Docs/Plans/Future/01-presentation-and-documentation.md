# 01. Presentation and Documentation

## Objective

Make it possible for a new visitor to understand within a few minutes what FrameKit is, how to install it, what it can do, and how stable it currently is.

## Problem

The technical implementation can advance faster than the public presentation. When the README, package versions, documentation, and demo disagree, the project appears less reliable than it actually is.

## Scope

### Main README

The main README should include:

- Clear product definition.
- Current stability status.
- Supported Node.js and package manager versions.
- Working installation command.
- Screenshot of Studio.
- Short GIF or video of the editing workflow.
- Minimal template example.
- Current capabilities.
- Known limitations.
- Short architecture overview.
- Documentation links.
- Demo link.
- Roadmap link.
- License.
- Contribution link.

### Public demo

Provide a deployed project that allows users to:

- Browse several templates.
- Edit text.
- Change colors.
- Replace an image.
- Switch variants.
- Export a result.
- Test light and dark themes.

The demo should not require authentication.

### Documentation structure

Organize documentation around user tasks:

```text
Getting started
Template authoring
Fields
Studio
CLI
Export
Project structure
Public API
Troubleshooting
Contributing
```

### English and Spanish documentation

Both documentation trees should have equivalent structure and coverage.

A document may be translated later, but missing or outdated sections must be visible and tracked.

### Skills synchronization

FrameKit-specific skills stored under `Docs/skills` and copied into newly created projects should be generated or synchronized from a single source.

The sync process should detect divergence instead of silently overwriting unrelated content.

### Examples

Maintain examples for:

- Minimal inline template.
- Extracted artwork component.
- Text and numeric fields.
- Choice and boolean fields.
- Image field.
- Multiple content variants.
- Import and export of document data.
- Custom field registration when supported.

### Documentation versioning

Documentation should state which FrameKit version it describes.

Breaking changes should include:

- Migration instructions.
- Old and new API examples.
- The version in which compatibility is removed.

## Out of scope

- Full marketing website.
- Blog platform.
- Advanced hosted documentation search.
- More interface languages before English and Spanish are stable.

## Completion criteria

- Quick Start works exactly as written.
- Package versions and documentation agree.
- The repository contains current screenshots or a demo.
- No active instructions claim that an already published package is unpublished.
- Capabilities and limitations are listed separately.
- English and Spanish documentation share the same structure.
- Skills used by generated projects are synchronized from a maintained source.
