---
title: API del paquete de la hoja de estilos
description: Importa el punto de entrada global compatible de la hoja de estilos de FrameKit.
sidebar:
  order: 10
---

**Importación:** `@mauriciodmo/framekit/styles.css`  
**Entorno:** hoja de estilos compartida; impórtala desde el CSS global o el layout de la aplicación.

La hoja de estilos es el punto de entrada CSS publicado del paquete. Proporciona los estilos base y la paleta publicada de FrameKit que usan Studio y las superficies del editor.

## Ejemplo mínimo

```css
@import '@mauriciodmo/framekit/styles.css';
```

## Restricciones del bundle y del runtime

Este punto de entrada es CSS, no un módulo JavaScript. Impórtalo una vez desde la hoja de estilos global o el layout que gestiona los estilos de la aplicación; no importes una hoja de estilos `src/` interna. La exportación pública del paquete es `styles.css`.

Consulta [integrar un proyecto existente de Next.js](/es/users/getting-started/existing-project), [Usar Studio](/es/users/guides/use-studio) y el [índice de la API del paquete](/es/users/reference/package-api).
