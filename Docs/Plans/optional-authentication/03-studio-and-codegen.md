# Fase 3 - Studio y codegen

- **Estado:** Completada; el exit gate está satisfecho.

## Objetivo

Permitir el uso completo de Editor y Brand sin sesión, retirar las superficies de
gestión que necesitan identidad y mantener el modo autenticado existente.

## Rutas server-side

Actualizar `createStudioPage`:

- validar primero que la sección sea `editor`, `brand` o `settings`;
- con auth desactivada, responder `notFound()` para `settings` y renderizar Editor
  o Brand sin leer cookies ni SQLite;
- con auth activada, conservar lectura de `framekit_session`, `getSession()` y
  redirect a `/login`;
- permitir que el Client Component recibido acepte `user?: StudioUser`.

Actualizar `createLoginPage`:

- con auth desactivada, redirigir directamente a `/editor` sin leer sesión;
- con auth activada, conservar el flujo actual.

Un valor inválido de configuración debe fallar; no debe degradar silenciosamente
al modo abierto.

## Studio client

`FrameKitStudioProps` ya permite un usuario opcional. Usar esa señal para:

- renderizar Editor y Brand normalmente cuando `user` es `undefined`;
- ocultar el enlace a `/settings` del panel lateral;
- conservar idioma y tema, que no dependen de cuentas;
- no renderizar `FrameKitStudioSettings`, `AccountSettings`, `TokenSettings` o
  `AdminUsersSettings` sin usuario;
- mantener todos los controles actuales cuando existe usuario.

La ausencia de usuario no representa una sesión vencida dentro del modo abierto;
no se debe mostrar el mensaje `sessionRequired` ni navegar a `/login`.

## Codegen y contrato de tipos

Actualizar `createStudioClientModule()` para emitir:

```tsx
export function StudioClient ({ user }: { user?: StudioUser }) {
  return <FrameKitStudio templates={templates} brands={brands} user={user} />
}
```

Actualizar los type-tests de `createStudioPage` para exigir que un binding pueda
aceptar usuario ausente. Un componente que requiera `StudioUser` deja de ser
válido porque la factory debe servir ambos modos.

No editar a mano `src/generated/framekit/`; verificar el cambio mediante codegen
y regenerar con los comandos soportados cuando haga falta.

## Tests

- `studio/__tests__/page.test.tsx`: ambos modos, las tres secciones, login,
  cookies no consultadas en modo abierto y configuración inválida;
- tests de shell/sidebar: Ajustes ocultos sin usuario, pero idioma y tema siguen
  disponibles;
- tests de `FrameKitStudio`: Editor y Brand funcionan sin usuario;
- tests de codegen: prop opcional emitida y output estable;
- actualizar las aserciones exactas de
  `tooling/codegen/__tests__/write-template-module.test.ts` y ejecutar el binding
  generado una vez sin usuario y otra con un `StudioUser`;
- type-tests: bindings sin props o con usuario opcional pasan; usuario obligatorio
  y props adicionales obligatorias fallan;
- adapters de `apps/studio` y template permanecen delgados.

## Archivos principales

- `packages/framekit/src/studio/page.tsx`;
- `packages/framekit/src/studio/framekit-studio.tsx`;
- `packages/framekit/src/studio/shell/`;
- `packages/framekit/src/tooling/codegen/write-template-module.ts`;
- `packages/framekit/type-tests/integrations/studio/`;
- tests vecinos.

## Exit gate

La fase termina cuando Editor y Brand abren sin cookie por defecto, login y
Ajustes no son navegables en ese modo, idioma/tema permanecen disponibles, el
binding generado acepta usuario opcional y el modo autenticado conserva toda su
UI y protección previa.
