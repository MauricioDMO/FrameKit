# Guía de Migración Rolling

Esta es la guía rolling actual para adoptar el contrato implementado sin
versión. Intencionalmente no selecciona una versión de release del paquete.
Para la ruta de release anterior de 0.7.0 a 0.8.0, consulta la [guía de
migración histórica](./migration-v0.8.0.md).

## Prerrequisitos y alcance actuales

- Usa Node.js `>=22.13.0` y pnpm `>=11.14.0`, como exigen los manifests
  actuales del workspace y de los paquetes públicos. Los rangos actuales de
  peers del runtime público son Next.js `>=16 <17` y React/React DOM `>=19 <20`.
- Esta guía no exige una versión alpha, futura ni preseleccionada del paquete.
  La selección de versión de release es un paso separado de los maintainers.
- El comportamiento canónico existente de runtime y Studio descrito aquí está
  implementado. La API de generación de imágenes en servidor está disponible
  mediante la ruta `POST /api/v1/images` del consumidor generado; instala
  explícitamente su headless shell de Chromium con `framekit browser install`
  antes de servir solicitudes.
- La Fase 4 de Studio Access & API Rendering (SQLite, migraciones, usuarios,
  contraseñas, bootstrap, sesiones, acceso HTTP, protección de rutas y gestión
  de tokens/usuarios) está implementada. Las fases posteriores de renderizado
  server-side siguen sin estar disponibles. El Paso 8 de Server Image Rendering
  continúa bloqueado hasta completar ese plan; la exportación server-side de
  Studio todavía no está disponible.

