# Estructura del repositorio

## Estructura del espacio de trabajo

FrameKit es un monorepo de pnpm con un espacio de trabajo raíz privado que nunca se publica en npm.

El `package.json` raíz tiene `"private": true` y el nombre `framekit-workspace`, por lo que no puede publicarse accidentalmente. El `pnpm-workspace.yaml` raíz define la pertenencia con estos patrones:

```yaml
packages:
  - apps/*
  - packages/*
  - examples/*
```

El espacio de trabajo contiene cuatro espacios de trabajo secundarios:

| Espacio de trabajo          | Nombre                         | Privado | Propósito                                                                                                                    |
| --------------------------- | ------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `apps/studio/`              | `studio`                       | Sí      | Aplicación Next.js propia — interfaz del editor visual, plantillas, registro y rutas de la aplicación                       |
| `packages/framekit/`        | `@mauriciodmo/framekit`        | No      | Paquete público — runtime, componentes del editor, componentes de Studio, CLI, servidor de desarrollo y generación de código |
| `packages/create-framekit/` | `@mauriciodmo/create-framekit` | No      | CLI pública para la creación de proyectos                                                                                    |
| `examples/basic/`           | `framekit-example-basic`       | Sí      | Arnés mínimo de consumidor para pruebas de distribución                                                                      |

El espacio de trabajo raíz en sí no tiene dependencias de ejecución. Todo el código de la aplicación vive en los espacios de trabajo secundarios.

## Scripts raíz

El `package.json` raíz define scripts para todo el repositorio y un script de desarrollo enfocado:

```json
{
  "scripts": {
    "dev": "pnpm --filter @mauriciodmo/framekit build && pnpm --filter studio dev",
    "lint": "pnpm -r --if-present lint",
    "test": "pnpm -r --if-present test",
    "typecheck": "pnpm -r --if-present typecheck",
    "build": "pnpm -r --if-present build"
  }
}
```

- `pnpm dev` — primero compila el paquete público `@mauriciodmo/framekit` y luego inicia Studio. No ejecutes `pnpm dev` desde dentro de un directorio de paquete; siempre ejecútalo desde la raíz del repositorio.
- `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm build` — se ejecutan recursivamente en cada espacio de trabajo que defina el script correspondiente.

## Razón de la compilación primero del paquete

`@mauriciodmo/framekit` debe compilarse **antes** de que Studio o el ejemplo puedan ejecutarse. Tanto `studio` como `framekit-example-basic` declaran `@mauriciodmo/framekit` con un enlace `workspace:*`:

```json
"@mauriciodmo/framekit": "workspace:*"
```

Esto enlaza el directorio del paquete en disco, mientras sus `exports` apuntan a los archivos compilados de `dist/`. La salida en `dist/` del paquete (JavaScript, declaraciones de tipos, CSS) no existe hasta que se ejecuta una compilación. El `pnpm dev` raíz aplica el orden correcto compilando primero el paquete y luego iniciando Studio.

Ejecutar `pnpm dev` desde dentro de un directorio de paquete evita este ordenamiento y fallará porque el `dist/` que intenta importar aún no existe.

El paquete público solo exporta `.`, `./editor`, `./studio`, `./studio/root`, `./dev` y `./styles.css`. Los imports desde `packages/framekit/src/*` no forman parte del contrato del consumidor. El proyecto generado usa la versión publicada del paquete, no `workspace:*`.

## Comandos enfocados en paquetes específicos

Para orientar un espacio de trabajo específico sin ejecutar recursivamente todos, usa `pnpm --filter`:

```bash
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
pnpm --filter studio dev
pnpm --filter framekit-example-basic build
```

Estos son equivalentes a ejecutar el script dentro del directorio de ese paquete.

## Archivos generados y artefactos de compilación

Las siguientes rutas se producen durante el desarrollo:

