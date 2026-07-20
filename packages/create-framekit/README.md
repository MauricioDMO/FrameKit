# @mauriciodmo/create-framekit

Scaffold a new FrameKit project with one command:

```bash
pnpm dlx @mauriciodmo/create-framekit my-project
cd my-project
pnpm dev
```

The creator is interactive: if no project name is given, it asks for one. It detects which package manager you are using from your environment (`pnpm` or `npm`); if it cannot detect it, it asks you to choose. It then asks whether to install dependencies, and if you are using pnpm, whether to run `pnpm approve-builds`. Finally, it asks whether to initialize a Git repository with an initial commit.

After copying the template, the creator runs `install` and `framekit generate` automatically if you chose to install dependencies. If either step fails, the partially-created project directory is preserved so you can diagnose the issue.

For template authoring patterns, see the [Template Authoring Guide](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/en/guides/template-authoring.md).

For full documentation:
- [Documentation](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/en/README.md)
- [Documentación](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/es/README.md)

## Test locally

From the repository root, build and run the local CLI without publishing it:

```bash
pnpm --filter @mauriciodmo/create-framekit build && node packages/create-framekit/dist/cli.js ./my-local-framekit
```
