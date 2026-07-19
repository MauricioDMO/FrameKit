# Empezar a trabajar

## Requisitos

- Node.js 20.19 o posterior.
- pnpm 11.

## Levantar Studio

Ejecuta estos comandos desde la raíz del repositorio, es decir, desde la
carpeta que contiene `pnpm-workspace.yaml`:

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

El comando `dev` hace todo lo necesario:

1. Compila `@mauriciodmo/framekit`.
2. Descubre las plantillas en `apps/studio/src/templates`.
3. Genera `.framekit/generated/templates.ts`.
4. Inicia Next en modo desarrollo.
5. Observa altas, bajas y movimientos de `template.tsx`.

No ejecutes `next dev`, el watcher ni un generador adicional en otra terminal.
Desde `Ctrl+C` se detiene todo el proceso.

## Crear una plantilla

Crea una carpeta con un archivo `template.tsx` dentro de:

```text
apps/studio/src/templates/
└── categoria/
    └── mi-plantilla/
        └── template.tsx
```

Los nombres de las carpetas solo pueden contener minúsculas, números y
guiones. Al crear, mover o borrar `template.tsx`, el watcher regenera el
catálogo automáticamente. Al editar el contenido de `template.tsx`, Next HMR
actualiza la aplicación sin regenerar el catálogo.

## Archivos generados

No edites estos directorios:

```text
apps/studio/.framekit/generated/templates.ts
apps/studio/.framekit/next/
```

El primero contiene los metadatos y los imports estáticos que Next necesita
para incluir las plantillas en sus bundles. El segundo contiene la salida de
Next. Ambos están ignorados por Git y se pueden regenerar.

## Build y producción local

Para crear una build optimizada:

```bash
pnpm --filter studio build
```

Para arrancar esa build:

```bash
pnpm --filter studio start
```

El servidor standalone queda en:

```text
apps/studio/.framekit/next/standalone/apps/studio/server.js
```

## Comandos de verificación

Desde la raíz:

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

## Cambiar el puerto

```bash
PORT=3001 pnpm dev
```

## Importante sobre la CLI

Estos comandos todavía no están disponibles:

```bash
framekit dev
framekit generate
framekit check
framekit build
```

Son el objetivo de la fase 08. Hasta que esa fase termine, usa los scripts de
pnpm documentados arriba.
