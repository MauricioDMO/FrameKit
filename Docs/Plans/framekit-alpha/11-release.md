# 11. Publicación alpha

## Precondiciones

- [ ] Confirmar que los paquetes tienen los nombres disponibles en npm: `@mauriciodmo/framekit` y `@mauriciodmo/create-framekit`.
- [ ] Confirmar que la raíz conserva `private: true` y que solo los dos paquetes tienen `publishConfig.access: public`.
- [ ] Actualizar ambos paquetes a `0.1.0-alpha.1`.
- [ ] Actualizar la dependencia de FrameKit dentro de la plantilla del creador a `0.1.0-alpha.1`.
- [ ] Confirmar que README, licencia, repositorio y bugs metadata apuntan al repositorio público correcto antes de publicar.

## Verificación previa

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
pnpm --filter @mauriciodmo/framekit pack
pnpm --filter @mauriciodmo/create-framekit pack
```

- [ ] Ejecutar todos los comandos anteriores desde una instalación limpia.
- [ ] Ejecutar las pruebas de tarball de la fase 10 con los artefactos recién creados.
- [ ] Revisar manualmente cada `npm pack --dry-run` para confirmar que no publica secretos, fuente no compilada ni archivos de Studio.

## Publicación manual

- [ ] Publicar primero `@mauriciodmo/framekit` con `npm publish --access public --tag alpha` desde su directorio de paquete.
- [ ] Confirmar en npm que existe exactamente la versión `0.1.0-alpha.1` bajo el tag `alpha`.
- [ ] Publicar después `@mauriciodmo/create-framekit` con el mismo tag.
- [ ] Desde un directorio fuera del repositorio, ejecutar `pnpm dlx @mauriciodmo/create-framekit mi-proyecto`.
- [ ] Dentro del proyecto creado, ejecutar `pnpm dev`, `pnpm check` y `pnpm build`.
- [ ] Registrar cualquier fallo de instalación o build antes de anunciar la alpha.

## Automatización posterior

- [ ] Solo después de una publicación manual correcta, crear un workflow de GitHub Actions para publicación con npm Trusted Publishing.
- [ ] Configurar el workflow para ejecutarse sobre tags de versión, no en cada push.
- [ ] Usar OIDC y evitar tokens npm de larga duración en secretos de GitHub.
- [ ] Mantener la publicación manual como procedimiento de recuperación documentado.

## Cierre

- [ ] Funciona desde npm el flujo completo: crear proyecto, abrir editor, editar la plantilla ejemplo y compilar producción.
- [ ] Los dos paquetes están disponibles exclusivamente bajo el tag `alpha`.
