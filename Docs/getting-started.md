# Primeros pasos

[Volver al índice](README.md)

## Requisitos

- Node.js compatible con Next.js 16.
- pnpm 11 o posterior.

## Instalación

Desde la raíz del proyecto:

```bash
pnpm install
```

El proyecto autoriza únicamente los scripts de instalación necesarios para `sharp` y `unrs-resolver` mediante `pnpm-workspace.yaml`.

## Desarrollo

```bash
pnpm dev
```

Este comando:

1. Genera los registros de plantillas.
2. Inicia Next.js.
3. Observa altas y eliminaciones dentro de `src/templates`.

Abre [http://localhost:3000/editor](http://localhost:3000/editor). La ruta `/` redirige automáticamente al editor.

## Comandos

| Comando | Uso |
| --- | --- |
| `pnpm dev` | Inicia la aplicación y el watcher de plantillas. |
| `pnpm build` | Regenera los registros y crea el build de producción. |
| `pnpm start` | Ejecuta un build de producción existente. |
| `pnpm lint` | Ejecuta ESLint. |
| `pnpm templates:generate` | Regenera manualmente los registros. |
| `pnpm templates:watch` | Observa cambios estructurales en las plantillas. |

Continúa con [Uso del editor](using-the-editor.md) o [Creación de plantillas](creating-templates.md).
