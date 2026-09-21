---
title: Migración al contrato actual
description: Lista de comprobación para actualizar plantillas, salida generada, persistencia, acceso y exportación del lado del servidor al contrato actual de FrameKit.
sidebar:
  order: 3
---

Usa esta lista de comprobación para un proyecto existente. Describe el contrato implementado por el paquete y la plantilla generada actuales; no selecciona una versión de lanzamiento.

## Contrato de plantilla

- Actualiza cada plantilla a la definición canónica con `meta`, `width` y `height` enteros positivos, `fields`, `content`, `variants` y `render`.
- Asegúrate de que `meta.title` no esté vacío. Los metadatos opcionales se limitan a `description`, `marketingDescription` y `tags`.
- Haz que `variants.default` nombre una entrada de contenido. Mantén `variants.labels` como opcional y con claves correspondientes a entradas de contenido existentes.
- Mantén las entradas de contenido como registros de valores de campos. El `variant` seleccionado y los `data` resueltos se pasan a `render` junto con `assets`, `width` y `height`.

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: { title: 'Promotion card' },
  width: 1200,
  height: 630,
  fields: { title: field.text({ label: 'Title' }) },
  content: { square: { title: 'Hello' } },
  variants: { default: 'square', labels: { square: 'Square' } },
  render ({ data, width, height }) {
    return <article style={{ width, height }}>{data.title}</article>
  }
})
```

## Campos y variantes

- Usa el espacio de nombres público singular `field` para `text`, `number`, `boolean`, `choice`, `color` e `image`.
- Mantén los valores predeterminados de los campos numéricos y sus valores como números finitos, los valores booleanos como booleanos, los valores de opción dentro de sus opciones declaradas y los valores de color en el formato hexadecimal validado.
- Proporciona a los campos numéricos un `defaultValue` numérico finito; usa valores `min` y `max` finitos, y valores `step` finitos y positivos cuando sea necesario.
- Trata las claves de variantes como cadenas definidas por la plantilla. Son independientes de la configuración regional de la interfaz de Studio.
- Después de cambiar las definiciones o el contenido, vuelve a generar el registro del proyecto y valida cada variante de contenido antes de compilar.

Consulta [campos de plantilla](/es/users/concepts/templates/fields) y [contenido y variantes](/es/users/concepts/templates/content-and-variants) para conocer las reglas actuales de campos y resolución.

## Registro generado

- Ejecuta la generación después de cambiar las plantillas, los recursos de las plantillas o los componentes de marca.
- Consume el array generado `templates` y sus entradas de tipo `TemplateRegistryEntry`. Cada entrada incluye metadatos validados, dimensiones, variantes, `variantKeys`, assets y una función `load` diferida.
- Mantén los registros generados y las vinculaciones del cliente en `src/generated/framekit/`, ya que son desechables. Las copias de assets generadas viven en `public/framekit/`.

Consulta [archivos generados](/es/users/reference/generated-files) para ver el mapa de salida y el límite de autoría.

## Persistencia del editor v2

El editor almacena las sobrescrituras en el `localStorage` del navegador, bajo `framekit:<slug>:v2`. Un estado almacenado contiene la variante seleccionada y los datos de los campos agrupados por variante. Mantén los valores de los campos persistidos alineados con la definición actual: el cargador descarta campos y variantes desconocidos, valores con tipos incorrectos, valores numéricos que no cumplen sus restricciones declaradas y valores de opción que ya no están entre las opciones; los valores de cadena para los campos de texto, color e imagen siguen siendo cadenas para la validación normal de datos. Una variante seleccionada persistida debe ser una de las claves de contenido de la definición; de lo contrario, se ignora el estado almacenado.

## Acceso opcional a SQLite

- Define `FRAMEKIT_AUTH_ENABLED=true` para activar usuarios, sesiones, tokens de API y SQLite. En modo abierto no se inicializa la base de datos de acceso.
- Establece `FRAMEKIT_DATABASE_PATH` cuando la base de datos deba estar fuera de la ubicación predeterminada `.framekit-data/framekit.sqlite`.
- Mantén la ruta de la base de datos en almacenamiento persistente para los despliegues autenticados. La base de datos de acceso se inicializa de forma diferida, usa el modo WAL de SQLite y contiene las tablas actuales de usuarios, sesiones y tokens de API.
- El esquema actual es la versión de migración `1`. Una base de datos con una versión de esquema más reciente se rechaza en lugar de reescribirse.
- Mantén la aplicación en el runtime de Node.js para el acceso y el renderizado del lado del servidor. Los trabajos de renderizado permanecen en el proceso y no se almacenan en SQLite.

Consulta [configuración](/es/users/reference/configuration) y [Docker y persistencia](/es/users/deployment/docker-and-persistence).

## Tokens de acceso autenticado

Solo con `FRAMEKIT_AUTH_ENABLED=true`, usa la configuración actual de Studio o la API de acceso para crear tokens de API con nombre. El secreto completo del token se devuelve una vez al crearlo; las listas posteriores muestran metadatos y el prefijo visible, no el secreto. Almacena el secreto en el almacén de secretos del runtime del servicio que realiza la llamada y envíalo como credencial Bearer al usar el endpoint de imágenes del servidor. En modo abierto, el endpoint de imágenes no necesita un token.

## Exportación del lado del servidor

- Usa la ruta de servidor generada con `createFrameKitApiHandler` de `@mauriciodmo/framekit/server` en el runtime de Node.js.
- La acción de imagen canónica es `POST /api/framekit/images/render`; devuelve una salida PNG para una solicitud válida de plantilla, variante y datos de campos.
- Instala el runtime de Chromium requerido por el renderizador antes de servir solicitudes de imágenes. El Dockerfile generado realiza la instalación del navegador durante la compilación de la imagen.
- Mantén la página privada de renderizado generada y la vinculación `RenderClient` en la estructura actual del proyecto generado; vuelve a generar las vinculaciones en lugar de editar archivos generados.

Para conocer la estructura de integración, consulta [integrar un proyecto Next.js existente](/es/users/getting-started/existing-project), [API de renderizado de imágenes](/es/users/reference/http-api/image-render) y [Docker y persistencia](/es/users/deployment/docker-and-persistence).
