# FrameKit Documentation Site

- **Estado:** Activo; fases pendientes.
- **Última revisión:** 2026-09-17.
- **Alcance:** Convertir `apps/docs` en la documentación canónica bilingüe de
  FrameKit, separada por audiencia y alineada con el producto actual.
- **Release:** Este plan no selecciona versiones ni dist-tags.
- **Fuera del sitio:** `Docs/Plans/` y `Docs/skills/` permanecen en sus
  ubicaciones actuales.

Este directorio es el tracker operativo de la migración documental. Cada fase
tiene su propio alcance, fuentes de verdad, verificaciones y exit gate. El
contenido publicado vive bajo `apps/docs/src/content/docs/`; estos documentos
solo coordinan el trabajo.

## Decisiones aprobadas

- La primera división del sitio es por audiencia: `users/` y `contributors/`.
- Inglés se publica con prefijo `/en/` y español con prefijo `/es/`.
- Ambos idiomas tienen la misma jerarquía y responsabilidad temática.
- `Docs/en/` y `Docs/es/` se retiran cuando el sitio Starlight esté publicado y
  todos los enlaces del repositorio apunten al sitio nuevo.
- No se mantienen dos copias permanentes de la documentación pública.
- El estado actual del código, tests, manifests y template canónico tiene
  prioridad sobre READMEs, documentación antigua y lenguaje histórico de Plans.
- El contenido publicado se basa solo en contratos verificables actuales; la
  historia puede explicar el plan, pero no se convierte en referencia de uso.
- Se añade una sección de deployment para cubrir Chromium, Docker, SQLite,
  persistencia, reverse proxies y límites de topología.
- No se crea una página por cada función o comando si una referencia agrupada
  responde mejor a una sola responsabilidad.

## Fuentes de verdad

Usa este orden cuando dos fuentes discrepen:

1. `packages/framekit/package.json`, `packages/create-framekit/package.json` y
   sus exports/bin publicados.
2. Implementación y tests bajo `packages/framekit/src/` y
   `packages/create-framekit/src/`.
3. Template canónico en `packages/create-framekit/template/`.
4. Integración first-party en `apps/studio/`.
5. `CHANGELOG.md` para cambios todavía no publicados.
6. Documentación existente bajo `Docs/en/`, `Docs/es` y los README como material
   de migración, nunca como autoridad superior al código.

## Arquitectura objetivo

```text
apps/docs/src/content/docs/
├── en/
│   ├── index.mdx
│   ├── users/
│   │   ├── index.md
│   │   ├── getting-started/
│   │   ├── concepts/
│   │   ├── guides/
│   │   ├── reference/
│   │   │   ├── package-api/
│   │   │   ├── http-api/
│   │   │   └── cli/
│   │   ├── deployment/
│   │   ├── migrations/
│   │   └── troubleshooting/
│   └── contributors/
│       ├── index.md
│       ├── getting-started/
│       ├── architecture/
│       ├── development/
│       ├── testing/
│       ├── distribution/
│       ├── releases/
│       └── documentation/
└── es/
    └── estructura equivalente a en/
```

## Secuencia

| Orden | Fase | Resultado |
|---:|---|---|
| 0 | [Estado actual y decisiones](./00-current-state-and-decisions.md) | Inventario y contratos congelados; [detalle del inventario](./00-content-inventory.md) |
| 1 | [Base Starlight y navegación](./01-starlight-foundation-and-navigation.md) | Sitio bilingüe estructuralmente listo |
| 2 | [Inicio para usuarios](./02-user-getting-started.md) | Ruta funcional desde instalación hasta primer template |
| 3 | [Templates, fields y brand](./03-templates-fields-and-brand.md) | Modelo de autoría actual documentado |
| 4 | [Studio, acceso y Editor](./04-studio-access-and-editor.md) | Flujos de producto y administración documentados |
| 5 | [API de imágenes, seguridad y deployment](./05-image-api-security-and-deployment.md) | Contrato server-side y operación documentados |
| 6 | [Referencia, migraciones y troubleshooting](./06-user-reference-migrations-and-troubleshooting.md) | Superficie pública consultable y soporte operativo |
| 7 | [Onboarding y arquitectura para contribuidores](./07-contributor-onboarding-and-architecture.md) | Mapa vigente del monorepo y sus límites |
| 8 | [Workflow, testing y releases](./08-contributor-workflow-testing-and-releases.md) | Operación del repositorio documentada |
| 9 | [Localización y migración legacy](./09-spanish-localization-and-legacy-migration.md) | Paridad EN/ES y retirada legacy preparada |
| 10 | [Verificación y rollout](./10-verification-and-rollout.md) | Sitio publicado, enlaces migrados y copias legacy retiradas |

