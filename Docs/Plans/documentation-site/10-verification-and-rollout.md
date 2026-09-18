# Fase 10 - Verificación y rollout

- **Estado:** Pendiente.
- **Depende de:** Fases 0-9.
- **Resultado:** Sitio publicado y reconocido como única fuente canónica de
  documentación humana de FrameKit.

## Objetivo

Verificar contenido, rutas, ejemplos y experiencia de navegación contra el
producto actual antes de anunciar el sitio. Esta fase no es el lugar para
introducir una nueva arquitectura documental; cualquier gap vuelve a la fase que
lo posee.

## Verificaciones estructurales

- No quedan páginas, labels, metadata o enlaces del starter de Starlight.
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

## Búsquedas de regresión documental

No deben quedar como comportamiento actual:

```text
My Docs
Welcome to Starlight
withastro/starlight
/api/v1/images
FRAMEKIT_API_KEY
FRAMEKIT_PUBLIC_ORIGIN
modern-screenshot
templateManifest
templateRegistry
fields.text
kind: 'textarea'
browser-side export
```

Las coincidencias históricas dentro de `Docs/Plans/` se revisan en contexto y no
se eliminan automáticamente.

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

## Rollback

Si el deployment falla, revertir enlaces externos al último destino funcional,
pero no restaurar dos fuentes editables de documentación. Corregir el sitio y
repetir el gate antes de volver a anunciarlo.

## Exit gate

- [ ] Build de docs y gates del repositorio pasan.
- [ ] Quick Start, API de imagen y flujos de Studio fueron verificados.
- [ ] EN/ES pasan paridad y revisión visual.
- [ ] No quedan contratos eliminados enseñados como vigentes.
- [ ] El deployment público responde en todas las rutas principales.
- [ ] GitHub, npm y READMEs enlazan a la URL canónica.
- [ ] `Docs/en/` y `Docs/es/` fueron retirados después de verificar producción.
- [ ] El tracker maestro está cerrado con evidencia.
