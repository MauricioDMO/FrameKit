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
    src/.framekit/        Manifest y registry generados
    scripts/              Caller y watcher del codegen
    public/               Assets de Studio
packages/
  framekit/               Codigo reutilizable de FrameKit
    src/core/             Contrato, campos, resolucion y validacion
    src/editor/           Editor, controles y navegacion
    src/markdown/         Parser y componente Markdown
    src/codegen/          Scanner y generador interno
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

```bash
pnpm --filter studio dev
```

Abre `http://localhost:3000`. El comando hace dos cosas en paralelo:

1. Genera el catalogo de plantillas.
2. Inicia Next y observa cambios estructurales en `src/templates`.

Para detenerlo usa `Ctrl+C`.

Los comandos equivalentes desde `apps/studio` son:

```bash
pnpm dev
pnpm templates:generate
pnpm templates:watch
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

En esta fase el paquete aun es privado y se consume desde su fuente TypeScript
del workspace. La compilacion publicable con `dist`, exports npm y CSS generado
pertenece a la fase 07.

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

El registry y el manifest se escriben en:

```text
apps/studio/src/.framekit/manifest.ts
apps/studio/src/.framekit/registry.ts
```

Son archivos generados e ignorados por Git. No los edites manualmente. El
generador se ejecuta automaticamente durante `dev`, `test`, `typecheck` y
`build` de Studio.

El codegen vive en el paquete, pero Studio lo invoca mediante el script privado
del workspace. No importes `packages/framekit/src` desde Studio.

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

Studio importa Tailwind desde `apps/studio/src/app/globals.css`. Esa hoja
tambien escanea `packages/framekit/src`, porque durante la fase 06 el editor se
consume directamente desde el workspace. Por eso las clases del arbol de
navegacion y de los fields pertenecen al paquete, pero se generan dentro del
CSS de Studio.

La entrada `packages/framekit/src/styles.css` ya existe como preparacion para
la fase 07. Todavia no es el CSS compilado publicable.

## Cuando algo falla

Si el catalogo no cambia:

```bash
pnpm --filter studio templates:generate
```

Si faltan estilos, verifica que `apps/studio/src/app/globals.css` conserve:

```css
@import "tailwindcss";
@source "../../../../packages/framekit/src";
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

La fase 07 convertira `packages/framekit` en un paquete compilado y publicable.
La fase 08 reemplazara el caller privado por el binario `framekit` para que un
proyecto consumidor pueda ejecutar `generate`, `check`, `dev` y `build`.
