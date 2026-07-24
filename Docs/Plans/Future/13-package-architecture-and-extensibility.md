# 13. Package Architecture and Extensibility

## Objective

Keep the core maintainable while allowing advanced capabilities without adding every use case to the main package.

## Conceptual responsibilities

FrameKit currently or eventually contains these responsibilities:

```text
Template contract
Validation
Data resolution
Code generation
Editor components
Studio shell
Development runtime
CLI
Project creator
Template library
Persistence adapters
Export adapters
```

These responsibilities should remain conceptually separated even if they initially share a package.

## Package splitting rule

Create a new package only when there is a measurable reason:

- Consumers install unnecessary dependencies.
- Bundle size becomes a problem.
- Release cycles differ.
- Independent use is demonstrated.
- Peer dependencies conflict.
- Separate adapters are needed.
- Security boundaries improve.

Do not split packages only for architectural appearance.

## Possible future structure

```text
@mauriciodmo/framekit
@mauriciodmo/framekit-studio
@mauriciodmo/framekit-cli
@mauriciodmo/framekit-presets
@mauriciodmo/create-framekit
```

A separate core package may be justified later if non-React or non-Next consumers appear.

## Field registry

Studio should use an explicit registry.

```tsx
createFieldRegistry({
  builtins,
  custom: {
    brandColor: BrandColorField,
  },
})
```

A field extension should define:

- Descriptor schema.
- Runtime value type.
- Default value resolution.
- Validation.
- Editor component.
- Serialization.
- Deserialization.
- Error messages.
- Export compatibility.
- Migration behavior.

## Custom controls

A custom control may reuse an existing field kind.

Examples:

- Brand color picker using `color`.
- Font preview selector using `choice`.
- Advanced opacity dial using `number`.

This is preferred over introducing custom kinds.

## Custom field kinds

A custom kind should be allowed only when its value cannot be modeled by an existing kind.

It must not be accepted if it only renders a control but cannot:

- Validate.
- Persist.
- Import.
- Export.
- Infer its value.
- Migrate.
- Report errors.

## Adapter points

Possible extension interfaces:

- Persistence.
- Assets.
- Export.
- Catalog.
- Authentication.
- Analytics.
- Field registry.
- Preview generation.

## Next.js dependency

The pure template contract and validation logic should not depend on Next.js concepts.

Next.js-specific behavior belongs in:

- Studio integration.
- Development runtime.
- Build command.
- Standalone start command.

Future package separation should be based on actual consumer needs and dependency measurements.

## Public API policy

Public exports should be intentional.

Before exposing an API:

- Define its stability level.
- Document it.
- Test its types.
- Avoid exporting internal implementation helpers by accident.
- Consider whether it can be changed before 1.0.

## Completion criteria

- Built-in and custom controls use the same registry model.
- Adding a control does not require editing a large central switch.
- Extensions declare validation and serialization.
- Pure contract code avoids unnecessary Next.js dependencies.
- Package splitting decisions are supported by measurements.
- Public exports have documented stability expectations.
