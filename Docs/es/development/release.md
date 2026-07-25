# Publicar una Versión

Publica el paquete o paquetes modificados desde la raíz del repositorio con pnpm. No uses `npm publish --workspace` ni `npm publish --prefix`: este repositorio declara sus workspaces con pnpm y el comando de npm puede fallar al procesar el manifiesto.

## Antes de publicar

1. Versiona los paquetes de forma independiente. Actualiza solo el paquete que tenga cambios para la versión. Una versión nueva de `create-framekit` no requiere actualizar `@mauriciodmo/framekit`; conserva la dependencia de la plantilla en la versión principal publicada, salvo que la plantilla requiera una API nueva de FrameKit.

2. Ejecuta la puerta de lanzamiento:

   ```sh
   pnpm lint
   pnpm test
   pnpm typecheck
   pnpm build
   pnpm --filter @mauriciodmo/framekit pack
   pnpm --filter @mauriciodmo/create-framekit pack
   ```

3. Realiza la [prueba de humo de los tarballs](testing-and-distribution.md#prueba-de-humo-del-tarball-manual).
4. Confirma siempre el cambio de versión y crea un tag anotado de Git antes de publicar, por ejemplo:

   ```sh
   git commit -am "chore(release): publish 0.5.0"
   git tag -a v0.5.0 -m "Release v0.5.0"
   ```

## Publicar

Verifica la sesión de npm y publica cada paquete modificado. Si se publican ambos paquetes, publica primero FrameKit, ya que el proyecto generado por el CLI depende de él:

```sh
npm whoami
# Incluye solo los paquetes modificados en esta versión.
pnpm --filter @mauriciodmo/framekit publish --access public --tag latest
pnpm --filter @mauriciodmo/create-framekit publish --access public --tag latest
```

Para una versión previa, sustituye `latest` por el canal correspondiente, por ejemplo `alpha`.

Cuando ambos comandos terminen correctamente, publica el commit y el tag:

```sh
git push origin main --follow-tags
```

---

[English](../../en/development/release.md) · [Español](./release.md)