Esta guía rolling es el entregable documental del [issue #14 de
GitHub](https://github.com/MauricioDMO/FrameKit/issues/14).

## Base De Persistencia De Studio

La Fase 1 del plan de acceso a Studio ya está implementada. Añade una capa
interna de SQLite mediante `node:sqlite`, pero todavía no cambia el flujo de
autenticación ni convierte Studio en una ruta protegida.

- `FRAMEKIT_DATABASE_PATH` se lee de forma lazy. Las rutas relativas se resuelven
  desde el directorio de trabajo de la aplicación y, si se omite, la base se crea
  en `.framekit-data/framekit.sqlite`.
- La primera migración usa `PRAGMA user_version = 1` y crea las tablas estrictas
  `users`, `sessions` y `api_tokens`, con sus índices y claves foráneas.
- La conexión se abre solo cuando el runtime de acceso la solicita. Importar las
  facades del paquete, generar el registro o construir la aplicación no crea la
  base de datos ni sus archivos WAL/SHM.
- La conexión se reutiliza por ruta de base de datos dentro del proceso mediante
  estado global. La base queda reservada para datos de acceso; los render jobs
  continúan siendo temporales y permanecen en el `Map` en memoria del proceso.
- `.framekit-data/` está excluido de Git, del contexto Docker y de los tarballs.
  No uses `.framekit/`, porque esa ruta sigue reservada para output descartable de
  FrameKit.

`node:sqlite` continúa siendo una API en desarrollo activo en Node.js 22; por
eso el runtime mínimo es Node.js `>=22.13.0`. La base de la Fase 1 solo prepara
tablas vacías; la Fase 2 las usa para el bootstrap lazy, en tiempo de solicitud,
del primer administrador y para las credenciales locales. La Fase 3 añade el
login y las sesiones HTTP, las rutas protegidas de Studio y los uploads
autenticados de assets en desarrollo. La Fase 4 añade rutas autenticadas de
gestión de tokens y usuarios. La UI de acceso de Studio y Download/Copy
server-side pertenecen a fases posteriores. `FRAMEKIT_ADMIN_USERNAME` y
`FRAMEKIT_ADMIN_PASSWORD` solo se aplican durante el primer bootstrap;
`FRAMEKIT_API_KEY` solo se importa en ese momento, mientras el handler clásico
de imágenes continúa leyéndola de forma independiente.

Con la Fase 4 implementada, la ruta `POST /api/v1/images` continúa
autenticándose con `FRAMEKIT_API_KEY`, y Download PNG y Copy PNG siguen usando el
exportador actual del navegador. La UI de acceso de Studio y Download/Copy
server-side siguen siendo fases posteriores. Esta base tampoco migra datos de plantillas,
assets ni estado persistido del editor.

La API de imágenes en servidor sigue limitada a un proceso Node.js de larga
duración por contenedor. Los render jobs son locales al proceso, desaparecen al
reiniciar, no se guardan en SQLite y no admiten ejecución serverless ni múltiples
réplicas.

## Credenciales y bootstrap del primer administrador

La Fase 2 del plan de acceso a Studio ya está implementada. Añade credenciales
locales y operaciones seguras de usuarios, pero todavía no incorpora handlers
HTTP ni UI.

- Las contraseñas deben tener entre 12 y 256 bytes UTF-8. Se calculan de forma
  asíncrona con el perfil fijo `scrypt:v1` y salts aleatorias; la base de datos
  solo guarda hashes de contraseñas y de secretos de API importados. El DTO
  seguro `StudioUser` solo expone `id`, `username` y `role`.
- En la primera inicialización perezosa, en tiempo de solicitud, de una base
  vacía, `FRAMEKIT_ADMIN_PASSWORD` es obligatorio y
  `FRAMEKIT_ADMIN_USERNAME` usa `admin` por defecto. `FRAMEKIT_DATABASE_PATH`
  continúa seleccionando la ruta de la base de datos.
- Si `FRAMEKIT_API_KEY` no está vacío durante ese primer bootstrap, se importa
  una sola vez como hash SHA-256 de un token API heredado. Cuando ya existe
  cualquier usuario, se ignoran los valores de entorno del bootstrap y la
  cuenta no vuelve a sincronizarse desde el entorno.
- Las mutaciones validan el nombre de usuario, el rol, el estado activo, los
  cambios y restablecimientos de contraseña y la eliminación. Cambiar o
  restablecer una contraseña, y desactivar un usuario, elimina sus sesiones; una
  transacción impide eliminar, desactivar o degradar al último administrador
  activo.
- La Fase 3 proporciona el login, las sesiones HTTP y las rutas protegidas de
  Studio. La Fase 4 proporciona rutas de gestión de tokens y usuarios.
  `POST /api/v1/images` sigue usando `FRAMEKIT_API_KEY`, y Download PNG y Copy PNG
  siguen usando el exportador del navegador; sus versiones server-side siguen
  siendo fases posteriores.

## Acceso A Studio, Sesiones, Protección Y Gestión De Rutas

La Fase 4 de Studio Access & API Rendering está implementada. Las fases 1-4 ya
están disponibles; la UI de acceso de Studio y Download/Copy server-side siguen
siendo fases posteriores.

El handler de acceso expone estas rutas:

```text
POST  /api/framekit/login
POST  /api/framekit/logout
GET   /api/framekit/account
PATCH /api/framekit/account
POST  /api/framekit/account/password
GET   /api/framekit/tokens
POST  /api/framekit/tokens
DELETE /api/framekit/tokens/:id
GET   /api/framekit/users
POST  /api/framekit/users
PATCH /api/framekit/users/:id
DELETE /api/framekit/users/:id
POST  /api/framekit/users/:id/password
GET   /api/framekit/users/:id/tokens
```

El login crea la sesión que usan las rutas autenticadas. Un usuario normal puede
leer y actualizar su cuenta, cambiar su contraseña, crear/listar/revocar sus
propios tokens API y listar los metadatos de sus propios tokens. Un administrador
también puede listar/crear/actualizar/eliminar usuarios, restablecer contraseñas,
listar metadatos de tokens de cualquier usuario y revocar cualquier token. Las
respuestas de login, cuenta y creación/actualización de usuarios solo exponen
los campos seguros de `StudioUser`: `id`, `username` y `role`; la lista
administrativa de usuarios también expone `active`, `createdAt` y `updatedAt`.
Ninguna respuesta expone hashes de contraseñas, secretos de sesión, hashes de
tokens ni secretos de tokens ya devueltos.

Al crear un token, su valor completo `token` se devuelve una sola vez, en la
respuesta `201`. Las listas posteriores y la base de datos contienen solo
metadatos y un hash, nunca el secreto completo. Los metadatos incluyen `id`,
`name`, `tokenPrefix`, `createdAt`, `lastUsedAt` y `revokedAt`. La búsqueda
Bearer de tokens API calcula el hash de la credencial presentada, acotada y no
vacía, exige un token no revocado cuyo propietario esté activo y registra
`lastUsedAt` cuando la búsqueda es correcta. No exige el prefijo `fk_` de los
tokens generados, por lo que admite credenciales heredadas importadas. El
contrato Bearer de la API clásica de imágenes sigue usando `FRAMEKIT_API_KEY`;
estas rutas de gestión de Studio usan la cookie de sesión.

Solo durante el primer bootstrap, un `FRAMEKIT_API_KEY` no vacío se importa como
token API heredado del primer administrador. Su secreto se guarda como hash y no
se vuelve a importar ni sincronizar después de que exista cualquier usuario.

Las operaciones protegidas de cuenta, tokens y gestión de usuarios devuelven
`401` cuando falta la sesión o no es válida; las credenciales de login inválidas
también devuelven `401`. Logout es idempotente: devuelve `200` y expira la cookie
incluso sin una sesión válida. Los usuarios normales reciben `403` en
operaciones exclusivas de administradores o al consultar metadatos de tokens de
otro usuario. Los usuarios desconocidos, los destinos de tokens no disponibles
y las revocaciones fuera de los permisos del actor devuelven `404`; los métodos
no admitidos devuelven `405`; los nombres de usuario duplicados y los intentos
de eliminar, desactivar o degradar al último administrador activo devuelven
`409`.

Un login correcto establece una cookie `framekit_session` con `HttpOnly`,
`SameSite=Lax`, `Path=/` y una duración de 30 días mediante `Expires`/`Max-Age`.
También establece `Secure` cuando `NODE_ENV=production`. La base de datos solo
guarda el hash SHA-256 de la sesión y sus metadatos de usuario, creación y
expiración; el secreto crudo solo se devuelve en la cookie. Logout elimina la
sesión guardada actual y expira la cookie del navegador. Cambiar la contraseña
invalida todas las sesiones del usuario y expira la cookie actual. Las respuestas
de login, cuenta y creación/actualización de usuarios solo exponen los campos
seguros de `StudioUser`: `id`, `username` y `role`; las listas administrativas
de usuarios también incluyen los campos seguros `active`, `createdAt` y
`updatedAt`.

El login y cada solicitud insegura autenticada por cookie requieren un header
`Origin` cuyo valor coincida exactamente con el origen canónico de la solicitud.
En solicitudes directas es `new URL(request.url).origin`. Como el adaptador de
Next 16 puede construir `request.url` usando el hostname y puerto internos
configurados, la ruta soportada detrás de un reverse proxy HTTPS usa un único
valor válido `x-forwarded-proto: https` y una única autoridad válida
`x-forwarded-host` como origen público canónico. Los overrides incompletos,
ambiguos, malformados o no HTTPS se rechazan antes de leer el body o mutar
datos. El proxy debe sobrescribir o eliminar los headers de forwarding enviados
por el cliente; no existe un fallback `FRAMEKIT_PUBLIC_ORIGIN`. La forma
soportada detrás de un reverse proxy HTTPS es:

```text
browser/request URL: https://framekit.example.com/api/framekit/...
reverse proxy -> container: http://127.0.0.1:3000
Origin: https://framekit.example.com
```

El proxy reenvía el host y el protocolo externos mediante sus headers normales
para que el handler use el origen público canónico aunque Next.js conserve el
origen interno en `request.url`; no hace falta configurar
`FRAMEKIT_PUBLIC_ORIGIN`.

Las secciones `editor` y `brand` de Studio validan una sesión activa y redirigen
a `/login` cuando falta o es inválida. La página de login redirige a `/editor`
si la sesión ya está autenticada y, en caso contrario, muestra el formulario.
El upload autenticado de `/framekit/assets` en el servidor de desarrollo exige
una sesión válida y el `Origin` del mismo origen antes de procesar o escribir un
asset.

`/framekit/render/[id]` sigue siendo independiente de las sesiones de Studio.
Su ID interno de render job y `x-framekit-render-token` continúan siendo la única
frontera de autenticación de esa ruta privada.

La Fase 4 no introduce migración de plantillas, assets, estado del editor ni
versión de release. El comportamiento existente de la API de imágenes y del
exportador del navegador no cambia; la UI de acceso de Studio y Download/Copy
server-side siguen siendo fases posteriores.

## Integración De Renderizado En Servidor

Los proyectos generados incluyen la ruta aditiva de PNG en servidor. El
`next.config.ts` generado usa `withFrameKit()`, la ruta unificada de secciones
conserva las URLs existentes `/editor` y `/brand`, y las rutas explícitas de la
API y del render privado siguen siendo propiedad de la aplicación. `framekit
generate` recrea los bindings `studio-client.tsx` y `render-client.tsx` bajo
`src/generated/framekit/`; no edites esos archivos manualmente ni agregues un
binding de render hermano dentro del directorio de la ruta.

Para renderizar en servidor, instala el runtime del navegador desde el paquete
de FrameKit en lugar de agregar una dependencia `playwright-core` al consumidor:

```sh
framekit browser install
framekit browser install --with-deps
```

La segunda forma instala dependencias del sistema en Linux y puede requerir
permisos de root o equivalentes. El Dockerfile generado es exclusivo de pnpm y
requiere un `pnpm-lock.yaml` generado; las claves de API y la política de hosts
de imágenes se suministran en runtime, no se incorporan a la imagen. Las
aplicaciones existentes pueden conservar sus rutas manuales y su configuración
de Next, pero deben ejecutar `framekit generate`, `framekit check`, `framekit
build` y una petición PNG de producción después de adoptar la ruta de servidor.
Esta funcionalidad no migra datos de plantillas, assets ni estado persistido del
editor.

## Contrato Canónico De Plantillas

El issue [#1](https://github.com/MauricioDMO/FrameKit/issues/1) establece una
única forma de plantilla para el runtime y Studio. Actualiza cada definición
para incluir:

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: { title: 'Título de la plantilla' },
  width: 1200,
  height: 630,
  fields: { title: field.text({ label: 'Título' }) },
  variants: { default: 'square', labels: { square: 'Square' } },
  content: { square: { title: 'Hola' } },
  render({ data, assets, variant, width, height }) {
    return <article style={{ width, height }}>{data.title}</article>
  },
})
```

El nombre `locale` y la propiedad `language` de nivel de entrada que aparecen
abajo se refieren únicamente a APIs antiguas del código fuente de las
plantillas. No son propiedades actuales; reemplázalos durante la migración.

Cambios requeridos en el código fuente:

- agrega los objetos `meta` y `variants`;
- mueve los nombres visibles a `variants.labels`;
- elimina las propiedades `language` de cada entrada; las entradas solo contienen valores de fields;
- cambia el input de renderizado de `locale` a `variant`;
- elimina cualquier propiedad superior de versión o forma de contrato alternativa no soportada;
- ejecuta `framekit generate`, `framekit check` y `framekit build`.

Este es un cambio incompatible en el código fuente de las plantillas. No existe
un alias de compatibilidad ni un comando de migración automático. Los cambios
de metadata y fields que siguen forman parte del mismo contrato actual.

Consulta el [issue del contrato canónico](https://github.com/MauricioDMO/FrameKit/issues/1)
y la [referencia del contrato de plantilla](../reference/template-contract.md).

## Metadata De La Plantilla

El issue [#3](https://github.com/MauricioDMO/FrameKit/issues/3) hace exacto el
contrato de metadata. Actualiza cada definición para que `meta` tenga un
`title` no vacío; de forma opcional puede incluir `description`,
`marketingDescription` y `tags`. Elimina `revision`, `status`, `keywords`,
`order` y cualquier otra propiedad de metadata no soportada. El título es
obligatorio aunque el nombre del directorio ya parezca una etiqueta adecuada
del catálogo: no existe fallback al slug. Es una actualización de código fuente
obligatoria para las plantillas existentes, no un cambio aditivo sin migración.

Consulta el [issue de metadata](https://github.com/MauricioDMO/FrameKit/issues/3)
y la [referencia del contrato de plantilla](../reference/template-contract.md#metadata-de-la-plantilla).

## Variantes De Contenido

El issue [#4](https://github.com/MauricioDMO/FrameKit/issues/4) reemplaza el
contrato de contenido de plantillas basado en locale por variantes explícitas.
La terminología basada en locale es solo contexto histórico de migración: una
variante es una key genérica y arbitraria de `content`, no un idioma. Son
válidas keys como `square`, `campaign-a` o `en` cuando se declaran en `content`.

Actualiza las plantillas y consumidores del editor existentes de esta forma:

- conserva entradas de `content` que solo contengan valores de fields y elimina cualquier metadata `language` de nivel de entrada;
- exige que `variants.default` nombre una key de contenido existente;
- deja `variants.labels` como opcional y exige que cada key de label nombre una key de contenido existente;
- rechaza `variants.mode`, otras propiedades de variante no soportadas, labels desconocidas, defaults desconocidos y variantes solicitadas que no estén definidas;
- cambia `getLocales` por `getVariants` sin alias de compatibilidad;
- cambia los nombres de estado y acciones del contenido del editor de los
  antiguos nombres de locale a variante;
- cambia la persistencia del editor de `framekit:<slug>:v1` a `framekit:<slug>:v2`; el estado antiguo `v1` se descarta, no se migra.

Este es un cambio incompatible de código fuente y persistencia. No existe un
alias de compatibilidad ni un comando de migración automático. El locale de la
interfaz de Studio (`FrameKitLocale`, EN/ES) es independiente de las variantes
de plantilla; cambiar el idioma de la interfaz no cambia la variante
seleccionada. Ejecuta `framekit generate`, `framekit check` y `framekit build`
después de actualizar las plantillas.

Consulta el [issue de variantes de contenido](https://github.com/MauricioDMO/FrameKit/issues/4)
y la [referencia del contrato de plantilla](../reference/template-contract.md).

## Fields Semánticos

El issue [#5](https://github.com/MauricioDMO/FrameKit/issues/5) hace singular la
API de fábricas de fields y elimina el kind duplicado de textarea. Las
referencias al namespace plural antiguo `fields` y a `fields.textarea` que
siguen son solo contexto histórico de migración. La API actual es `field.*`; la
propiedad de la definición sigue llamándose `fields`. Actualiza el código
fuente de las plantillas así:

- cambia el import raíz de `fields` a `field`;
- conserva la propiedad `fields` dentro de la definición de la plantilla;
- cambia `fields.text`, `fields.color`, `fields.number` y `fields.image` por
  `field.text`, `field.color`, `field.number` y `field.image`;
- cambia cada `fields.textarea` por `field.text`;
- usa `minLength` y `maxLength` únicamente en `field.text`; deben ser enteros
  finitos no negativos y cumplir `minLength <= maxLength`;
- espera que `field.text` renderice un `<textarea>` nativo multilínea y conserve
  los saltos de línea;
- maneja los errores de validación `text_too_short` y `text_too_long` sin
  eliminar espacios antes de medir la longitud.

No existe un alias de compatibilidad `fields`, ni `field.textarea`, ni un kind
separado `textarea`. Este es un cambio incompatible del código fuente, no un
cambio aditivo sin migración. Ejecuta `framekit generate`, `framekit check` y
`framekit build` después de actualizar el starter y las plantillas del proyecto.

Consulta el [issue de fields semánticos](https://github.com/MauricioDMO/FrameKit/issues/5),
la [referencia del contrato de plantilla](../reference/template-contract.md) y la
[referencia de la API pública](../reference/public-api.md).

## Campo Choice

El issue [#6](https://github.com/MauricioDMO/FrameKit/issues/6) agrega
`field.choice` para valores string de conjunto cerrado. Es un cambio aditivo;
los fields text, number, color e image existentes no requieren migración.

Declara una lista de opciones ordenada y no vacía, junto con un valor
predeterminado obligatorio que coincida con una de ellas:

```tsx
alignment: field.choice({
  label: 'Alineación',
  options: [
    { value: 'left', label: 'Izquierda' },
    { value: 'center', label: 'Centro' },
    { value: 'right', label: 'Derecha' },
  ],
  defaultValue: 'center',
})
```

Studio renderiza un `<select>` nativo en el orden declarado. Los fields choice
no aceptan `required` ni `control`; sus valores no se recortan ni convierten. El
contenido y las ediciones deben usar un string declarado. Un valor desconocido
falla la validación de datos con `{ code: 'invalid_choice' }` en lugar de
seleccionar la primera opción como fallback.

Consulta el [issue del field choice](https://github.com/MauricioDMO/FrameKit/issues/6),
la [referencia del contrato de plantilla](../reference/template-contract.md) y la
[referencia de la API pública](../reference/public-api.md).

## Campo Boolean

El issue [#7](https://github.com/MauricioDMO/FrameKit/issues/7) agrega
`field.boolean` para decisiones binarias. Esto cambia la frontera de valores de
los fields boolean de strings a booleanos reales. Los fields text, number, color,
image y choice existentes no requieren migración salvo que se conviertan a
boolean.

Declara el field con un valor predeterminado booleano opcional:

```tsx
showLogo: field.boolean({
  label: 'Mostrar logo',
  defaultValue: true,
})
```

Actualiza el contenido y el render de cada field boolean para usar `true` o
`false`, no strings `'true'` ni `'false'`. Si se omite `defaultValue`, el valor
resuelto es `false`. Studio usa un checkbox nativo y las ediciones persistidas
también deben ser booleanos reales; los overrides antiguos con strings se
descartan en lugar de convertirse. Los fields boolean no aceptan `required` ni
`control`.

Los valores de runtime incorrectos devuelven `{ code: 'invalid_boolean' }`. Usa
un field `choice` para valores de tres estados en lugar de recomendar o guardar
strings `'true'`/`'false'`. Es un kind aditivo para plantillas existentes, pero
adoptarlo requiere la actualización tipada del código fuente anterior. Ejecuta
`framekit generate`, `framekit check` y `framekit build` después de actualizar las
plantillas.

Consulta el [issue del field boolean](https://github.com/MauricioDMO/FrameKit/issues/7),
la [referencia del contrato de plantilla](../reference/template-contract.md) y la
[referencia de la API pública](../reference/public-api.md).

## Campo Number

El issue [#8](https://github.com/MauricioDMO/FrameKit/issues/8) cambia
el contrato de `field.number`. Es un cambio incompatible para adoptar fields
number: no existe alias de compatibilidad, coerción de strings numéricos ni
migración automática.

Actualiza cada field number de esta forma:

- reemplaza cada `defaultValue` string por un number finito obligatorio, como
  `defaultValue: 10` en lugar de `defaultValue: '10'`;
- elimina `required`; los fields number siempre están presentes porque su
  `defaultValue` numérico es obligatorio;
- reemplaza por numbers finitos los valores string de cada variante de
  `content`;
- reemplaza o elimina los overrides string persistidos antes de usarlos; los
  overrides deben ser numbers finitos y no se convierten automáticamente;
- mantén `min` y `max`, cuando se proporcionen, finitos y ordenados (`min <= max`);
- usa un `step` finito y positivo, cuyo valor predeterminado es `1` y sigue la
  semántica numérica/de rango nativa;
- usa `control: 'input'` (el valor predeterminado) para un `<input
  type="number">` nativo, o `control: 'slider'` para un `<input type="range">`
  nativo; los fields slider exigen límites `min` y `max` finitos explícitos y
  muestran el valor actual.

Los valores de contenido, overrides, datos resueltos y props de renderizado deben
ser numbers finitos. Los strings numéricos se rechazan sin conversión. Durante
una edición vacía o temporalmente incorrecta, Studio mantiene un draft local
separado de los datos numéricos confirmados; ese draft no es render data y nunca
se pasa a `render`.

```tsx
count: field.number({
  label: 'Count',
  defaultValue: 10,
  min: 0,
  max: 100,
})
```

Ejecuta `framekit generate`, `framekit check` y `framekit build` después de
actualizar los fields number.

Consulta el [issue del field number](https://github.com/MauricioDMO/FrameKit/issues/8),
la [referencia del contrato de plantilla](../reference/template-contract.md#number)
y la [referencia de la API pública](../reference/public-api.md).

## Registro Generado De Plantillas

El issue [#12](https://github.com/MauricioDMO/FrameKit/issues/12) cambia el
registro de plantillas generado localmente en el proyecto. Ejecuta
`framekit generate` después de actualizar el proyecto si necesitas regenerarlo de
forma directa, pero los flujos normales lo hacen automáticamente: `dev` genera
antes de iniciar y observa cada ruta agregada, eliminada o modificada dentro de
`src/templates` y `src/brand`; `check` y `build` generan antes de validar o
compilar; `start` no genera. Los cambios bajo `src/brand` también regeneran el
módulo de marcas local al proyecto.

El módulo generado ahora solo exporta `templates: TemplateRegistryEntry[]`. Cada
entrada contiene `slug`, `segments`, `meta` validada, `width`, `height`,
`variants`, `variantKeys` en orden de declaración, `assets` y una función lazy
`load`. Actualiza los consumidores personalizados del registro generado así:

- reemplaza `entry.title` por `entry.meta.title`;
- deja de importar `templateManifest` o `templateRegistry`;
- busca la entrada en `templates` y llama a su función `load()` cuando necesites
  la definición.

Los archivos generados son descartables y el generador los reemplaza. No edites ni
migres manualmente `src/generated/framekit/templates.ts`, y no conserves un
adaptador para la forma antigua del registro. Este es un cambio de la API del
consumidor generado; el contrato de definición de las plantillas no incorpora un
alias de compatibilidad.

La generación informa el conteo en inglés, por ejemplo `FrameKit: 1 template` o
`FrameKit: 3 templates`. En `dev`, la generación inicial y las regeneraciones
posteriores usan el mismo formato.

Consulta la [referencia CLI del registro generado](../reference/cli.md#framekit-generate),
la [referencia de la API pública](../reference/public-api.md#registro-generado-de-plantillas)
y el [issue #12 de GitHub](https://github.com/MauricioDMO/FrameKit/issues/12).

## Valores Choice Persistidos

El contrato actual de valores persistidos para `field.choice` descarta un
override choice guardado cuando ya no coincide con las opciones declaradas.
Descarta solo ese override: los overrides hermanos válidos de la misma variante
o de otra variante válida sobreviven. La resolución usa entonces el contenido
actual de la variante o el default actual del field cuando ese contenido no
proporciona un valor. Este comportamiento se rastrea en el [issue
#17](https://github.com/MauricioDMO/FrameKit/issues/17).

El editor solo lee `framekit:<slug>:v2`. No lee ni migra
`framekit:<slug>:v1`, y no se promete compatibilidad con v1. Los demás valores
persistidos obsoletos o con tipo incorrecto se filtran de la misma forma; los
valores válidos no se descartan solo porque un valor hermano esté obsoleto.

Este es un ajuste de robustez de persistencia, no una migración de versión de
release. No se agrega un comando de migración de código fuente.

## Integración Del Contrato Canónico De Studio

El issue [#13](https://github.com/MauricioDMO/FrameKit/issues/13) completa la
integración directa de Studio con los contratos canónicos. Las integraciones
existentes de Studio deben consumir directamente el array generado
`templates: TemplateRegistryEntry[]`. No crees otro modelo de registro para Studio
ni adaptes la forma antigua del registro. Al renderizar `FrameKitEditor`
directamente, pasa el `TemplateRegistryEntry` reutilizable en su prop `template`
y pasa por separado la definición cargada y validada; no reconstruyas una forma
anterior de esa prop.

Actualiza los consumidores existentes de esta forma:

- Lee el título visible desde `entry.meta.title` en la navegación y en el
  encabezado del editor; nunca lo derives del slug. El editor también muestra
  `meta.description`, `meta.marketingDescription` y `meta.tags` cuando están
  presentes, y omite cada valor opcional cuando falta.
- Usa nombres genéricos de `variant` en el estado, las acciones, las props y los
  callbacks de selección. Empieza con `definition.variants.default`, muestra
  los labels opcionales usando la key como fallback y conserva el label
  genérico del selector (`Variante`). El locale de interfaz de Studio
  (`FrameKitLocale`, EN/ES) es independiente: cambiar el idioma de la interfaz
  no debe cambiar la variante seleccionada.
- Mantén la navegación lateral compacta y accesible: conserva la jerarquía de
  carpetas, la expansión/contracción, la operación con teclado, el foco visible,
  las líneas de alcance solo para grupos de carpetas expandidos y el estilo
  atenuado de la plantilla seleccionada con `aria-current="page"`. No agregues
  búsqueda ni filtros.
- Conserva los controles tipados canónicos: text usa un `<textarea>` nativo,
  choice un `<select>` nativo, boolean un checkbox nativo, number su control
  nativo de número o rango declarado, color su control actual e image su control
  de assets. Conserva los valores runtime como strings, numbers finitos y
  booleanos; los valores de choice siguen siendo strings declarados.
- Persiste el estado del editor únicamente bajo `framekit:<slug>:v2`. El formato
  anterior de persistencia `v1` se invalida y descarta intencionalmente; no se
  migra ni se promete compatibilidad con v1. Los overrides choice obsoletos se
  descartan mientras sobreviven los overrides hermanos válidos, y después se
  aplican los fallbacks del contenido/default actual. Una entrada number vacía o
  temporalmente inválida permanece como draft local del control; no entra en los
  datos confirmados ni se pasa a `render`.
- Mantén localizados la navegación y la UI de errores propia de Studio mediante
  sus mensajes centralizados. Las tabs de ruta, labels de navegación lateral y
  metadata, estados de carga y no encontrado, errores de definición/datos,
  subida, exportación y validación usan el locale activo de la interfaz; los
  títulos de plantillas, valores de metadata y labels de variantes provienen del
  código fuente. Los errores de validación siguen asociados a sus controles y
  exportar/copiar enfoca el primer control inválido antes de producir la salida.

Este es un cambio de integración incompatible y sin versión; todavía no se ha
seleccionado una versión de release. No existe alias de compatibilidad, comando
de migración automático ni adaptador del registro legacy. Actualiza manualmente
el código fuente afectado de las plantillas y consumidores del editor, y trata
la invalidación de persistencia `v1` como un reset manual intencional cuando
corresponda. Regenera los archivos generados con `framekit generate` en lugar de
editarlos a mano y luego ejecuta `framekit check` y `framekit build`.

Consulta el [issue del contrato canónico de Studio](https://github.com/MauricioDMO/FrameKit/issues/13).

## Estado de verificación y release

El issue [#15](https://github.com/MauricioDMO/FrameKit/issues/15) registra los
gates de verificación sin versión. El CI del repositorio define verificaciones
completas en Ubuntu con Node.js `22.13.0` y `24`, un smoke focalizado de
consumidor generado en Windows con Node.js `22.13.0` y un único recorrido
crítico de Studio en Chromium. Estos checks no garantizan una matriz amplia de
navegadores, macOS ni regresión visual.

Los checks de tarballs antes de publicar y de npm después de publicar reciben
las versiones durante la preparación del release. No seleccionan una versión
en esta guía. El trabajo de verificación no cambia datos persistidos del usuario
y no requiere migración adicional.
