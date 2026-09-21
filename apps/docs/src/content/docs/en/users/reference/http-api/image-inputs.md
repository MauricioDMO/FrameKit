---
title: Image inputs
description: Reference template data and image sources accepted by the FrameKit image render API.
sidebar:
  order: 8
---

The `data` object in `POST /api/framekit/images/render` supplies edits for the
selected template. See the [image render API](/en/users/reference/http-api/image-render)
for the endpoint, request envelope, and authentication rules.

## Template data

`data` must be a plain JSON object. If omitted, it is treated as an empty
object. Every key must be a field declared by the selected template. Values
for non-image fields are resolved and validated against that field's type and
the selected variant. Invalid field data returns `422 invalid_template_data`;
the response may include safe details in `fields`.

Only image fields accept the image sources described below. An image field
value must be a non-empty string.

## Image sources

An image field can use:

- a safe root-relative path under `/assets/` or `/framekit/templates/`;
- a raster data URL for PNG, JPEG, WebP, or GIF; or
- an HTTPS URL whose hostname is allowed by `FRAMEKIT_ALLOWED_IMAGE_HOSTS`.

Root-relative paths cannot contain query strings, fragments, percent escapes,
backslashes, control characters, or unsafe path segments. Data URLs must use
strict base64 and their declared MIME type must match the raster file
signature. A prepared image may not exceed 8,000,000 bytes.

Remote images are fetched by Node and converted to a canonical data URL before
Chromium renders the template. `FRAMEKIT_ALLOWED_IMAGE_HOSTS` is a comma-
separated list of hostnames; an empty or unset value allows no remote image
hosts. Remote URLs must use HTTPS, must not contain credentials or IP-literal hosts;
explicit non-default ports are rejected, while `https://host:443` is normalized
and accepted. Redirects are limited to three hops, and each destination is
checked against the allowlist.

Remote responses must be successful and use a supported raster MIME type whose
file signature matches the bytes. An unsupported source returns
`415 unsupported_image`, a disallowed host returns `422 image_host_not_allowed`,
and a failed fetch returns `502 image_fetch_failed`. See [image API errors](/en/users/reference/http-api/errors)
for the complete status and error-code reference.
