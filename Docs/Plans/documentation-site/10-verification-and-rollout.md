# Fase 10 - Verificación y rollout

- **Estado:** Preparación local completada; rollout externo pendiente.
- **Depende de:** Fases 0-9.
- **Resultado objetivo:** Sitio publicado y reconocido como única fuente
  canónica de documentación humana de FrameKit.
- **Resultado actual:** Sitio verificado localmente y preparado para publicación;
  deployment, enlaces públicos y retirada legacy siguen pendientes.

## Objetivo

Verificar contenido, rutas, ejemplos y experiencia de navegación contra el
producto actual antes de anunciar el sitio. Esta fase no es el lugar para
introducir una nueva arquitectura documental; cualquier gap vuelve a la fase que
lo posee.

Todo contenido y ejemplo debe basarse exclusivamente en manifests,
implementación, tests y el template canónico actuales; se omite cualquier
afirmación que no pueda verificarse allí.

El rollout excluye por completo superficies retiradas o no soportadas. No deben
aparecer en guías, referencias, ejemplos ni migraciones publicadas.

## Verificaciones estructurales

- Páginas, labels, metadata y enlaces corresponden a FrameKit y no conservan
  contenido del starter.
- `/en/` y `/es/` tienen el mismo conjunto de rutas.
- Homepage y sidebar separan usuarios y contribuidores.
- No existe contenido de contribución dentro de `users/` ni referencia de
  consumo enterrada en `contributors/`.
- Migrations y Plans están claramente diferenciados.
- Mermaid funciona en build y no depende de JavaScript innecesario fuera de sus
  páginas.

## Verificaciones de contenido

- Package exports coinciden con `packages/framekit/package.json`.
- CLI coincide con los parsers actuales de ambos binarios.
- Template fields, variants, metadata y registry coinciden con validación.
- Studio refleja sidebar/settings, auth, roles, tokens y export server-side.
- API usa únicamente `/api/framekit/**` vigente.
- Security, deployment y límites están visibles y no solo en troubleshooting.
- Contributor docs reflejan cuatro workspaces y generated outputs actuales.
- Release docs separan smoke local, publicación y promoción.

## Verificaciones del contrato vigente

- Comparar exports y comandos con los manifests publicados y sus parsers
  actuales.
- Comparar implementación y tests para confirmar rutas, variables y
  comportamientos documentados.
- Comparar ejemplos con el template canónico y sus archivos de configuración.
- Comparar las rutas generadas con el sitemap y los destinos actuales de EN/ES.
- Revisar que el contenido publicado enseñe únicamente contratos presentes en
  esas fuentes.
- Buscar referencias a APIs, rutas, variables, imports, archivos, comandos,
  flags y comportamientos retirados o no soportados en el contenido publicado.

## Verificación de ejemplos

- Ejecutar Quick Start sobre un consumer generado limpio.
- Ejecutar snippets principales de template con `framekit check`.
- Probar un request Bearer real al API de imagen.
- Probar login, edición, Download PNG y Copy PNG en browser.
- Probar build/start standalone.
- Reutilizar smoke Docker para Chromium y persistencia SQLite.
- Confirmar que ningún ejemplo usa imports no publicados.

## Verificación visual y accesible

- Revisar homepage, navegación, tablas, code blocks y Mermaid en desktop/mobile.
- Verificar selector EN/ES y links equivalentes.
- Verificar headings, landmarks, foco, contraste y navegación por teclado.
- Ejecutar Lighthouse accessibility/SEO como señal complementaria, no como
  sustituto de la revisión manual.

## Comandos

```bash
pnpm --filter docs build
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

Ejecutar además los smokes enfocados definidos por la documentación de
contribuidores cuando cambien snippets de packaging, browser o Docker.

## Evidencia de verificación local

- **Fecha:** 2026-09-19.
- `pnpm --filter docs build` — PASS; Astro generó 189 páginas y un sitemap con
  188 URLs canónicas, 94 bajo `/en/` y 94 bajo `/es/`.
- `apps/docs/src/content/docs/404.md` — fallback personalizado verificado; el
  build conserva solo el warning no fatal de colisión entre la ruta `/404` y el
  catch-all de Starlight.
- `pnpm check:runtime` — PASS.
- `pnpm lint` — PASS.
- `pnpm test` — PASS; FrameKit ejecutó 793 tests en 78 archivos, creator 15
  tests en 2 archivos y Studio 7 tests en 3 archivos.
- `pnpm typecheck` — PASS.
- `pnpm build` — PASS; los cuatro workspaces con build completaron.
- `pnpm smoke:tarballs` — PASS; verificó ambos paquetes, exports públicos,
  consumers aislados, `generate`, `check`, `build`, `start` y API de acceso.
- `pnpm test:e2e` — PASS; 3 pruebas Chromium cubrieron login, edición/export y
  API de imagen autenticada.
- `pnpm smoke:docker -- 0.8.1` — BLOQUEADO por el artefacto ya publicado: npm
  no declara `playwright-core` para `0.8.1`, requisito del smoke Docker. No se
  hizo release para corregirlo.
- Auditoría de rutas — PASS; EN y ES tienen 93 archivos fuente equivalentes,
  sin rutas faltantes, enlaces internos con el prefijo de idioma correcto ni
  destinos publicados inexistentes.
- Revisión local en `http://localhost:4321` — PASS para `/en/`, `/es/` y una
  página profunda de arquitectura; el selector EN/ES, landmarks, navegación y
  dos diagramas Mermaid fueron verificados.
- Lighthouse — homepage ES mobile: 100 en accesibilidad, buenas prácticas,
  SEO y navegación agéntica; homepage EN desktop: 100 en accesibilidad,
  buenas prácticas y navegación agéntica. El único hallazgo SEO desktop es el
  enlace `Learn more` del overlay de desarrollo de Astro.
- La URL `https://framekit.mauriciodmo.com` todavía no resuelve DNS, por lo que
  no se verificó deployment público.

## Rollout

- Publicar en el destino definido durante la fase 0.
- Verificar rutas públicas `/en/` y `/es/` en el deployment real.
- Actualizar homepage/repository/package metadata con la URL canónica.
- Aplicar los cambios de links preparados en la fase 9.
- Retirar `Docs/en/` y `Docs/es/` solo después de verificar producción.
- Confirmar que enlaces desde npm y GitHub resuelven.
- Registrar la evidencia de build, browser y deployment.
- Marcar el sitio como fuente canónica solo después de verificar producción.
- Actualizar `Docs/Plans/README.md` y este tracker con el cierre.

Esta ejecución no aplica el rollout externo: no cambia enlaces de README, GitHub,
npm ni metadata de paquetes, y no elimina `Docs/en/` o `Docs/es/`.

## Rollback

Si el deployment falla, revertir enlaces externos al último destino funcional,
pero no restaurar dos fuentes editables de documentación. Corregir el sitio y
repetir el gate antes de volver a anunciarlo.

## Exit gate

- [x] Build de docs y gates del repositorio pasan.
- [x] Quick Start, API de imagen y flujos de Studio fueron verificados.
- [x] EN/ES pasan paridad y revisión visual local.
- [x] El contenido publicado enseña exclusivamente contratos actuales verificados.
- [x] No quedan referencias operativas a superficies retiradas o no soportadas.
- [ ] El deployment público responde en todas las rutas principales.
- [ ] GitHub, npm y READMEs enlazan a la URL canónica.
- [ ] `Docs/en/` y `Docs/es/` fueron retirados después de verificar producción.
- [ ] El tracker maestro está cerrado con evidencia de producción.
