# `@podyard/cli`

Public Podyard command-line interface.

## Overview

- Package: `@podyard/cli` (published)
- Binary: `podyard` (`dist/index.js`)
- Source: `src/index.ts`
- Built with Commander and integrates with `@podyard/sdk`

## Scripts

```bash
pnpm run build      # Build with tsup
pnpm run dev        # Watch build
pnpm run typecheck  # tsc --noEmit
```

## Usage

```bash
podyard --help
podyard init --name my-app
podyard sandboxes
```

`sandboxes` requires `PODYARD_API_KEY` (and optional `PODYARD_BASE_URL`).

## Local development (before `@podyard/sdk` is published)

Until `@podyard/sdk` is published to npm, this repo depends on it via a
packed tarball of the sibling `podyard-sdk` repo:

```jsonc
// package.json
"@podyard/sdk": "file:../podyard-sdk/podyard-sdk-0.1.0.tgz"
```

On a fresh clone, pack the SDK once before installing:

```bash
cd ../podyard-sdk && pnpm install && pnpm run build && npm pack
cd ../podyard-cli && pnpm install
```

Once `@podyard/sdk` is published, switch the dependency to `^0.1.0` and
remove the tarball.
