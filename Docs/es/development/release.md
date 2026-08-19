# Publicar una Versión

Publica el paquete o paquetes modificados desde la raíz del repositorio con pnpm. No uses `npm publish --workspace` ni `npm publish --prefix`: este repositorio declara sus workspaces con pnpm y el comando de npm puede fallar al procesar el manifiesto.

## Antes de publicar

Usa Node.js `>=22.13.0` y pnpm `>=11.14.0` para trabajar en releases.
Comprueba el contrato del repositorio antes de ejecutar la puerta de
lanzamiento:

```sh
pnpm check:runtime
```

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
4. Crea un commit de release por versión. Un commit no puede introducir dos versiones distintas de paquetes. Ambos paquetes pueden compartir un commit solo cuando se publican exactamente con la misma versión:

   ```sh
   git commit -am "chore(release): publish <package> <version>"
   ```

5. Crea tags anotados específicos por paquete. Usa `framekit-v<version>` para el paquete principal y `create-framekit-v<version>` para el CLI. Crea el tag genérico `v<version>` solo cuando ambos paquetes compartan versión y commit de release. Un release sincronizado tiene como máximo tres tags: uno genérico y uno por cada paquete:

   ```sh
   git tag -a create-framekit-v<version> -m "Release create-framekit v<version>"
   git tag -a framekit-v<version> -m "Release FrameKit v<version>"
   git tag -a v<version> -m "Release v<version>"
   ```

## Publicar

La publicación se entrega manualmente. El asistente no debe ejecutar `publish` ni `git push`. Verifica la sesión de npm y entrega al usuario los comandos para cada paquete modificado. Si se publican ambos paquetes, publica primero FrameKit, ya que el proyecto generado por el CLI depende de él:

```sh
npm whoami
# Incluye solo los paquetes modificados en esta versión.
pnpm --filter @mauriciodmo/framekit publish --access public --tag latest
pnpm --filter @mauriciodmo/create-framekit publish --access public --tag latest
```

Para una versión previa, sustituye `latest` por el canal correspondiente, por ejemplo `alpha`. No añadas `--otp` al comando. Si npm solicita un OTP, introdúcelo directamente en tu terminal interactiva.

Cuando los comandos de publicación terminen correctamente, entrega al usuario este comando para publicar el commit y los tags; no lo ejecutes automáticamente:

```sh
git push origin main --follow-tags
```

---

[English](../../en/development/release.md) · [Español](./release.md)
