# Supported versions

Podyard CLI is a Node.js / TypeScript tool. These are the version
compatibility guarantees.

## Runtime

| Component   | Minimum supported | Tested in CI          | Notes                              |
| ----------- | ----------------- | --------------------- | ---------------------------------- |
| Node.js     | 22.22.2           | 22.x, 24.x            | Required by `@podyard/sdk`; use 22+ |
| pnpm        | 9.x               | 10.x (pinned `10.34.7`) | `packageManager` is pinned for corepack |
| TypeScript  | —                 | 5.6.x                 | dev dependency, locked             |
| Vitest      | —                 | 3.x                   | dev dependency, locked             |

The `package.json` `engines` field enforces Node 22.22.2+ (or 24.15.0+).
CI tests the two supported Node lines, 22 and 24.

## SDK

The CLI depends on `@podyard/sdk ^0.2.1`. Because the SDK is still `0.x`,
minor releases may change APIs. The CLI pins a caret range and CI installs
from the lockfile; bumping the SDK is a deliberate change (update
`package.json` and `pnpm-lock.yaml` together).

The 0.2.x SDK exports `Podyard` instead of `PodyardClient` and appends `/v1`
to the configured API base URL. The CLI and generated examples follow those
interfaces.

## Platform

- macOS (arm64 / x64), Linux (x64), Windows (x64) are supported targets.
- The CLI is pure Node.js with no native addons, so any platform with a
  supported Node.js works.
- Docker: the provided `Dockerfile` targets `linux/amd64` on `node:22-slim`.

## Node 22 vs 24+

Node 22.22.2 is the minimum supported runtime. Node 24 is also tested in CI;
use either supported line for development and production.

## Release channel

The CLI is published to the public npm registry as `podyard-cli`. Versions
follow [SemVer](https://semver.org/) with the `0.x` caveat that a minor bump
can include breaking changes until `1.0.0`.