Las fases son secuenciales para evitar traducir o enlazar una arquitectura que
todavía cambia. El contenido inglés se estabiliza en las fases 2-8 y se replica
al español en la fase 9 antes de publicar.

El trabajo realizado en la fase 0 está documentado en
[00-content-inventory.md](./00-content-inventory.md). Ese archivo sirve como
inventario operativo: registra las fuentes verificadas, el alcance actual de la
documentación pública, la disposición de los documentos legacy, el manifest de
páginas objetivo y la matriz de exports, comandos y superficies que las fases
siguientes deben cubrir. No publica contenido ni sustituye a la documentación
del producto.

## Baseline que debe preservarse

- El paquete publica `.`, `./client`, `./editor`, `./next`, `./studio`,
  `./studio/root`, `./dev`, `./server` y `./styles.css`.
- `framekit` ofrece `generate`, `check`, `dev`, `build`, `start` y
  `browser install [--with-deps]`.
- `create-framekit` crea proyectos y ofrece `update-skills`.
- El contrato de templates usa `meta`, dimensiones, `fields`, `content`,
  `variants` y `render`.
- Existen seis tipos de field: text, number, boolean, choice, color e image.
  `language` puede ser una clave, pero no es un tipo ni metadata especial.
- `dev`, `check` y `build` regeneran el registry; `start` es read-only.
- Studio protege `/editor`, `/brand` y `/settings` con sesiones SQLite.
- Studio ofrece cuenta, contraseña, API tokens y administración de usuarios.
- Download PNG y Copy PNG usan `POST /api/framekit/images/render`.
- La API de imagen acepta sesión same-origin o Bearer token de base de datos.
- El contenido publicado enumera únicamente rutas, variables, exports y
  comportamientos verificados en las fuentes actuales.
- El template Docker prepara `/data`, pero SQLite solo persiste si el deployment
  monta ese directorio como volumen; los render jobs siguen siendo memoria de
  proceso.
- El target soportado inicial es un proceso Node de larga duración por
  contenedor, con HTTPS y throttling externos para exposición pública.

## Reglas de ejecución

- Una página debe tener una audiencia principal y una responsabilidad principal.
- No copies texto histórico sin verificarlo contra la implementación actual.
- No documentes imports directos desde `packages/framekit/src/**`.
- No edites outputs generados para completar una fase.
- Mantén ejemplos de consumidor sobre exports publicados.
- Cada fase actualiza este tracker cuando completa su exit gate.
- No retires `Docs/en/` ni `Docs/es/` hasta que la fase 10 haya verificado el
  deployment de producción.
- No anuncies el sitio como canónico antes del gate de la fase 10.

## Gate global

- [ ] Las fases 0-10 están completadas.
- [ ] `/en/` y `/es/` tienen paridad de rutas y temas.
- [ ] No queda contenido placeholder de Starlight.
- [ ] El contenido publicado refleja únicamente contratos actuales verificados.
- [ ] Todos los exports y comandos publicados están representados.
- [ ] Los requisitos de seguridad y deployment están visibles antes de los
  ejemplos de exposición pública.
- [ ] Los enlaces del repositorio apuntan al sitio nuevo.
- [ ] `Docs/en/` y `Docs/es/` fueron retirados.
- [ ] `Docs/Plans/` y `Docs/skills/` permanecen separados.
- [ ] `pnpm --filter docs build` pasa.
- [ ] `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan.
