# FrameKit Design

## Direction

FrameKit is a visual workshop for creating consistent content from code. The
interface and brand components should feel editorial, technical, and calm. The
design should use structure, whitespace, typography, and contrast before
decoration:

- Use a deep forest canvas as the primary visual surface.
- Use mint as the signal for action, focus, and editable values.
- Use warm ivory for readable content surfaces and exported light artwork.
- Pair strong sans-serif headlines with restrained monospace details.
- Prefer generous spacing, flat surfaces, and structural rules over dense UI or
  floating cards.
- Use circles, gradients, and other texture only as a restrained atmospheric
  detail; never let decoration compete with editable content.

## Color Tokens

| Token | Value | Use |
| --- | --- | --- |
| `forest-950` | `#071a15` | Deep artwork background |
| `forest-900` | `#10271f` | Primary artwork and Studio sidebar |
| `forest-800` | `#173d31` | Cards, buttons, and elevated dark surfaces |
| `forest-700` | `#2a3931` | Preview canvas in dark mode |
| `mint-300` | `#b9f8d2` | Accent, emphasis, active controls |
| `mint-200` | `#c8f7d9` | Primary active state and light accent |
| `sage-400` | `#91ae9f` | Secondary text on dark surfaces |
| `sage-500` | `#537568` | Muted labels and metadata |
| `ivory-100` | `#f5f7ee` | Light artwork surface and high contrast text |
| `ivory-50` | `#faf9f5` | Studio panels |
| `ink-900` | `#17221d` | Text on light surfaces |

### Color rules

- Keep primary text contrast high: `ivory-100` on forest backgrounds and
  `ink-900` on ivory backgrounds.
- Use mint for one clear focal action or value at a time; do not turn every
  control into an accent.
- Use white overlays at low opacity for borders, dividers, and secondary text
  on dark artwork.
- Treat user-provided colors as component inputs. Do not replace the base
  forest and ivory structure with arbitrary field values.
- For dark mode Studio surfaces, preserve the forest family instead of using
  pure black.

## Typography

- Use the existing sans-serif stack for body copy and UI controls.
- Use heavy sans-serif weight for titles, navigation labels, and short calls to
  action.
- Use negative tracking on large editorial headlines.
- Use uppercase text with expanded tracking for eyebrows, metadata, and labels.
- Use monospace only for code, dimensions, file names, and technical metadata.
- Keep supporting copy relaxed with a generous line height and muted color.

## Shape and Spacing

- Use a small radius scale: `0px` by default, `4px` for minor grouping, and
  `8px` for controls or intentionally emphasized blocks.
- Keep cards, panels, and artwork blocks mostly square. Do not round every
  container or use pill shapes as a general control language.
- Reserve pills for compact statuses or tags whose meaning depends on their
  badge-like appearance.
- Use one-pixel rules to organize regions and related content. Do not outline
  every control when spacing, surface contrast, or a divider already provides
  enough structure.
- Avoid drop shadows on ordinary surfaces. Use a restrained shadow only when
  an overlay, menu, or modal must clearly sit above the page.
- Base spacing on multiples of `4px`; prefer large internal padding in artwork
  compositions (`70px` to `92px` at the current 1440px canvas size).
- Keep decorative elements sparse and partially outside the canvas only when
  they create useful depth without introducing visual noise.
- Preserve clear whitespace around the main message; decoration must not compete
  with editable content.

## Composition

- Establish one dominant reading path: eyebrow, headline, supporting copy, then
  URL or call to action.
- Anchor brand identity in a compact header and keep it consistent across
  formats.
- Use a thin structural or accent rule to separate supporting content from the
  headline; do not rely on rounded containers to create hierarchy.
- Prefer asymmetrical layouts with one strong content column and one supporting
  visual or code motif.
- Use gradients and circles as occasional atmosphere, not as a recurring layer
  in every composition.
- Let whitespace and a clear reading path do more work than borders, shadows,
  or decorative surfaces.
- Keep channel-specific dimensions, exports, and platform labels in templates;
  reusable brand components stay channel-neutral.

## Brand Component Previews

- Previews should reuse the real `component.tsx` and show a representative,
  believable state.
- Use the same forest, mint, ivory, and sage tokens defined above.
- Keep previews static unless an explicit component-prop editor contract exists.
- Show the component's semantic purpose before showcasing decoration.
- Do not add platform names, export dimensions, or social-media-specific copy to
  reusable brand components.

## Current Reference

This design is extracted from the existing `framekit/que-es-framekit` and
`redes-sociales/instagram/promocion-cuadrada` templates. New visual values should
be added only when both templates and the component's purpose justify them.
