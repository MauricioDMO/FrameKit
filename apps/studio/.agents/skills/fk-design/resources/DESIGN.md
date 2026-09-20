# Design System: [Project Name]

## 1. Visual Direction

[Describe the audience, mood, hierarchy, density, contrast, and visual point of
view for fixed-size FrameKit exports.]

## 2. Output Rules

- Default dimensions: [width] x [height]
- Safe area: [value]
- Export: static PNG from FrameKit Studio
- Text overflow: [rule]

## 3. Color Roles

- **Canvas:** [name] (`#000000`) - [role]
- **Surface:** [name] (`#000000`) - [role]
- **Primary text:** [name] (`#000000`) - [role]
- **Muted text:** [name] (`#000000`) - [role]
- **Border:** [name] (`#000000`) - [role]
- **Accent:** [name] (`#000000`) - [role and usage limit]

## 4. Typography

- **Display:** [available family], [weight], [size], [line height], [tracking]
- **Body:** [available family], [weight], [size], [line height]
- **Metadata:** [available family], [weight], [size], [case and tracking]
- **Limits:** [maximum title lines or character guidance]

## 5. Composition

- Alignment: [rule]
- Spacing rhythm: [rule]
- Focal point: [rule]
- Layering and overlap: [rule]
- Responsive behavior: [not applicable to the exported composition, or project-specific rule]

## 6. Images and Assets

- Approved sources: [paths or source rules]
- Crop and treatment: [rule]
- Logo treatment: [rule]
- Shared assets: `assets/common`
- Variant assets: `assets/<variant>`

## 7. Content and Data

- Voice: [rule]
- Capitalization: [rule]
- Public values: [values allowed from `src/profile.ts`]
- Never invent: [contact data, metrics, claims, or other project-specific data]

## 8. Reuse Boundaries

- Reusable brand patterns belong in `src/brand/`.
- One-template artwork stays under `src/templates/<template>/`.
- [Project-specific exceptions]

## 9. Avoid

- [Project-specific visual or content anti-pattern]
