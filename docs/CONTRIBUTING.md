# Contributing to Podyard CLI

Thanks for contributing! This guide covers setup, the workflow, and the
quality bar we hold every change to.

## Prerequisites

- **Node.js 18+** (20+ recommended)
- **pnpm 9+** (`corepack enable` is the easiest way to get a matching pnpm)
- **Git**

## Setup

```bash
git clone https://github.com/podyard/cli.git
cd cli
pnpm install
make check        # typecheck + lint + tests — all green before you branch
```

## Workflow

1. Branch from `main`: `git checkout -b <type>/<short-description>`
   (e.g. `fix/auth-timeout`, `feat/bulk-export`).
2. Make your change. Keep it focused — one logical change per PR.
3. Add or update tests in `tests/` for any new behavior.
4. Run the full gate before committing:

   ```bash
   make check          # typecheck + lint + test
   pnpm run format     # biome autofix, if you don't have it in your editor
   ```

5. Commit with a [Conventional Commits](./COMMIT.md) message.
6. Push and open a PR. CI runs the same checks; a red build blocks merge.

## Code style

- **Language**: TypeScript, strict mode. No `any` unless unavoidable.
- **Formatter**: Biome with the Ultracite preset (config in `biome.json`,
  which extends `ultracite/biome/core`, `ultracite/biome/vitest`, and
  `ultracite/biome/type-aware`). Run `pnpm run format` or use your editor.
- **Lint**: the same Biome config runs linting and formatting together.
  `pnpm run lint` must be clean.
- **Imports**: relative imports use `.js` extensions (ESM); import from
  `@podyard/sdk` for SDK types and values.
- **Errors**: throw `Error` with a clear message; user-facing messages should
  not leak stack traces or internal paths unless useful.
- **Secrets**: never commit tokens, keys, or credentials. Use environment
  variables (see `.env.example`).

## Tests

Tests live in `tests/` and run with Vitest.

```bash
pnpm run test          # run all tests
pnpm run test -- -t "auth"   # run tests matching "auth"
```

- Unit-test pure logic in isolation.
- For commands that read/write config, point `PODYARD_CONFIG_DIR` at a temp
  directory so tests don't touch `~/.podyard`.
- Keep tests deterministic — no real network, no `sleep`, no global state.

## Commit messages

We enforce [Conventional Commits](https://www.conventionalcommits.org/). See
[docs/COMMIT.md](./COMMIT.md) for the types and examples. Run
`pnpm run lint:commit` to validate a message before pushing.

## Release process

Releases are automated — see [docs/RELEASE.md](./RELEASE.md). In short: bump
the version in `package.json` + `CHANGELOG.md` and push a `vX.Y.Z` tag. Do not
publish from a local machine.

## Questions

Open a discussion or issue on the repository. Be specific about the CLI
version (`podyard --version`), your Node version, and the exact command that
fails.
