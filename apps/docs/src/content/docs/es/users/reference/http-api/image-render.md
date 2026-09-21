---
title: API de renderizado de imágenes
description: Renderiza una plantilla definida de FrameKit como un PNG del lado del servidor mediante el endpoint HTTP con autenticación opcional.
sidebar:
  order: 3
---

## Punto de acceso

```text
POST /api/framekit/images/render
```

Cuando `FRAMEKIT_AUTH_ENABLED` falta o es `false`, la ruta no requiere
credenciales. Cuando es `true`, acepta una cookie `framekit_session` del mismo
origen o un token de API en `Authorization: Bearer <token>`. No acepta ningún
otro esquema de autenticación. En ambos modos, el controlador valida la
configuración y conserva sus defensas de solicitud, imágenes, navegador,
capacidad, tiempo de espera y limpieza antes de renderizar.

Cuando la autenticación está activada y hay un encabezado `Authorization`, este
tiene prioridad. Un valor Bearer mal formado o no válido devuelve `401`; el
controlador no recurre a una cookie de sesión válida en esa solicitud. En el
modo abierto no se requiere ninguna credencial.

## Solicitud

Envía JSON con un cuerpo de no más de 12.000.000 bytes:

```json
{
  "template": "example",
  "variant": "default",
  "data": {
    "title": "Launch"
  }
}
```

El objeto acepta exactamente estas claves:

| Clave | Obligatoria | Significado |
| --- | --- | --- |
| `template` | Sí | Un slug no vacío del registro de plantillas generado. |
| `variant` | No | Una variante de contenido no vacía. Si se omite, se usa la variante predeterminada de la plantilla. |
| `data` | No | Un objeto simple que contiene ediciones para los campos declarados. Si se omite, se trata como un objeto vacío. |

Las claves desconocidas, los valores vacíos de `template` o `variant`, los arrays y las claves que permiten contaminar el prototipo se rechazan. La plantilla debe existir en el registro, y la variante proporcionada debe existir en el `content` de esa plantilla.

Usa `Content-Type: application/json`. El punto de acceso rechaza otros tipos de contenido y codificaciones de contenido distintas de `identity`.

## Datos y campos de imagen

Los valores que no son imágenes en `data` se resuelven y validan según los campos declarados de la plantilla. El valor de un campo de imagen puede ser:

- una ruta relativa a la raíz bajo `/assets/` o `/framekit/templates/`;
- una URL de datos rasterizados para PNG, JPEG, WebP o GIF; o
- una URL HTTPS cuyo hostname esté incluido exactamente en `FRAMEKIT_ALLOWED_IMAGE_HOSTS`.

Node obtiene las imágenes remotas y las convierte en una URL de datos canónica antes de que Chromium renderice la plantilla. La respuesta remota debe tener un tipo MIME rasterizado compatible y una firma de archivo coincidente. Consulta [Seguridad y proxies inversos](/es/users/deployment/security-and-reverse-proxies) para conocer las restricciones y [Errores de la API de imágenes](/es/users/reference/http-api/errors) para consultar los códigos de error.

## Respuesta correcta

Una respuesta correcta devuelve `200` con los bytes PNG producidos según el `width` y `height` declarados de la plantilla:

```text
Content-Type: image/png
Content-Length: <bytes>
Cache-Control: no-store
Content-Disposition: inline; filename="example.png"
X-Content-Type-Options: nosniff
```

El nombre de archivo sustituye `/` en un slug de plantilla por `-`. La respuesta siempre es PNG en el contrato actual. No existe ningún parámetro de formato, DPI ni trabajo asíncrono.

## Ejemplo

En un despliegue autenticado, crea un token de API en Studio, conserva el
secreto completo en una variable de entorno del servidor y sustituye `example`
por un slug de tu registro generado:

```bash
export FRAMEKIT_ORIGIN=http://localhost:3000
export FRAMEKIT_AUTH_ENABLED=true
export FRAMEKIT_TOKEN='fk_replace_with_the_full_secret'

curl --fail-with-body \
  --request POST "$FRAMEKIT_ORIGIN/api/framekit/images/render" \
  --header "Authorization: Bearer $FRAMEKIT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"template":"example"}' \
  --output example.png
```

No pongas el token en la URL ni lo envíes desde un navegador no confiable. La [guía de renderizado de imágenes](/es/users/guides/render-images-with-the-api) añade un flujo de solicitud y gestión de errores.

En el modo abierto, deja `FRAMEKIT_AUTH_ENABLED` sin definir o establécelo en
`false` y omite la cabecera `Authorization`. El endpoint conserva sus defensas
de renderizado aunque no requiera credenciales.
