# Contrato de Plantilla

Este documento describe el contrato de plantilla: el sistema de campos, el manejo de datos y las reglas de validación que definen cómo funcionan las plantillas de FrameKit.

## Tipos de Campos

Las plantillas definen campos usando el objeto `fields` exportado desde `@mauriciodmo/framekit`. Cada campo tiene un `kind` que determina su comportamiento y las opciones que acepta.

### Opciones Base

Todos los tipos de campos comparten un conjunto común de opciones:

- `label` (string, obligatorio): Un nombre legible para el campo.
- `placeholder` (string, opcional): Texto provisional mostrado en campos vacíos.
- `required` (boolean, valor por defecto: `true`): Si el campo debe tener un valor no vacío. Ver Requerimiento abajo.
- `defaultValue` (string, opcional): Un valor por defecto usado cuando no hay otro valor disponible.

### `text`

Un campo de texto de una sola línea. Acepta solo las opciones base.

```typescript
fields.text({ label: 'Título', placeholder: 'Ingresa un título' })
```

### `textarea`

Un campo de texto multilínea. Acepta las mismas opciones que `text`.

```typescript
fields.textarea({ label: 'Descripción', placeholder: 'Escribe algo...' })
```

### `number`

Un campo numérico. Acepta las opciones base más:

- `min` (number, opcional): El valor mínimo aceptable. Debe ser un número finito.
- `max` (number, opcional): El valor máximo aceptable. Debe ser un número finito.

**Importante:** A pesar de ser un campo `number`, el valor almacenado en los datos de la plantilla es siempre un **string**. Las restricciones `min` y `max` validan la interpretación numérica de ese string.

```typescript
fields.number({ label: 'Cantidad', min: 0, max: 100 })
```

### `color`

Un campo selector de color. Acepta solo las opciones base. No se realiza validación de formato CSS en tiempo de ejecución más allá de verificar el requerimiento.

```typescript
fields.color({ label: 'Color de Fondo' })
```

### `url`

Un campo de entrada de URL. Acepta las opciones base. El valor se valida como:

- Una URL absoluta usando el protocolo `http:` o `https:`
- Una ruta relativa desde la raíz comenzando con `/`

Las rutas relativas y otros esquemas de URL (por ejemplo, `ftp://`, `javascript:`) son rechazados.

```typescript
fields.url({ label: 'URL del Enlace', placeholder: 'https://ejemplo.com' })
```

## Requerimiento

Los campos son **requeridos por defecto**. Configurar `required: false` hace que un campo sea opcional.

- **Campos opcionales** (`required: false`): Una cadena vacía pasa la validación.
- **Campos requeridos** (por defecto): Una cadena vacía después de eliminar espacios en blanco falla la validación.

El valor por defecto es `true`, no `false`. Esta es una decisión deliberada porque los datos requeridos faltantes son un error más común que la sobre-requerimiento accidental.

## Orden de Resolución de Datos

Cuando una plantilla se renderiza, los valores de los campos se resuelven a través de un orden específico. Esto determina lo que contiene el objeto `data` dentro de la función `render`:

1. **`defaultValue` del campo**: La opción `defaultValue` del campo, o `''` si no está configurada.
2. **Valores de locale de contenido**: Valores del objeto `content` de la plantilla para el locale seleccionado.
3. **Ediciones del usuario**: Valores que el usuario ha editado en el editor de Studio, que sobrescriben todo lo demás.

Esto significa que las ediciones del usuario tienen precedencia sobre el contenido del locale, que tiene precedencia sobre los valores por defecto de los campos.

### Resolver Datos Programáticamente

Usa `resolveTemplateData` para aplicar este orden de resolución:

```typescript
import { resolveTemplateData } from '@mauriciodmo/framekit'

const data = resolveTemplateData(definition, locale, edits)
```

- `definition`: La definición de la plantilla.
- `locale`: La clave del locale de contenido a usar.
- `edits`: Un objeto de valores de campos editados por el usuario (objeto vacío `{}` para sin ediciones).

### Valores por Defecto

