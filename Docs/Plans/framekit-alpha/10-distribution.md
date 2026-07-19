# 10. Distribución

## Paquete principal

- [ ] Limpiar `dist` y crear un tarball con `pnpm --filter @mauriciodmo/framekit pack`.
- [ ] Inspeccionar el resultado de `npm pack --dry-run` antes de usar el tarball.
- [ ] Comprobar que contiene `dist/index.js`, `dist/editor.js`, `dist/cli.js`, sus `.d.ts`, `dist/styles.css`, README y LICENSE.
- [ ] Comprobar que no contiene `src`, tests, `.framekit`, `.next`, assets de Studio ni archivos de workspace.
- [ ] Crear un directorio temporal que copie el contenido de `examples/basic`.
- [ ] Instalar el tarball en esa copia con `pnpm add <ruta-absoluta-al-tgz>`; no usar `workspace:*`, enlaces ni `file:` a la carpeta del paquete.
- [ ] Ejecutar `pnpm install`, `pnpm check` y `pnpm build` en el ejemplo instalado.
- [ ] Confirmar que el binario encontrado por los scripts es el incluido en el tarball.

## Creador de proyectos

- [ ] Empaquetar también `@mauriciodmo/create-framekit`.
- [ ] Instalar su tarball en un harness temporal y ejecutar `pnpm exec create-framekit <directorio-nuevo>`.
- [ ] Para la prueba previa a publicar, sustituir en el `package.json` generado la dependencia de FrameKit por el tarball local antes de `pnpm install`; este cambio pertenece solo al harness, no a la plantilla publicada.
- [ ] Ejecutar `pnpm check` y `pnpm build` dentro del proyecto creado.
- [ ] Verificar que `.framekit/generated/templates.ts` fue generado, está ignorado por Git y no fue copiado desde el creador.

## Cierre

- [ ] Los dos paquetes funcionan instalados exclusivamente desde sus tarballs.
- [ ] Ningún import, declaración de tipos, CSS o binario depende del workspace original.
