# 08. CLI

## Convenciones

Todos los comandos usan `process.cwd()` como raíz del proyecto consumidor. La única estructura asumida es `src/templates`; no habrá archivo de configuración de FrameKit. Los procesos hijos se ejecutan sin shell y heredan `stdio` para que los errores de Next no pierdan formato.

La fase 07.5 ya entrega discovery, codegen, watcher y custom server en
`@mauriciodmo/framekit/dev`. Esta fase no debe duplicar esas implementaciones.
El único archivo generado es `<cwd>/.framekit/generated/templates.ts`.

## `framekit generate`

- [ ] Resolver `<cwd>/src/templates` y `<cwd>/.framekit/generated/templates.ts`.
- [ ] Ejecutar `writeTemplateModule` y escribir el módulo solo si cambió.
- [ ] Fallar con código distinto de cero si no existe `src/templates`, no existe ninguna plantilla o un segmento recorrido es inválido.
- [ ] Al encontrar `template.tsx`, registrar esa carpeta y no recorrer sus subdirectorios; componentes, definiciones y assets internos no son categorías ni plantillas hijas.
- [ ] Mostrar el número de plantillas encontradas y las rutas de los errores, sin stack trace salvo modo de depuración futuro.

## `framekit check`

- [ ] Ejecutar primero `generate`; no comprobar archivos generados obsoletos.
- [ ] Generar un archivo temporal de comprobación que importe estáticamente cada `template.tsx` y ejecute `validateTemplateDefinition` sobre su default export.
- [ ] Ejecutar esa comprobación con `tsx`, usando el `tsconfig` del consumidor, para que imports TypeScript, TSX y aliases de la plantilla se resuelvan igual que durante desarrollo.
- [ ] Fallar si una definición no es el resultado estructural esperado, no tiene idiomas, usa `language` como campo, tiene dimensiones inválidas, usa contenido no declarado o deja un campo requerido sin valor en algún idioma.
- [ ] Borrar el archivo temporal incluso si la comprobación falla.
- [ ] Mantener el typecheck de Next como verificación complementaria: `check` no sustituye `next build`.

## `framekit dev`

- [ ] Ejecutar `generate` antes de iniciar Next.
- [ ] Observar únicamente cambios que afecten la estructura: `template.tsx` añadido, borrado, movido, y directorios añadidos o borrados bajo `src/templates`.
- [ ] Aplicar debounce a los eventos y no iniciar dos generaciones simultáneas.
- [ ] Reutilizar `createDevServer`; no iniciar `next dev` y el watcher como procesos separados.
- [ ] Reenviar `SIGINT` y `SIGTERM` al servidor integrado y terminar cuando falle de forma inesperada.
- [ ] No regenerar por cambios dentro de un `template.tsx`; Next HMR ya gestiona su contenido.

## `framekit build`

- [ ] Ejecutar `framekit check`.
- [ ] Si check pasa, ejecutar `next build` desde el cwd del consumidor.
- [ ] Devolver el código de salida de Next y no continuar tras un check fallido.

## `framekit start`

- [ ] Iniciar el servidor standalone generado para el proyecto consumidor sin asumir la estructura interna del monorepo de FrameKit.
- [ ] Fallar con un mensaje claro si todavía no existe una build de producción.
- [ ] Reenviar el código de salida y las señales al proceso de Next.

## Scripts del consumidor

```json
{
  "scripts": {
    "dev": "framekit dev",
    "build": "framekit build",
    "start": "framekit start",
    "check": "framekit check"
  }
}
```

## Cierre

- [ ] Añadir, mover o eliminar un `template.tsx` regenera manifiesto y registro durante desarrollo.
- [ ] `framekit check` muestra el archivo y la regla incumplida.
- [ ] `framekit build` no ejecuta `next build` si existe un error de plantilla.
- [ ] `framekit start` funciona en una aplicación raíz creada fuera del monorepo.