`getDefaultValues` retorna solo los valores por defecto de los campos (paso 1), sin aplicar contenido del locale ni ediciones:

```typescript
import { getDefaultValues } from '@mauriciodmo/framekit'

const defaults = getDefaultValues(definition.fields)
// { fieldKey: definition.fields[fieldKey].defaultValue ?? '' }
```

### Locales Disponibles

`getLocales` retorna las claves de locale definidas en el objeto `content` de la plantilla:

```typescript
import { getLocales } from '@mauriciodmo/framekit'

const locales = getLocales(definition) // por ejemplo, ['en', 'es']
```

Estas claves son strings arbitrarios elegidos por el autor de la plantilla. No están restringidos a códigos de idioma como `en` o `es`.

## Validación

FrameKit proporciona dos funciones de validación que verifican diferentes aspectos de una plantilla.

### Validación de Definición

`validateTemplateDefinition` verifica la estructura de una definición de plantilla:

- `width` y `height` deben ser enteros finitos positivos
- `fields.language` está reservado y no puede ser usado
- `content` debe tener al menos una entrada
- Cada entrada de contenido debe tener una propiedad `language`
- `render` debe ser una función
- Las opciones de campo deben tener tipos válidos (por ejemplo, `min`/`max` solo en campos `number`, números finitos solamente)

```typescript
import { validateTemplateDefinition } from '@mauriciodmo/framekit'

const result = validateTemplateDefinition(definition)
if (!result.success) {
  console.error(result.error)
}
```

### Validación de Datos

`validateTemplateData` verifica los valores de los campos contra sus restricciones:

- Campos requeridos: cadena vacía (después de trim) falla
- Campos `number`: el valor debe convertirse en un número finito; debe estar dentro de los límites `min`/`max`
- Campos `url`: deben ser una URL absoluta HTTP(S) o una ruta relativa desde la raíz

Los errores se retornan como objetos estructurados con códigos legibles por máquina, no strings localizados:

```typescript
import { validateTemplateData } from '@mauriciodmo/framekit'

const errors = validateTemplateData(definition, data)
// {
//   titulo: { code: 'required' },
//   cantidad: { code: 'number_too_small', min: 10 },
//   enlace: { code: 'invalid_url' },
// }
```

Códigos de error posibles:

- `required`: El campo es requerido y el valor está vacío
- `invalid_number`: El valor no es un número finito
- `number_too_small`: El valor es menor que la restricción `min`
- `number_too_large`: El valor es mayor que la restricción `max`
- `invalid_url`: El valor no es una URL HTTP(S) válida ni una ruta relativa desde la raíz

### El Comando CLI `check`

El comando `check` valida cada plantilla en un proyecto:

```
framekit check
```

Realiza los siguientes pasos para cada plantilla:

1. Ejecuta `validateTemplateDefinition` para asegurar validez estructural.
2. Resuelve datos para cada locale de contenido usando `resolveTemplateData` sin ediciones del usuario.
3. Ejecuta `validateTemplateData` sobre los valores resueltos para detectar valores por defecto faltantes o inválidos.

Este comando ayuda a detectar errores de configuración antes de ejecutar Studio.

## Sistema de Locales

FrameKit separa dos preocupaciones que ambas usan la palabra "locale":

### Locales de Contenido de Plantilla

Estas son las claves en el objeto `content` de la plantilla. Son strings arbitrarios elegidos por el autor de la plantilla. Una plantilla podría usar claves de locale como `en`, `es`, `fr`, o identificadores completamente diferentes como `desktop`, `mobile`, `newsletter`.

### Idioma de la Interfaz de Studio

La interfaz de Studio (etiquetas, botones, mensajes) usa uno de dos idiomas: Español (`es`) o Inglés (`en`). Esto se resuelve en el siguiente orden:

1. La cookie `lang`
2. El encabezado `Accept-Language` del navegador
3. Fallback a Español (`es`)

Esta separación significa que los locales de contenido de la plantilla y el idioma de la interfaz de Studio son preocupaciones independientes.

---

[English](/en/reference/template-contract.md) | [Español](/es/reference/template-contract.md)
