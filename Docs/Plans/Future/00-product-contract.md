# 00. Product Contract

## Objective

Define precisely what FrameKit is and prevent it from drifting into a general-purpose design editor that competes with free-canvas tools.

## Product definition

FrameKit is a **code-first system for building image editors from React templates**.

The template author controls:

- Visual structure.
- React components.
- Fonts and styles.
- Output dimensions.
- Editable fields.
- Validation rules.
- Initial values.
- Allowed export behavior.

The Studio user controls only the values explicitly exposed by the template author.

## Primary users

### Template author

A developer or technical designer who works with React, TypeScript, HTML, and CSS.

They need to:

- Build templates as components.
- Declare editable data with type inference.
- Validate templates before runtime.
- Preview changes immediately.
- Organize a growing catalog.
- Distribute templates and collections.

### Content editor

A person who uses Studio to produce images without changing code.

They need to:

- Find a template.
- Change approved text, images, colors, and options.
- Preview the exact output.
- Save variations.
- Export a reliable file.

They do not need to edit JSX, CSS, or arbitrary layout structure.

## Product principles

- The template is code.
- Content is data.
- Studio does not rewrite template source code.
- The template author defines the editing boundaries.
- Exported output must be reproducible.
- Local use must not require an account.
- Server-backed capabilities should be optional.
- Built-in concepts should remain small and generic.
- Specific product needs should be solved with options, presets, or extensions.
- A new feature should improve a real authoring, editing, persistence, or export workflow.

## Explicitly out of scope

- Free-canvas editing.
- Arbitrary movement of every element.
- Visual JSX editing.
- Real-time collaboration.
- Mandatory accounts.
- A marketplace inside the core package.
- Mandatory cloud storage.
- Automatic Canva or Figma import.
- Secure sandboxing of untrusted third-party template code.
- Full photo editing.

## Decision framework

Before adding a capability, answer:

1. Does it help template authors expose controlled editing?
2. Does it help Studio users produce an output faster or more reliably?
3. Can it be implemented as an option instead of a new core abstraction?
4. Does it require a server, and if so, can local mode remain complete?
5. Does it preserve deterministic export behavior?
6. Does it increase the maintenance cost of every consumer?

## Completion criteria

- The repository README and documentation use the same product definition.
- Every roadmap plan maps to a core user workflow.
- Out-of-scope features are clearly identified.
- Documentation states that FrameKit is not a free-canvas editor.
- New field and plugin proposals can be evaluated against these principles.
