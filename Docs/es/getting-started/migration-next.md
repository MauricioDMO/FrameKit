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
- El comportamiento canónico de runtime y Studio descrito aquí está
  implementado. La API de generación de imágenes en servidor es trabajo futuro;
  no está implementada ni forma parte de este contrato.

Esta guía rolling es el entregable documental del [issue #14 de
GitHub](https://github.com/MauricioDMO/FrameKit/issues/14).

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