| Ruta                               | Contenido                                                                                       | Estado en git                                                                                             |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `.framekit/generated/templates.ts` | Registro de plantillas tipado auto-generado                                                     | **Ignorado** — se regenera con `framekit generate` cuando es necesario |
| `.framekit/next/`                  | Salida de compilación de Next.js, incluyendo el servidor standalone (Studio o ejemplo)          | Ignorado                                                                                                  |
| `packages/framekit/dist/`          | JavaScript compilado (ESM), declaraciones de tipos (`.d.ts`) y `styles.css` del paquete público | Ignorado                                                                                                  |

Los tres directorios están en `.gitignore` mediante `**/.framekit/`, `**/dist/` y patrones específicos de Next.js en `.next/`. El registro generado es desechable y debe regenerarse antes de ejecutar comandos que lo importen.

## Qué pertenece a cada lugar

Usa esta guía para determinar dónde debe vivir un determinado archivo o pieza de código:

**`packages/framekit/src/`** — Todo código reutilizable destinado a consumidores externos:
- Núcleo del runtime (`defineTemplate`, `validateTemplateData`, definiciones de campos, ayudantes de renderizado)
- Componentes React del editor
- Componentes React de Studio (shell principal, paneles, rutas)
- Escáner y generador de código
- Puntos de entrada de la CLI
- Servidor de desarrollo

**`packages/create-framekit/src/`** — Lógica solo para la CLI de creación de proyectos `create-framekit`. El punto de entrada binario de la CLI vive aquí; las plantillas viven en `template/`.

**`apps/studio/src/`** — Código específico de la aplicación Next.js propia:
- Rutas, páginas y manejadores de API de Next.js
- i18n a nivel de aplicación (cadenas de localización para el usuario)
- Recursos públicos y assets de Studio
- `next.config.ts`, configuración local de ESLint y TypeScript
- Pruebas de integración que ejercitan el flujo completo de generación de Studio

**`examples/basic/`** — Un proyecto Next.js independiente que importa `@mauriciodmo/framekit` como lo haría un consumidor. No tiene código compartido con Studio y sirve como arnés de prueba de distribución.

**Archivos incluidos en los tarballs de npm** — `README.md` y `LICENSE` dentro de `packages/framekit/` y `packages/create-framekit/` se incluyen en los paquetes publicados mediante el campo `files` en cada `package.json`.

**Registros históricos de ingeniería** — Los documentos en `Docs/Plans/framekit-alpha/` capturan decisiones de diseño e historial de migración. No son documentación para usuarios y no están sincronizados con los detalles de implementación actuales.

## Flujo de desarrollo

### Configuración inicial

```bash
git clone <repository-url>
cd FrameKit
pnpm install --frozen-lockfile
pnpm dev
```

Esto instala todas las dependencias del espacio de trabajo, compila `@mauriciodmo/framekit` e inicia Studio.

### Después de agregar dependencias

Si agregas una nueva dependencia a cualquier `package.json`, ejecuta la compilación raíz para propagar el archivo de bloqueo y recompilar el paquete:

```bash
pnpm build
```

Esto ejecuta `pnpm -r --if-present build`, que recompila cada espacio de trabajo que define un script de compilación.

### Ejecutar pruebas

Las pruebas usan [Vitest](https://vitest.dev). Los componentes del editor usan `jsdom` para simulación del DOM.

```bash
# Ejecutar todas las pruebas en todos los espacios de trabajo
pnpm test

# Ejecutar pruebas de un paquete específico
pnpm --filter @mauriciodmo/framekit test
```

### Verificación de tipos

La verificación de tipos ejecuta `tsc --noEmit` en cada paquete. Adicionalmente, `@mauriciodmo/framekit` ejecuta una segunda verificación de tipos contra un fixture dedicado en `packages/framekit/tests/types/` mediante `tsc --noEmit -p tests/types/tsconfig.json`. Esto detecta problemas de exportación de tipos que una verificación de un solo paquete podría pasar por alto.

```bash
pnpm typecheck
```

---

[English](../../en/development/repository.md) · [Español](./repository.md)
