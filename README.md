![Podyard](banner.jpg)

# Podyard CLI

Command-line client for the Podyard platform. Manages pods, snapshots,
templates, API keys, webhooks, plan limits, and usage from the terminal.

- **Language:** TypeScript (Node.js ≥ 22)
- **Binary:** `podyard` (built with `tsup`)
- **SDK:** [`@podyard/sdk`](https://www.npmjs.com/package/@podyard/sdk)
- **License:** Apache-2.0 (see `LICENSE.md`)
- **npm package:** [`@podyard/cli`](https://www.npmjs.com/package/@podyard/cli)
- **Repository:** `github.com/podyard/cli`

## Quick start

```bash
# from npm
npm install -g @podyard/cli
podyard --help

# or from source
pnpm install
pnpm run build
node dist/index.js --help
```

Authenticate once with `podyard login pyd_live_...` (stored in
`~/.podyard/config.json`) or set `PODYARD_API_KEY` in your environment.

## Commands

| Command                                                                          | Purpose                        |
| -------------------------------------------------------------------------------- | ------------------------------ |
| `podyard login <key>` / `logout`                                                 | Store / remove API key         |
| `podyard config get\|set\|path`                                                  | Inspect / mutate CLI config    |
| `podyard init [name]`                                                            | Scaffold a new Podyard project |
| `podyard pods list\|create\|get\|destroy\|exec\|fs\|snapshot\|snapshots\|fork\|sleep\|wake` | Pod lifecycle        |
| `podyard snapshots get\|fork`                                                    | Snapshot operations  |
| `podyard templates list\|get\|create\|delete`                                    | Template operations  |
| `podyard usage list`                                                             | Recent usage events  |
| `podyard limits`                                                                 | Plan limits + current usage |
| `podyard keys list\|create\|revoke`                                              | Manage API keys      |
| `podyard webhooks list\|create\|get\|delete`                                     | Manage API webhooks  |

Every command accepts `--json` for stable machine-readable output.

## Repository layout

```
.github/            CI (build, typecheck, test) and npm publish workflows
src/
  index.ts          CLI entrypoint (commander program)
  env.ts            Validated env vars (@t3-oss/env-core + zod)
  config.ts         ~/.podyard/config.json helpers
  commands/         One file per command group
tests/              Vitest unit tests (SDK mocked)
docs/               CLI reference, release, contributing, commit rules
scripts/            Local helper scripts (ci.sh, release.sh, lint-commit)
dist/               Build output (generated; not committed)
```

## Development

```bash
pnpm install
pnpm run dev         # tsup --watch
pnpm run typecheck   # tsc --noEmit
pnpm run test        # vitest run
```

`make check` runs the full local CI (typecheck + lint + test);
`make help` lists all Makefile targets.

## Configuration

The CLI reads `~/.podyard/config.json` for `apiKey` and `baseUrl`.
Environment variables always take precedence. All env vars are validated
on first read via `src/env.ts` (`@t3-oss/env-core` + zod) — an invalid
value (e.g. a malformed `PODYARD_BASE_URL`) exits with an error instead
of silently falling back:

| Variable             | Purpose                                                 |
| -------------------- | ------------------------------------------------------- |
| `PODYARD_API_KEY`    | API key (overrides config)                              |
| `PODYARD_BASE_URL`   | API base URL (the SDK appends `/v1`)                    |
| `PODYARD_CONFIG_DIR` | Config directory (default: `~/.podyard`)                |

Inspect or mutate with `podyard config get\|set\|path`.

## Documentation

- [CLI reference](docs/CLI.md) — every command with examples
- [Release process](docs/RELEASE.md) — how versions are cut and published
- [Contributing](docs/CONTRIBUTING.md) — setup, style, testing, PR checklist
- [Commit rules](docs/COMMIT.md) — Conventional Commits

## Publishing

Push a `v*` tag to trigger `.github/workflows/release.yml`, which
builds and publishes to npm using the `NPM_TOKEN` secret. See
[docs/RELEASE.md](docs/RELEASE.md) for the full process.

## License

Apache-2.0 — see [`LICENSE.md`](LICENSE.md).
