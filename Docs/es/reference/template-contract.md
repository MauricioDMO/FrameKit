# Contrato de plantilla

Este documento describe el contrato de plantilla: el sistema de campos, el manejo de datos y las reglas de validación que definen cómo funcionan las plantillas de FrameKit.

## Tipos de Campos

Las plantillas definen campos usando el objeto `fields` exportado desde `@mauriciodmo/framekit`. Cada campo tiene un `kind` que determina su comportamiento y las opciones que acepta.

### Opciones Base

Todos los tipos de campos comparten un conjunto común de opciones:

- `label` (string, obligatorio): Un nombre legible para el campo.
- `placeholder` (string, opcional): Texto provisional mostrado en campos vacíos.
- `required` (boolean, valor predeterminado: `true`): Indica si el campo debe tener un valor no vacío. Consulta la sección Requisito más abajo.
- `defaultValue` (string, opcional): Un valor por defecto usado cuando no hay otro valor disponible.

### `text`

Un campo de texto de una sola línea. Acepta solo las opciones base.

```typescript
fields.text({ label: 'Title', placeholder: 'Enter a title' })
```

### `textarea`

Un campo de texto multilínea. Acepta las mismas opciones que `text`.

```typescript
fields.textarea({ label: 'Description', placeholder: 'Write something...' })
```

### `number`

Un campo numérico. Acepta las opciones base más:

- `min` (number, opcional): El valor mínimo aceptable. Debe ser un número finito.
- `max` (number, opcional): El valor máximo aceptable. Debe ser un número finito.

**Importante:** A pesar de ser un campo `number`, el valor almacenado en los datos de la plantilla es siempre un **string**. Las restricciones `min` y `max` validan la interpretación numérica de ese string.

```typescript
fields.number({ label: 'Count', min: 0, max: 100 })
```

### `color`

Un campo selector de color. Acepta solo las opciones base. Los valores no vacíos deben ser colores hexadecimales de seis dígitos con el formato `#RRGGBB`.

```typescript
fields.color({ label: 'Background Color' })
```

### `url`

Un campo de entrada de URL. Acepta las opciones base. El valor se valida como:

- Una URL absoluta usando el protocolo `http:` o `https:`
- Una ruta relativa desde la raíz comenzando con `/`

Las rutas relativas y otros esquemas de URL (por ejemplo, `ftp://`, `javascript:`) son rechazados.

```typescript
fields.url({ label: 'Link URL', placeholder: 'https://example.com' })
```

## Requisito

Los campos son **requeridos por defecto**. Configurar `required: false` hace que un campo sea opcional.

- **Campos opcionales** (`required: false`): Una cadena vacía pasa la validación.
- **Campos requeridos** (por defecto): Una cadena vacía después de eliminar espacios en blanco falla la validación.

El valor predeterminado es `true`, no `false`. Es una decisión deliberada porque la falta de datos obligatorios es un error más frecuente que exigir datos accidentalmente.

## Orden de Resolución de Datos

Cuando una plantilla se renderiza, los valores de los campos se resuelven a través de un orden específico. Esto determina lo que contiene el objeto `data` dentro de la función `render`:

1. **`defaultValue` del campo**: La opción `defaultValue` del campo, o `''` si no está configurada.
2. **Valores de locale de contenido**: Valores del objeto `content` de la plantilla para el locale seleccionado.
3. **Ediciones del usuario**: Valores que el usuario ha editado en el editor de Studio, que sobrescriben todo lo demás.

Esto significa que las ediciones del usuario tienen precedencia sobre el contenido del locale, que tiene precedencia sobre los valores por defecto de los campos.

### Resolución programática de datos

Usa `resolveTemplateData` para aplicar este orden de resolución:

```typescript
import { resolveTemplateData } from '@mauriciodmo/framekit'

const data = resolveTemplateData(definition, locale, edits)
```

- `definition`: La definición de la plantilla.
- `locale`: La clave del locale de contenido a usar.
- `edits`: Un objeto de valores de campos editados por el usuario (el objeto vacío `{}` si no hay ediciones).

### Valores por Defecto

`getDefaultValues` devuelve solo los valores predeterminados de los campos (paso 1), sin aplicar contenido del locale ni ediciones:

```typescript
import { getDefaultValues } from '@mauriciodmo/framekit'

const defaults = getDefaultValues(definition.fields)
// { fieldKey: definition.fields[fieldKey].defaultValue ?? '' }
```

### Locales Disponibles

`getLocales` devuelve las claves de locale definidas en el objeto `content` de la plantilla:

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

- Campos requeridos: una cadena vacía (tras eliminar los espacios en blanco) no supera la validación
- Campos `number`: el valor debe convertirse en un número finito; debe estar dentro de los límites `min`/`max`
- Campos `url`: deben ser una URL absoluta HTTP(S) o una ruta relativa desde la raíz
- Campos `color`: los valores no vacíos deben ser colores hexadecimales de seis dígitos con el formato `#RRGGBB`

Los errores se retornan como objetos estructurados con códigos legibles por máquina, no strings localizados:

```typescript
import { validateTemplateData } from '@mauriciodmo/framekit'

const errors = validateTemplateData(definition, data)
// {
//   title: { code: 'required' },
//   count: { code: 'number_too_small', min: 10 },
//   link: { code: 'invalid_url' },
// }
```

Códigos de error posibles:

- `required`: El campo es requerido y el valor está vacío
- `invalid_number`: El valor no es un número finito
- `number_too_small`: El valor es menor que la restricción `min`
- `number_too_large`: El valor es mayor que la restricción `max`
- `invalid_url`: El valor no es una URL HTTP(S) válida ni una ruta relativa desde la raíz
- `invalid_color`: El valor no es un color hexadecimal de seis dígitos con el formato `#RRGGBB`

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

La interfaz de Studio (etiquetas, botones y mensajes) usa uno de dos idiomas: español (`es`) o inglés (`en`). Esto se resuelve en el siguiente orden:

1. La cookie `locale`
2. El encabezado `Accept-Language` del navegador
3. Se usa español (`es`) como alternativa

Esta separación significa que los locales de contenido de la plantilla y el idioma de la interfaz de Studio son preocupaciones independientes.

---

[English](../../en/reference/template-contract.md) | [Español](./template-contract.md)
