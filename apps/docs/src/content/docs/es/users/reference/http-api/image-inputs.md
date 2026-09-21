---
title: Entradas de imagen
description: Referencia de los datos de plantilla y las fuentes de imagen aceptadas por la API de renderizado de imágenes de FrameKit.
sidebar:
  order: 8
---

El objeto `data` de `POST /api/framekit/images/render` proporciona ediciones para
la plantilla seleccionada. Consulta la [API de renderizado de
imágenes](/es/users/reference/http-api/image-render) para conocer el endpoint,
la envoltura de la solicitud y las reglas de autenticación.

## Datos de plantilla

`data` debe ser un objeto JSON simple. Si se omite, se trata como un objeto
vacío. Cada clave debe corresponder a un campo declarado por la plantilla
seleccionada. Los valores de los campos que no son imágenes se resuelven y
validan según el tipo de campo y la variante seleccionada. Los datos de campo no
válidos devuelven `422 invalid_template_data`; la respuesta puede incluir
detalles seguros en `fields`.

Solo los campos de imagen aceptan las fuentes de imagen descritas a
continuación. El valor de un campo de imagen debe ser una cadena no vacía.

## Fuentes de imagen

Un campo de imagen puede usar:

- una ruta segura relativa a la raíz bajo `/assets/` o `/framekit/templates/`;
- una URL de datos rasterizados para PNG, JPEG, WebP o GIF; o
- una URL HTTPS cuyo hostname esté permitido por `FRAMEKIT_ALLOWED_IMAGE_HOSTS`.

Las rutas relativas a la raíz no pueden contener cadenas de consulta, fragmentos,
escapes porcentuales, barras invertidas, caracteres de control ni segmentos de
ruta inseguros. Las URL de datos deben usar base64 estricto y su tipo MIME
declarado debe coincidir con la firma del archivo rasterizado. Una imagen
preparada no puede superar 8,000,000 bytes.

Las imágenes remotas se obtienen mediante Node y se convierten en una URL de
datos canónica antes de que Chromium renderice la plantilla.
`FRAMEKIT_ALLOWED_IMAGE_HOSTS` es una lista de hostnames separada por comas; un
valor vacío o no definido no permite ningún hostname de imagen remoto. Las URL
remotas deben usar HTTPS y no pueden contener credenciales ni hosts literales de
IP; los puertos explícitos que no sean el predeterminado se rechazan, mientras
que `https://host:443` se normaliza y acepta. Las redirecciones están limitadas
a tres saltos y cada destino se comprueba contra la lista de permitidos.

Las respuestas remotas deben tener éxito y usar un tipo MIME rasterizado
compatible cuya firma de archivo coincida con los bytes. Una fuente no
compatible devuelve `415 unsupported_image`, un host no permitido devuelve
`422 image_host_not_allowed` y una obtención fallida devuelve
`502 image_fetch_failed`. Consulta [Errores de la API de
imágenes](/es/users/reference/http-api/errors) para la referencia completa de
estados y códigos de error.
