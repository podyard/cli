# podyard-cli
# Multi-stage build: install + build deps in a scratch layer, ship only dist/ in the final image.

# --- builder --------------------------------------------------------------
FROM node:22-slim AS builder

# pnpm via corepack (ships with node >= 16.9).
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /repo
COPY package.json pnpm-lock.yaml ./
COPY src ./src
COPY tsconfig.json tsup.config.ts vitest.config.ts ./
COPY .npmrc ./

RUN pnpm install --frozen-lockfile && pnpm run build

# --- runtime ---------------------------------------------------------------
FROM node:22-slim

ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /repo/dist ./dist
COPY --from=builder /repo/package.json ./package.json

# The shebang in dist/index.js makes it directly executable.
RUN ln -s /app/dist/index.js /usr/local/bin/podyard

ENTRYPOINT ["podyard"]
CMD ["--help"]
