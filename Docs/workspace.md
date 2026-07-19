# Workspace de FrameKit

FrameKit ahora es un monorepo pnpm. El proyecto raiz coordina los workspaces,
pero no es una aplicacion ni un paquete publicable.

## Estructura

```text
apps/
  studio/                 Aplicacion Next y plantilla piloto
    src/app/              Rutas de Studio
    src/components/       Interfaz propia de Studio
    src/i18n/             Idioma de la interfaz
    src/templates/        Plantillas del catalogo de Studio
    .framekit/            Codegen y salida de Next ignorados
    public/               Assets de Studio
packages/
  framekit/               Codigo reutilizable de FrameKit
    src/core/             Contrato, campos, resolucion y validacion
    src/editor/           Editor, controles y navegacion
    src/markdown/         Parser y componente Markdown
    src/discovery/        Scanner de plantillas
    src/codegen/          Generador de módulo TypeScript
    src/dev/              Watcher y custom server
    tests/types/          Fixtures de inferencia TypeScript
  create-framekit/        Workspace reservado para el creador
examples/
  basic/                  Consumidor independiente reservado para el ejemplo
package.json              Scripts agregados del monorepo
pnpm-workspace.yaml       apps/*, packages/* y examples/*
```

## Instalacion

Ejecuta siempre los comandos desde la raiz del repositorio:

```bash
pnpm install
```

`pnpm install` instala los cinco workspaces y enlaza localmente
`@mauriciodmo/framekit` con Studio mediante `workspace:*`.

## Iniciar Studio

La guía corta para empezar está en [`quickstart.md`](quickstart.md). La CLI
`framekit dev` todavía no existe porque pertenece a la fase 08.

```bash
pnpm dev
```

Abre `http://localhost:3000`. El comando ejecuta un único proceso que:

1. Genera el módulo de plantillas.
2. Inicia Next y observa cambios estructurales en `src/templates`.

Para detenerlo usa `Ctrl+C`.

Los comandos equivalentes desde `apps/studio` son:

```bash
pnpm dev
pnpm build
pnpm start
```

## Comandos del root

Los scripts del root delegan en todos los workspaces que tengan el script
correspondiente:

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

El paquete `@mauriciodmo/framekit` tambien puede verificarse directamente:

```bash
pnpm --filter @mauriciodmo/framekit lint
pnpm --filter @mauriciodmo/framekit test
pnpm --filter @mauriciodmo/framekit typecheck
```

El paquete se compila a ESM en `dist` antes de que Studio lo consuma. Sus
exports publicos apuntan a los artefactos compilados; el CLI de consumidor
continua reservado para la fase 08.

## Plantillas

Una plantilla nueva se crea dentro de `apps/studio/src/templates`:

```text
apps/studio/src/templates/
  redes-sociales/
    instagram/
      promocion-cuadrada/
        template.tsx
```

El scanner solo descubre carpetas que contienen `template.tsx`. Los segmentos
deben usar minusculas, numeros y guiones. Los directorios que empiezan por `.`
o `_` se ignoran.

El módulo generado se escribe en:

```text
apps/studio/.framekit/generated/templates.ts
```

Es un archivo generado e ignorado por Git. No lo edites manualmente. Contiene
los metadatos de navegación y los loaders con imports literales que Next
necesita incluir en sus bundles. El generador se ejecuta automáticamente
durante `dev`, `test`, `typecheck` y `build` de Studio.

El codegen y el watcher viven en el paquete. Studio los consume mediante
`@mauriciodmo/framekit/dev`; no importes `packages/framekit/src` desde Studio.

## Imports permitidos

Desde una plantilla se importa la API de autoría así:

```tsx
import { defineTemplate, fields, Markdown } from '@mauriciodmo/framekit'
```

Desde Studio se importa el editor y la navegación así:

```tsx
import { FrameKitEditor, FrameKitNavigation } from '@mauriciodmo/framekit/editor'
```

La API raíz pública incluye actualmente:

- `defineTemplate` y `defineTemplateBase`
- `fields`
- `Markdown`
- `validateTemplateData` y `validateTemplateDefinition`
- `resolveTemplateData`, `getLocales` y `getDefaultValues`
- `TemplateDefinition`, `TemplateRenderProps`, `InferTemplateData`
- Descriptores de campos y `TemplateDataValidationError`

Los validadores y resolvers son públicos intencionalmente. Son útiles para
consumidores que construyan editores propios o separen plantillas grandes en
varios archivos.

## Estilos

Studio importa Tailwind desde `apps/studio/src/app/globals.css` y añade el CSS
compilado del paquete. Las clases del arbol de navegacion, los fields y el
editor se generan dentro de `packages/framekit/dist/styles.css`.

La entrada `packages/framekit/src/styles.css` se compila a
`packages/framekit/dist/styles.css`. Studio importa esa ruta publica y no
escanea `packages/framekit/src` directamente.

## Cuando algo falla

Si el catálogo no cambia, regenera el módulo temporalmente:

```bash
pnpm --filter studio exec tsx server.ts --generate
```

Si faltan estilos, verifica que `apps/studio/src/app/globals.css` conserve:

```css
@import "tailwindcss";
@import "@mauriciodmo/framekit/styles.css";
```

Si una plantilla no aparece, revisa que exista `template.tsx` y que todos sus
segmentos cumplan la convencion de nombres.

Si TypeScript no encuentra FrameKit, instala desde la raiz y no cambies el
import a una ruta relativa:

```bash
pnpm install
pnpm --filter studio typecheck
```

## Siguiente fase

La fase 07 convierte `packages/framekit` en un paquete compilado y publicable.
La fase 08 reemplazara el caller privado por el binario `framekit` para que un
proyecto consumidor pueda ejecutar `generate`, `check`, `dev` y `build`.
