# Fase 4 - Studio, acceso y Editor

- **Estado:** Pendiente.
- **Depende de:** Fases 0-3.
- **Resultado:** Los flujos visibles de Studio, edición y administración están
  documentados según la UI actual.

## Objetivo

Sustituir la única guía de Studio por documentación orientada a tareas. Separar
edición, cuenta/tokens y administración, manteniendo una página conceptual para
el modelo de rutas y estado.

## Fuentes de verdad

```text
packages/framekit/src/editor/**
packages/framekit/src/studio/**
packages/framekit/src/server/access/**
apps/studio/src/app/**
packages/create-framekit/template/src/app/**
tests/e2e/studio.spec.ts
Docs/en/guides/studio.md
```

## Páginas objetivo

```text
en/users/concepts/studio.md
en/users/guides/use-studio.md
en/users/guides/manage-account-and-tokens.md
en/users/guides/manage-users.md
en/users/troubleshooting/studio.md
en/users/troubleshooting/access.md
```

## Contenido de Studio

- Rutas protegidas `/editor`, `/brand` y `/settings`.
- Login, logout y redirecciones de sesión.
- Sidebar responsive, navegación persistida y settings como opciones del sidebar.
- Diferencia entre variant de template e idioma de interfaz EN/ES.
- Tema light/dark y persistencia correspondiente.
- Carga, empty, invalid, not-found y error states.
- Controles nativos para los seis field kinds.
- Drafts numéricos, validación, primer control inválido y reset.
- Persistencia local `framekit:<slug>:v2` sin compatibilidad con `v1`.
- Preview, zoom, navegación de templates y brand catalog.
- Upload de imágenes durante desarrollo mediante la ruta protegida
  `POST /framekit/assets` y estados de error accesibles. Esta ruta pertenece al
  dev server y no forma parte del API de producción `/api/framekit/**`.

## Contenido de acceso y administración

- Cuenta propia, cambio de username y contraseña.
- Sesiones de 30 días y cierre por cambio de contraseña.
- Creación, visualización única, listado y revocación de tokens `fk_`.
- Roles `admin` y `user`.
- Creación, edición, activación, password reset y eliminación de usuarios.
- Protección del último administrador activo.
- Diferencia entre ocultar UI y autorización real del servidor.

## Exportación actual

- Download PNG y Copy PNG llaman a `/api/framekit/images/render`.
- El preview continúa siendo local, pero la captura PNG es server-side.
- Errores de validación `422` vuelven a los controles correspondientes.
- Acciones duplicadas quedan bloqueadas mientras existe una exportación pendiente.
- Éxito y error utilizan toast feedback accesible.
- Las acciones se adaptan a viewport estrecho.
- Copy espera que el documento recupere foco antes de escribir al clipboard.
- No existe fallback a `modern-screenshot` ni exportación browser-side clásica.

## Fuera de alcance

- Contrato HTTP completo y códigos de error.
- Configuración Docker, Chromium y reverse proxy.
- Personalización no soportada de la UI interna.

## Verificación

- Recorrer los flujos contra Studio actual en desktop y viewport móvil.
- Comparar permisos con routes y domain functions, no solo con componentes.
- Confirmar mensajes y acciones en inglés antes de la traducción de fase 9.
- Confirmar que screenshots o instrucciones no muestran la navegación anterior.

## Exit gate

- [ ] Los tres grupos de rutas y settings actuales están documentados.
- [ ] Flujos user/admin y restricciones coinciden con autorización server-side.
- [ ] Download/Copy se describen exclusivamente como server-backed.
- [ ] Persistencia, variants e idioma de interfaz están claramente separados.
- [ ] Troubleshooting cubre sesión, permisos, upload y clipboard.
