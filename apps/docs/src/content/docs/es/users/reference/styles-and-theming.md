---
title: Estilos y temas
description: Importa la hoja de estilos pública de FrameKit y usa sus tokens de diseño publicados y el comportamiento de sus temas.
sidebar:
  order: 4
---

## Hoja de estilos pública

Importa el único punto de entrada CSS compatible desde la hoja de estilos global de la aplicación:

```css
@import '@mauriciodmo/framekit/styles.css';
```

La exportación es CSS compartido para la aplicación. Impórtala una vez; no importes una hoja de estilos `src/` del paquete.

## Tokens de diseño

La hoja de estilos publica la paleta de FrameKit como colores del tema de Tailwind. Los nombres de los tokens y sus valores actuales son:

| Token | Valor |
| --- | --- |
| `--color-fk-forest-100` | `#304a3e` |
| `--color-fk-forest-200` | `#243c31` |
| `--color-fk-forest-300` | `#173d31` |
| `--color-fk-forest-400` | `#10271f` |
| `--color-fk-mint-100` | `#e5f2e9` |
| `--color-fk-mint-200` | `#c8f7d9` |
| `--color-fk-mint-300` | `#77c99a` |
| `--color-fk-sage-100` | `#e6eee9` |
| `--color-fk-sage-200` | `#b8c8be` |
| `--color-fk-sage-300` | `#91ae9f` |
| `--color-fk-sage-400` | `#59665f` |
| `--color-fk-ivory-100` | `#faf9f5` |
| `--color-fk-ivory-200` | `#f0eee7` |
| `--color-fk-ivory-300` | `#d9d7cf` |
| `--color-fk-ivory-400` | `#cbd5ce` |

Estos nombres están disponibles como utilidades de color de Tailwind después de importar la hoja de estilos, por ejemplo `bg-fk-forest-400` y `text-fk-mint-200`.

## Tema claro y oscuro

`FrameKitStudioRoot` aplica la clase `dark` al documento a partir de la cookie `theme` o de la preferencia `prefers-color-scheme` del usuario. La hoja de estilos de FrameKit define la variante `dark` para esa clase. Los componentes pueden proporcionar ambas formas de una utilidad, por ejemplo:

```tsx
<main className="bg-fk-ivory-200 text-fk-forest-400 dark:bg-fk-forest-400 dark:text-fk-sage-100">
  Contenido
</main>
```

Para consultar el punto de integración, consulta [la guía de proyectos existentes](/es/users/getting-started/existing-project). Para consultar el punto de entrada del paquete de la hoja de estilos, consulta [la API del paquete de la hoja de estilos](/es/users/reference/package-api/styles).
