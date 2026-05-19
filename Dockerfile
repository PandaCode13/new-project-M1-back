# =============================================================================
# Multi-stage Dockerfile — NestJS / Alpine / Yarn 4
#
# Stages
#   base        shared minimal base (dumb-init + Corepack)
#   deps        full dependency install (dev + prod)
#   prod-deps   production-only install (devDependencies pruned)
#   builder     TypeScript compilation + Prisma client generation
#   migrator    runs prisma migrate deploy in production (has devDeps)
#   development watch mode + Node.js inspector
#   production  hardened runtime (non-root, no shell, no src)
#
# Usage
#   docker build --target development -t coasterplay:dev .
#   docker build --target production  -t coasterplay:prod .
# =============================================================================

# ─── Base ─────────────────────────────────────────────────────────────────────
FROM node:25-alpine AS base

# dumb-init runs as PID 1 and forwards OS signals (SIGTERM, SIGINT) to Node,
# preventing hung containers on shutdown and reaping zombie processes.
# Node 25 Alpine ships yarn v1 binaries (yarn + yarnpkg) but no corepack.
# Remove them explicitly so corepack can own those paths without conflict.
RUN apk add --no-cache dumb-init && \
    rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg && \
    npm install -g corepack --quiet && \
    corepack enable

# Store the Yarn binary in a world-readable path (default is /root/.cache,
# which is inaccessible to non-root users at container runtime).
ENV COREPACK_HOME=/usr/local/share/corepack

WORKDIR /app

# ─── Dependencies ─────────────────────────────────────────────────────────────
FROM base AS deps

COPY package.json yarn.lock .yarnrc.yml ./

# --immutable: equivalent to npm ci — aborts if the lockfile would need changes.
RUN yarn install --immutable

# ─── Builder ──────────────────────────────────────────────────────────────────
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules

# Only copy files that feed the TypeScript compiler.
COPY nest-cli.json tsconfig.json tsconfig.build.json package.json prisma.config.ts ./
COPY src ./src
COPY prisma ./prisma

# Generate the Prisma client before compiling TypeScript so that
# @prisma/client types are available to the compiler.
RUN yarn db:generate && yarn build

# ─── Development ──────────────────────────────────────────────────────────────
FROM base AS development

ENV NODE_ENV=development

# Source files are embedded so the image works standalone (docker run).
# When run via docker compose, bind-mounted ./src on top.
COPY --chown=node:node package.json yarn.lock .yarnrc.yml \
     nest-cli.json tsconfig.json tsconfig.build.json prisma.config.ts ./
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node src ./src
COPY --chown=node:node test ./test
COPY --chown=node:node prisma ./prisma

# Reuse the Yarn binary already downloaded by the deps stage into COREPACK_HOME.
# This avoids a network call at container startup and keeps the node user from
# needing write access to /app just to cache an executable.
COPY --from=deps /usr/local/share/corepack /usr/local/share/corepack

# Generate the Prisma client so TypeScript types are available when
# nest start --watch launches the compiler. db:migrate regenerates it
# at runtime too, but the watcher starts before that completes.
RUN yarn db:generate

# WORKDIR creates /app owned by root (mode 755). Yarn 4 writes .yarn/ on
# startup even when only running scripts — give node ownership so it can.
RUN chown node:node /app

# Use the built-in unprivileged user from the official Node.js image.
USER node

# 3000 = HTTP API
# 9229 = Node.js inspector (--debug / --inspect)
EXPOSE 3000 9229

ENTRYPOINT ["dumb-init", "--"]
CMD ["yarn", "start:debug"]
