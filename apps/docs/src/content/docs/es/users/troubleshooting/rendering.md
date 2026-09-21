---
title: Solución de problemas de renderizado de imágenes
description: Diagnostica fallos de autenticación opcional, solicitudes, entradas de imagen, Chromium, capacidad y tiempos de espera en la API de imágenes.
sidebar:
  order: 7
---

Empieza con el estado HTTP y el código estable de `error` de `POST /api/framekit/images/render`. La [referencia de errores de la API de imágenes](/es/users/reference/http-api/errors) contiene el contrato completo de errores.

Comprueba `FRAMEKIT_AUTH_ENABLED` antes de diagnosticar credenciales. Cuando falta
o es `false`, el modo abierto permite renderizar sin credenciales, pero conserva
las defensas del renderizador. Exactamente `true` activa el acceso autenticado;
cualquier otro valor configurado es inválido.

## `401 unauthorized` en modo autenticado

**Síntoma:** El endpoint de imágenes devuelve `401 unauthorized`.

**Causa probable:** Con `FRAMEKIT_AUTH_ENABLED=true`, el token Bearer no es válido, se revocó o pertenece a un usuario inactivo, o una solicitud autenticada mediante cookie no tiene una sesión válida del mismo origen. La falta de credenciales no es un fallo en modo abierto.

**Comprobación:** Confirma que el encabezado sea exactamente `Authorization: Bearer <full-token>`, o confirma que la solicitud incluya una cookie de sesión válida y un `Origin` del mismo origen. Un encabezado `Authorization` con formato incorrecto no recurre a la cookie.

**Solución:** Define explícitamente `FRAMEKIT_AUTH_ENABLED=true` para el acceso autenticado, y usa el token completo original o crea un token nuevo antes de volver a intentarlo con el método de autenticación correcto. En modo abierto, omite la credencial.

## `400 invalid_request` o `413 request_too_large`

**Síntoma:** El endpoint rechaza la solicitud antes del renderizado.

**Causa probable:** La solicitud no es JSON, usa una codificación de contenido no compatible, tiene una estructura de nivel superior no válida, indica una variante desconocida o supera los 12.000.000 bytes.

**Comprobación:** Envía `Content-Type: application/json` con un cuerpo que contenga solo `template`, `variant` opcional y `data` opcional. Cuando se incluye, `variant` debe estar declarada por la plantilla; `data` debe ser un objeto simple y el cuerpo de la solicitud debe mantenerse dentro del límite de tamaño.

**Solución:** Usa una variante declarada u omítela para usar la predeterminada de la plantilla. Elimina las claves de nivel superior no compatibles y los arrays accidentales, usa una codificación de contenido de identidad o ninguna, y reduce el cuerpo de la solicitud antes de volver a intentarlo.

## `404 template_not_found`

**Síntoma:** El endpoint no encuentra el slug de plantilla solicitado.

**Causa probable:** El slug no está en el registro de plantillas generado.

**Comprobación:** Compara el valor de la solicitud con las entradas generadas y el directorio de origen en `src/templates/`.

**Solución:** Usa el slug generado exacto, o corrige el origen y ejecuta:

```bash
pnpm framekit check
pnpm framekit generate
```

No edites el resultado generado.

## `415 unsupported_image`

**Síntoma:** Una solicitud que contiene un valor de imagen se rechaza porque no es compatible.

**Causa probable:** El valor no es una ruta relativa a la raíz segura bajo `/assets/` o `/framekit/templates/`, un data URL de raster válido o una imagen rasterizada HTTPS permitida; el tipo MIME o la firma del archivo también pueden ser no válidos.

**Comprobación:** Verifica el valor del campo de imagen. Para un data URL o una URL HTTPS, usa un PNG, JPEG, WebP o GIF compatible. Para una URL HTTPS, comprueba la lista de hosts permitidos y los encabezados de respuesta.

