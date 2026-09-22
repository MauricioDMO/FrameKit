---
title: API del paquete
description: Elige el punto de entrada compatible del paquete FrameKit para plantillas, Studio, renderizado o herramientas del proyecto.
sidebar:
  order: 1
---

FrameKit publica un pequeño conjunto de puntos de entrada explícitos del paquete. Importa únicamente desde estas rutas; el paquete no expone su árbol `src/` como una API para consumidores.

## Elige un punto de entrada

- [API principal](/es/users/reference/package-api/core) — las definiciones de plantillas compartidas, los campos, la validación, los auxiliares de datos y `Markdown`.
- [API del cliente](/es/users/reference/package-api/client) — el componente de cliente utilizado por la página privada de renderizado.
- [API del editor](/es/users/reference/package-api/editor) — componentes interactivos del editor y de navegación.
- [API de códigos QR](/es/users/reference/package-api/qr) — códigos QR SVG con un `div` contenedor fácil de posicionar en plantillas.
- [API de Next.js](/es/users/reference/package-api/next) — el wrapper de configuración de Next.js compatible.
- [API de Studio](/es/users/reference/package-api/studio) — la superficie de Studio del lado del cliente y sus mensajes y tipos.
- [API raíz de Studio](/es/users/reference/package-api/studio-root) — fábricas de documentos y páginas del lado del servidor para las rutas de Studio.
- [API de desarrollo](/es/users/reference/package-api/dev) — utilidades avanzadas del lado del servidor para descubrimiento, generación de código y supervisión.
- [API del servidor](/es/users/reference/package-api/server) — manejadores de Node.js y contratos de renderizado del lado del servidor.
- [Hoja de estilos](/es/users/reference/styles-and-theming) — el punto de entrada CSS publicado.

## Restricciones del paquete

El paquete es exclusivamente ESM. Sus rangos de dependencias peer son Next.js `>=16 <17`, React `>=19 <20` y React DOM `>=19 <20`. El paquete requiere Node.js `>=22.13.0`; el requisito del gestor de paquetes es pnpm `>=11.14.0`.

Para configurar un proyecto, consulta [integrar un proyecto existente de Next.js](/es/users/getting-started/existing-project). Para el contrato de plantillas, consulta la [referencia de plantillas](/es/users/reference/template).
