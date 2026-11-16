# @podyard/cli

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
