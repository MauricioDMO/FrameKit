---
title: Render images with the API
description: Create a server-side token, submit a FrameKit render request, and handle the PNG response safely.
sidebar:
  order: 7
---

Use this guide when another server-side system needs a PNG from a template. For endpoint details, see the [image render API reference](/en/users/reference/http-api/image-render). For public deployment, read [Security and reverse proxies](/en/users/deployment/security-and-reverse-proxies) first.

## 1. Create a server-side token

Sign in to Studio, open **Settings**, and create an API token with a descriptive name. The full `fk_` secret is shown only once. Store it in the calling service's secret manager or environment, not in a browser bundle, URL, template, or log.

The token works while it is not revoked and its owner is active. Changing a password does not revoke tokens; revoking a token does.

## 2. Confirm the deployment

The application must be running on the Node.js runtime with Chromium installed. A generated project can prepare the browser with:

```bash
pnpm framekit browser install
```

Use `--with-deps` on Linux when system browser dependencies are not already installed. Build before starting the production process:

```bash
pnpm framekit build
pnpm framekit start
```

The generated App Router API route must use `createFrameKitApiHandler(templates)` and export the supported HTTP methods from a Node.js route. See [Integrate an existing Next.js project](/en/users/getting-started/existing-project) if the route is not present.

## 3. Submit a render request

Replace `example` with a slug from the generated template registry. Send the token in an `Authorization` header:

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

To override content, include a `variant` and a `data` object containing only declared field keys:

```json
{
  "template": "example",
  "variant": "default",
  "data": {
    "title": "Launch"
  }
}
```

The template's default variant is used when `variant` is omitted. The endpoint validates the resolved data before opening the browser render.

## 4. Handle the response

The success response is `200` with `Content-Type: image/png` and `Cache-Control: no-store`. Save the response bytes as a PNG; the current endpoint does not return another format or an asynchronous job identifier.

For an error, read the JSON body and branch on `error`:

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

Treat `render_capacity_exhausted` as a bounded retry condition, correct `invalid_template_data` or `unsupported_image` at the caller, and fix `api_not_configured` in the deployment environment. The [error reference](/en/users/reference/http-api/errors) lists every stable code and status.

## 5. Use remote images deliberately

If a declared image field receives an HTTPS URL, add only its exact hostname to `FRAMEKIT_ALLOWED_IMAGE_HOSTS`. FrameKit fetches the raster image from Node, validates its MIME type and signature, and prepares it before Chromium renders. HTTP, IP literals, credentials, explicit non-default ports, SVG, unsafe redirects, and hosts outside the allowlist are rejected. `https://host:443` is normalized and accepted as HTTPS without a port.

Prefer root-relative project assets when the image is already part of the generated application. Neither public assets nor client bundles should contain the API token.
