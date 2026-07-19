# 11. Publicación alpha

## Precondiciones

- [x] Confirmar que los paquetes tienen los nombres disponibles en npm: `@mauriciodmo/framekit` y `@mauriciodmo/create-framekit`. **(Verificado: ambos devuelven `Not found` — libres)**
- [x] Confirmar que la raíz conserva `private: true` y que solo los dos paquetes tienen `publishConfig.access: public`.
- [x] Actualizar ambos paquetes a `0.1.0-alpha.1`.
- [x] Actualizar la dependencia de FrameKit dentro de la plantilla del creador a `0.1.0-alpha.1`.
- [x] Confirmar que README, licencia, repositorio y bugs metadata apuntan al repositorio público correcto. *(Añadido `repository` y `bugs` a ambos package.json)*

## Mejoras aplicadas antes de publicar

- [x] `publishConfig.tag: "alpha"` añadido a ambos paquetes.
- [x] `prepack: "pnpm build"` y `prepublishOnly: "pnpm lint && pnpm test && pnpm typecheck"` en ambos paquetes.
- [x] Metadatos npm completos: `description`, `keywords`, `homepage`, `author`, `repository` como objeto con `directory`.
- [x] CI ampliada: matrix Node `22 / 24` en Ubuntu; job separado de Windows para smoke test de `create-framekit`; `pack --dry-run` para ambos paquetes. *(Nota: Node 20.9.0 excluido porque pnpm@11 requiere Node ≥22.13, incompatible con el `engines.node: ">=20.9.0"` del proyecto.)*

## Verificación previa

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
pnpm --filter @mauriciodmo/framekit pack
pnpm --filter @mauriciodmo/create-framekit pack
```

- [x] `pnpm lint` — Passed (framekit, create-framekit, studio)
- [x] `pnpm test` — Passed (53 tests framekit, 5 tests create-framekit, 2 tests studio)
- [x] `pnpm typecheck` — Passed (framekit, create-framekit, studio)
- [x] `pnpm build` — Passed (framekit + Tailwind CSS, studio, examples/basic)
- [x] `pnpm --filter @mauriciodmo/framekit pack --dry-run` — Contents verified (bin, dist, README, LICENSE)
- [x] `pnpm --filter @mauriciodmo/create-framekit pack --dry-run` — Contents verified (dist, template, README, LICENSE)
- [x] Ejecutar las pruebas de tarball de la fase 10 con los artefactos recién creados. **(Harness aislado: check 0, build 0 para ambos. `.framekit/generated/templates.ts` creado correctamente.)**
- [x] Revisar manualmente cada `npm pack --dry-run` para confirmar que no publica secretos, fuente no compilada ni archivos de Studio. **(Sin `src/`, sin `tests/`, sin `.next/`, sin `.framekit/` fuera de dist.)**

La fase 10 tiene una verificación histórica registrada para sus tarballs. Las dos comprobaciones manuales ahora están completas para los artefactos recién creados.

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
