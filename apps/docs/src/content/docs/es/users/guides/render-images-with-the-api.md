---
title: Renderizar imágenes con la API
description: Crea un token del lado del servidor, envía una solicitud de renderizado de FrameKit y gestiona de forma segura la respuesta PNG.
sidebar:
  order: 7
---

Usa esta guía cuando otro sistema del lado del servidor necesite un PNG de una plantilla. Para conocer los detalles del endpoint, consulta la [referencia de la API de renderizado de imágenes](/es/users/reference/http-api/image-render). Para un despliegue público, lee primero [Seguridad y proxies inversos](/es/users/deployment/security-and-reverse-proxies).

## 1. Crear un token del lado del servidor

Inicia sesión en Studio, abre **Ajustes** y crea un token de API con un nombre descriptivo. El secreto completo `fk_` se muestra una sola vez. Guárdalo en el gestor de secretos o el entorno del servicio que realiza la llamada, no en un bundle del navegador, una URL, una plantilla ni un registro.

El token funciona mientras no se revoque y su propietario esté activo. Cambiar una contraseña no revoca los tokens; revocar un token sí lo hace.

## 2. Confirmar el despliegue

La aplicación debe ejecutarse en el runtime de Node.js con Chromium instalado. Un proyecto generado puede preparar el navegador con:

```bash
pnpm framekit browser install
```

Usa `--with-deps` en Linux cuando las dependencias del navegador del sistema aún no estén instaladas. Construye antes de iniciar el proceso de producción:

```bash
pnpm framekit build
pnpm framekit start
```

La ruta API generada del App Router debe usar `createFrameKitApiHandler(templates)` y exportar los métodos HTTP compatibles desde una ruta de Node.js. Consulta [Integrar un proyecto Next.js existente](/es/users/getting-started/existing-project) si la ruta no está presente.

## 3. Enviar una solicitud de renderizado

Reemplaza `example` por un slug del registro de plantillas generado. Envía el token en una cabecera `Authorization`:

```bash
export FRAMEKIT_ORIGIN=https://framekit.example.com
export FRAMEKIT_TOKEN='fk_replace_with_the_full_secret'

curl --fail-with-body \
  --request POST "$FRAMEKIT_ORIGIN/api/framekit/images/render" \
  --header "Authorization: Bearer $FRAMEKIT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"template":"example"}' \
  --output example.png
```

Para sobrescribir el contenido, incluye un `variant` y un objeto `data` que contenga únicamente claves de campos declaradas:

```json
{
  "template": "example",
  "variant": "default",
  "data": {
    "title": "Launch"
  }
}
```

La variante predeterminada de la plantilla se usa cuando se omite `variant`. El endpoint valida los datos resueltos antes de abrir el navegador para renderizar.

## 4. Gestionar la respuesta

La respuesta exitosa es `200`, con `Content-Type: image/png` y `Cache-Control: no-store`. Guarda los bytes de la respuesta como un PNG; el endpoint actual no devuelve otro formato ni un identificador de trabajo asíncrono.

Si se produce un error, lee el cuerpo JSON y decide según `error`:

```json
{
  "error": "invalid_template_data",
  "message": "Template data is invalid",
  "fields": {
    "title": {
      "code": "required"
    }
  }
}
```

Trata `render_capacity_exhausted` como una condición de reintento acotada, corrige `invalid_template_data` o `unsupported_image` en el sistema que realiza la llamada y corrige `api_not_configured` en el entorno de despliegue. La [referencia de errores](/es/users/reference/http-api/errors) enumera todos los códigos y estados estables.

## 5. Usar imágenes remotas de forma deliberada

Si un campo de imagen declarado recibe una URL HTTPS, añade únicamente su hostname exacto a `FRAMEKIT_ALLOWED_IMAGE_HOSTS`. FrameKit obtiene la imagen rasterizada desde Node, valida su tipo MIME y su firma, y la prepara antes de que Chromium renderice. Se rechazan HTTP, literales IP, credenciales, puertos explícitos no predeterminados, SVG, redirecciones no seguras y hosts fuera de la lista de permitidos. `https://host:443` se normaliza y se acepta como HTTPS sin puerto.

Prefiere los recursos del proyecto relativos a la raíz cuando la imagen ya forma parte de la aplicación generada. Ni los recursos públicos ni los bundles del cliente deben contener el token de API.