**Solución:** Usa un asset del proyecto, un data URL de raster válido o una imagen rasterizada HTTPS permitida.

## `413 request_too_large` para una entrada de imagen

**Síntoma:** El endpoint rechaza una entrada de imagen con `413 request_too_large`.

**Causa probable:** La imagen preparada supera el límite de 8.000.000 bytes para imágenes. Esto se aplica a los data URL de raster y a las imágenes remotas obtenidas.

**Comprobación:** Mide la imagen de data URL decodificada o el cuerpo de la respuesta remota, no solo la longitud de su URL codificada.

**Solución:** Proporciona un PNG, JPEG, WebP o GIF más pequeño, o usa un asset del proyecto más pequeño; después, vuelve a intentarlo.

## `422 invalid_template_data`

**Síntoma:** Se encuentra la plantilla, pero la solicitud devuelve datos de plantilla no válidos.

**Causa probable:** Las claves de los campos, los valores obligatorios, los tipos de campo, los límites, las opciones, los colores o el ámbito de la imagen no coinciden con la definición.

**Comprobación:** Compara `variant` y `data` con la [referencia de plantillas](/es/users/reference/template). Si la respuesta incluye `fields`, usa esos nombres de campo para localizar los valores no válidos.

**Solución:** Envía solo claves de campo declaradas con valores válidos y una variante válida, u omite `data` para usar el contenido de la plantilla para la variante seleccionada.

## `422 image_host_not_allowed` o `502 image_fetch_failed`

**Síntoma:** Una imagen remota funciona en un navegador, pero el renderizado la rechaza.

**Causa probable:** La obtención del lado del servidor no permite el hostname, la respuesta no es una respuesta raster compatible y exitosa, o una redirección abandona el host HTTPS permitido.

**Comprobación:** Añade el hostname exacto en minúsculas a `FRAMEKIT_ALLOWED_IMAGE_HOSTS` y verifica HTTPS, el tipo MIME y la firma raster, el estado de la respuesta y las redirecciones.

**Solución:** Corrige la lista de hosts permitidos o la respuesta de la imagen remota. Usa un asset del proyecto cuando la imagen no necesite ser remota. Consulta [Configuración](/es/users/reference/configuration).

## `503 api_not_configured` o `503 render_capacity_exhausted`

**Síntoma:** El endpoint informa de una configuración de renderizado no válida o de un agotamiento temporal de la capacidad.

**Causa probable:** `PORT`, `FRAMEKIT_MAX_CONCURRENT_RENDERS`, `FRAMEKIT_RENDER_TIMEOUT_MS` o la lista de hosts permitidos para imágenes no es válida, o todos los slots de renderizado configurados están ocupados.

**Comprobación:** Usa estos rangos: `PORT` 1–65535, máximo de renderizados simultáneos 1–32, tiempo de espera 1–120000 ms y solo hostnames válidos. Distingue un error de configuración de una respuesta de capacidad.

**Solución:** Corrige los valores de entorno no válidos. Si se agotó la capacidad, reduce la concurrencia del cliente o vuelve a intentarlo siguiendo las indicaciones de reintento acotadas de la respuesta.

## `504 render_timeout` o `500 render_failed`

**Síntoma:** El renderizado agota el tiempo de espera o falla después de aceptar la solicitud.

**Causa probable:** Chromium no está disponible, la plantilla o una imagen no puede cargarse, o el renderizado supera el tiempo de espera configurado.

**Comprobación:** Instala el shell headless de Chromium, ejecuta `pnpm framekit check` y vuelve a intentarlo con una plantilla e imágenes de entrada válidas conocidas:

```bash
pnpm framekit browser install
```

En Linux, añade `--with-deps` cuando sea necesario.

**Solución:** Corrige la definición o la entrada de imagen, instala el navegador y aumenta `FRAMEKIT_RENDER_TIMEOUT_MS` solo dentro de 1–120000 ms después de corregir la entrada subyacente lenta o no válida.
