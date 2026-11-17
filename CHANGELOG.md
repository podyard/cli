# @podyard/cli

## [Unreleased]

### Changes

- **feat(webhooks)**: add `podyard webhooks list|create|get|delete` — manage
  API webhooks.
- **feat(pods)**: add `podyard pods snapshots <id>` — list snapshots of a pod.
- **feat(config)**: support the `PODYARD_CONFIG_DIR` env var to override the
  config directory (default `~/.podyard`); `configDir()`/`configPath()` now
  resolve dynamically.
- **feat(env)**: validate all environment variables through `src/env.ts`
  (`@t3-oss/env-core` + zod). `PODYARD_API_KEY`, `PODYARD_BASE_URL`, and
  `PODYARD_CONFIG_DIR` are now typed and validated on first read; every
  `process.env` access in the CLI flows through `env()`. An invalid value
  (e.g. a non-URL `PODYARD_BASE_URL`) exits with a clear error.
- **build**: remove unused dependencies (`@clack/prompts`,
  `@frontal-labs/error`, `nypm`) and the stale `pnpm-workspace.yaml`
  (esbuild build approval now comes from `package.json#pnpm`).
- **chore**: remove `commitlint.config.ts` and `scripts/lint-commit.sh` —
  the validator is `scripts/lint-commit.mjs`, the single source of truth.

## 0.1.1

### Changes

- **feat**: add `podyard init [name]` — scaffold a new Podyard project
  (`podyard.json`, `.env.example`, `.gitignore`, language example, README).
- **docs**: add `docs/CLI.md`, `docs/RELEASE.md`,
  `docs/CONTRIBUTING.md`, `docs/COMMIT.md`, `VERSIONS.md`, `Cargo.md`,
  and an expanded `README.md`.
- **build**: add `Makefile`, `Dockerfile`, `.dockerignore`,
  `.editorconfig`, `biome.json` (extends the Ultracite presets),
  `commitlint.config.ts`, and `scripts/` helpers (`ci.sh`,
  `release.sh`, `lint-commit.sh`, `lint-commit.mjs`).
- **chore**: add `repository`, `bugs`, `author`, `homepage`, `keywords`,
  `engines`, `packageManager`, `prepublishOnly`, `lint`, `format`, and
  `lint:commit` scripts to `package.json`.

## 0.1.0

### Initial release

- Split out from the podyard monorepo.
