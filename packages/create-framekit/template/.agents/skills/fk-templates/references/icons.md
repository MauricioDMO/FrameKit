# Icons

Use the installed React icon libraries instead of drawing common SVG icons by hand.

## Common Icons

Use `@tabler/icons-react` for interface, navigation, status, and decorative icons. Import only the icons a template uses:

```tsx
import { IconArrowRight, IconCheck } from '@tabler/icons-react'

<IconArrowRight size={24} stroke={2} aria-hidden="true" />
<IconCheck className="text-emerald-600" size={20} stroke={2.5} aria-hidden="true" />
```

Tabler icons use `currentColor` by default. Use `size`, `color`, and `stroke` when a runtime value is needed; prefer Tailwind classes for static colors and layout.

## Brand Icons

Use `@icons-pack/react-simple-icons` for company and product brands. Component names use `Si` followed by the brand name in upper camel case:

```tsx
import { SiInstagram, SiWhatsapp } from '@icons-pack/react-simple-icons'

<SiInstagram color="default" size={28} title="Instagram" />
<SiWhatsapp color="default" size={28} title="WhatsApp" />
```

Use `color="default"` for the brand's official color. Use a CSS color or Tailwind `className` when the design intentionally applies a different color. Search [Simple Icons](https://simpleicons.org) to find a brand, then use the component's exported `Si...` name.

## Accessibility

- Add `aria-hidden="true"` to icons that are purely decorative or already have a visible text label.
- Give a meaningful icon a `title` or an accessible label when it is the only content of a control.
- Do not rely on color alone to communicate meaning.
- Keep brand icons as visual marks; use visible text when the brand name must be clear.
