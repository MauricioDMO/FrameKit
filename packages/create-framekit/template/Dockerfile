# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app

RUN corepack enable \
  && corepack prepare pnpm@11.14.0 --activate \
  && apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS build-deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm install --frozen-lockfile

FROM base AS prod-deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm install --prod --frozen-lockfile

FROM build-deps AS builder

COPY . .
RUN pnpm build
RUN test -f .framekit/next/standalone/server.js

FROM base AS runner

ENV NODE_ENV=production \
  HOSTNAME=0.0.0.0 \
  PORT=3000 \
  FRAMEKIT_INTERNAL_ORIGIN=http://127.0.0.1:3000 \
  PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
RUN apt-get update \
  && apt-get install -y --no-install-recommends tini \
  && ./node_modules/.bin/framekit browser install --with-deps \
  && rm -rf /var/lib/apt/lists/* \
  && chmod -R a+rX /ms-playwright

COPY --from=builder --chown=node:node /app/.framekit/next/standalone ./

USER node
EXPOSE 3000
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
