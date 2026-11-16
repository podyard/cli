# Podyard CLI

Command-line client for the Podyard platform. Manages pods, snapshots,
templates, API keys, plan limits, and usage from the terminal.

- **Language:** TypeScript (Node.js ≥ 18)
- **Binary:** `podyard` (built with `tsup`)
- **SDK:** [`@podyard/sdk`](https://www.npmjs.com/package/@podyard/sdk)
- **License:** Apache-2.0 (see `LICENSE.md`)
- **npm package:** [`@podyard/cli`](https://www.npmjs.com/package/@podyard/cli)
- **Repository:** `github.com/podyard/cli`

> The `Cargo.toml` at the repo root is a placeholder so Cargo-aware
> tooling behaves predictably; there are no Rust sources. See
> `Cargo.md` for the full note.

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
| `podyard pods list\|create\|get\|destroy\|exec\|fs\|snapshot\|fork\|sleep\|wake` | Pod lifecycle                  |
| `podyard snapshots get\|fork`                                                    | Snapshot operations            |
| `podyard templates list\|get\|create\|delete`                                    | Template operations            |
| `podyard usage list`                                                             | Recent usage events            |
| `podyard limits`                                                                 | Plan limits + current usage    |
| `podyard keys list\|create\|revoke`                                              | Manage API keys                |

Every command accepts `--json` for stable machine-readable output.

## Repository layout

```
.github/            CI (build, typecheck, test) and npm publish workflows
src/
  index.ts          CLI entrypoint (commander program)
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
pnpm run check       # full local CI (typecheck + lint + test)
```

`make help` lists all Makefile targets.

## Configuration

The CLI reads `~/.podyard/config.json` for `apiKey` and `baseUrl`.
Environment variables always take precedence:

| Variable           | Purpose                                         |
| ------------------ | ----------------------------------------------- |
| `PODYARD_API_KEY`  | API key (overrides config)                      |
| `PODYARD_BASE_URL` | API base URL (overrides config and SDK default) |

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
