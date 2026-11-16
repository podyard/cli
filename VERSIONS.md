# Supported versions

Podyard CLI is a Node.js / TypeScript tool. These are the version
compatibility guarantees.

## Runtime

| Component   | Minimum supported | Tested in CI          | Notes                              |
| ----------- | ----------------- | --------------------- | ---------------------------------- |
| Node.js     | 18.x              | 20.x, 22.x (latest)   | `engines.node = ">=18"`; use 20+  |
| pnpm        | 9.x               | 10.x (pinned `10.34.7`) | `packageManager` is pinned for corepack |
| TypeScript  | —                 | 5.6.x                 | dev dependency, locked             |
| Vitest      | —                 | 3.x                   | dev dependency, locked             |

The `package.json` `engines` field enforces Node `>=18`. CI tests the two most
recent LTS lines (20 and 22). If you need an older environment, Node 18 is
the floor; below that the CLI is not supported.

## SDK

The CLI depends on `@podyard/sdk ^0.1.0`. Because the SDK is still `0.x`,
minor releases may change APIs. The CLI pins a caret range and CI installs
from the lockfile; bumping the SDK is a deliberate change (update
`package.json` and `pnpm-lock.yaml` together).

## Platform

- macOS (arm64 / x64), Linux (x64), Windows (x64) are supported targets.
- The CLI is pure Node.js with no native addons, so any platform with a
  supported Node.js works.
- Docker: the provided `Dockerfile` targets `linux/amd64` on `node:22-slim`.

## Node 18 vs 20+

Node 18 is the *minimum* but **Node 20 or newer is recommended**. Some
transitive dependencies ship newer syntax and are only exercised on 20/22 in
CI. If you hit issues on Node 18, upgrade.

## Release channel

The CLI is published to the public npm registry as `podyard-cli`. Versions
follow [SemVer](https://semver.org/) with the `0.x` caveat that a minor bump
can include breaking changes until `1.0.0`.
