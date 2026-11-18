# Podyard CLI — Documentation

## What is Podyard?

Podyard is a hosted platform for running short-lived, forkable compute
"pods" (sandboxed execution environments). The CLI (`podyard`) is the
official command-line interface for managing pods, snapshots, templates,
API keys, webhooks, plan limits, and usage from the terminal.

## Installing

```bash
# from npm
npm install -g @podyard/cli

# or yarn / pnpm
yarn global add @podyard/cli
pnpm add -g @podyard/cli

# from source
git clone https://github.com/podyard/cli.git
cd cli
pnpm install
pnpm run build
ln -s "$PWD/dist/index.js" /usr/local/bin/podyard
```

Verify:

```bash
podyard --version
podyard --help
```

## Authenticating

Two ways to supply an API key:

1. **Env var** — `export PODYARD_API_KEY=pyd_live_...` (always wins).
2. **Stored config** — `podyard login pyd_live_...` (writes
   `~/.podyard/config.json`; see `podyard config path`).

Get a key from your Podyard dashboard. Test keys start with
`pyd_test_`, live keys with `pyd_live_`.

## Commands

### `podyard init [name]`

Scaffold a new Podyard project in the current directory.

```bash
podyard init my-app
# creates:
#   my-app/podyard.json
#   my-app/.env.example
#   my-app/.gitignore
#   my-app/example.mjs       (or example.py with --lang python)
#   my-app/README.md
```

Options:

- `--lang <node|python>` — example language (default: `node`)
- `--dir <dir>` — target directory (default: current directory)
- `--json` — emit JSON summary of created files

### `podyard login <key>` / `podyard logout`

Store or remove the API key in `~/.podyard/config.json`.

```bash
podyard login pyd_live_abc123
podyard logout
```

### `podyard config`

Inspect and mutate CLI configuration.

```bash
podyard config path             # print dir + file path
podyard config get              # print whole config (redacted-friendly)
podyard config get apiKey       # print a single key
podyard config set baseUrl https://api.example.com
podyard config set apiKey pyd_live_xxx
```

Supported keys: `apiKey`, `baseUrl`.

### `podyard pods`

Pod lifecycle.

```bash
podyard pods list                          # list pods
podyard pods create -n my-pod              # create (optionally --template <id>)
podyard pods get <id>                      # pod details
podyard pods destroy <id>                  # destroy
podyard pods exec <id> <cmd...>            # run a command in a pod
podyard pods exec <id> --cwd /tmp --env K=V --timeout 30 <cmd...>
podyard pods fs read <id> <path>           # read a file (stdout)
podyard pods fs write <id> <path>          # write a file (content from stdin)
podyard pods fs delete <id> <path>         # delete a file
podyard pods snapshot <id> [--name n]      # create a snapshot
podyard pods snapshots <id> [--limit N] [--cursor C]  # list a pod's snapshots
podyard pods fork <id> [--n 4]             # fork into N clones
podyard pods sleep <id>                    # put to sleep (experimental)
podyard pods wake <id>                     # wake a sleeping pod (experimental)
```

`pods exec` accepts `--cwd`, repeatable `--env K=V`, and `--timeout <seconds>`.
The exit code of the in-pod command is propagated to the local process.

### `podyard snapshots`

```bash
podyard snapshots get <id>                 # snapshot details
podyard snapshots fork <id> [--n 4]        # fork a snapshot into N pods
```

(`list` / `delete` are not yet supported by the engine.)

### `podyard templates`

```bash
podyard templates list                     # list templates
podyard templates get <id>                 # template details
podyard templates create <name> <snapshotId> \
  --description "..." --visibility private|public
podyard templates delete <id>              # delete
```

### `podyard usage`

```bash
podyard usage list                         # recent usage events
```

### `podyard limits`

Show plan limits and current usage.

```bash
podyard limits
# Plan:     hobby ($10.00/mo)
# Limit                          Current      Max
# Concurrent pods                1            3
# Snapshots                      2            10
# Execs today                    50           (rate: 60 rpm)
# Webhooks                       1            5
# Exec timeout:        300s
# Max pod size:        10 GB
# Max file size:       100 MB
# Pod lifetime:        72h
# Sleep after:         30 min
```

### `podyard keys`

Manage API keys.

```bash
podyard keys list                          # list keys
podyard keys create --label ci --kind live # create (full key shown once)
podyard keys revoke <id>                   # revoke
```

### `podyard webhooks`

Manage API webhooks.

```bash
podyard webhooks list [--limit N] [--cursor C]   # list webhooks
podyard webhooks create <url> --events pod.created,pod.destroyed \
  [--inactive]                                   # create a webhook
podyard webhooks get <id>                        # webhook details
podyard webhooks delete <id>                     # delete
```

`--events` is a comma-separated list of event names (e.g. `pod.created`,
`pod.destroyed`). `--inactive` creates the webhook in a disabled state.

## Output format

Every command accepts `--json`. When set, output is a pretty-printed
JSON object on stdout — stable and parseable for scripts.

```bash
podyard pods list --json | jq '.items[0].id'
```

Human output (default) is terse and line-oriented.

## Configuration file

`~/.podyard/config.json` (override the directory with `PODYARD_CONFIG_DIR`):

```json
{
  "apiKey": "pyd_live_abc123",
  "baseUrl": "https://api.podyard.dev"
}
```

Environment variables always override the config file:

| Variable           | Purpose      |
| ------------------ | ------------ |
| `PODYARD_API_KEY`      | API key                                  |
| `PODYARD_BASE_URL`     | API base URL (the SDK appends `/v1`)     |
| `PODYARD_CONFIG_DIR`   | Config directory (default: `~/.podyard`) |

## Exit codes

- `0` — success
- `1` — CLI error (bad args, auth missing, API error)
- _other_ — propagated from in-pod commands via `podyard pods exec`

## Troubleshooting

- **`No API key found`** — set `PODYARD_API_KEY` or run `podyard login`.
- **`401 Unauthorized`** — key is invalid or revoked; create a new one
  and re-login.
- **`403 Forbidden`** — key lacks permission for the resource; check
  the key's kind (live vs test) and scope.
- **`ECONNREFUSED` / timeouts** — check `PODYARD_BASE_URL` (or
  `podyard config get baseUrl`) and your network.
- **Stale config** — `podyard config path` to locate the file; edit or
  delete it, then retry.

## Repository layout

```
.github/workflows/ci.yml        CI: typecheck, lint, test, build
.github/workflows/release.yml   Release: publish to npm on tag
src/index.ts                    CLI entrypoint
src/env.ts                      Validated env vars (@t3-oss/env-core + zod)
src/config.ts                   ~/.podyard/config.json helpers
src/commands/                   One file per command group
tests/                          Vitest unit tests (SDK mocked)
scripts/ci.sh                   Local CI runner
scripts/lint-commit.mjs         Conventional Commits validator
scripts/release.sh              Version-bump + tag helper
Dockerfile                      Multi-stage image (node:22-slim)
```

## License

Apache-2.0 — see [`LICENSE.md`](LICENSE.md).
