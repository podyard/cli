# Release process

Releases are published to the public npm registry as **`podyard-cli`** and are
fully automated by the GitHub Actions workflow
[`.github/workflows/release.yml`](../.github/workflows/release.yml).

## How a release works

1. You push a **git tag** of the form `vX.Y.Z` (e.g. `v1.4.0`).
2. The `release` workflow triggers on the tag:
   1. **Validate version** — fails immediately if the tag does not match the
      `version` field in `package.json`.
   2. **Install & build** — `pnpm install` + `pnpm run build` on Node 22.
   3. **Typecheck, lint, test** — the full quality gate.
   4. **npm version** — sets the built package version to the tag.
   5. **Publish** — `npm publish` to `npmjs.com` using the `NODE_AUTH_TOKEN`
      secret.
   6. **GitHub Release** — creates a GitHub Release with the notes and
      attaches `dist/` assets.
   7. **Post-release** (best-effort) — tags the published version.

## Steps to cut a release

### 1. Update the changelog

Edit `CHANGELOG.md`. Move any `[Unreleased]` entries into a new dated section
using the [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [1.4.0] - 2026-11-16
### Added
- `deploy --dry-run`
### Changed
- ...
### Fixed
- ...
```

### 2. Bump the version in `package.json`

Set `"version"` to the target, e.g. `1.4.0`.

### 3. Commit and tag

```bash
git add -A
git commit -m "chore: release 1.4.0"
git tag v1.4.0
git push origin main v1.4.0
```

Pushing the tag triggers the release workflow. Watch it at
`https://github.com/podyard/cli/actions`.

### 4. Verify

```bash
npm view podyard-cli version   # should print 1.4.0
npm install -g podyard-cli
podyard --version              # should print 1.4.0
```

## Versioning policy

SemVer. Because the project is `0.x`:

- **patch** (`0.1.2`) — bug fixes, no new features.
- **minor** (`0.2.0`) — new features; may include breaking changes.
- **major** (`1.0.0`) — stable, no more breaking changes on minor/patch.

Once `1.0.0` is reached, breaking changes require a major bump and a
`BREAKING CHANGE:` footer on the commit.

## Prerequisites / secrets

- **`NODE_AUTH_TOKEN`** repository secret: an npm publishing token
  (a classic automation token with access to the `podyard-cli` package).
  Rotate it as needed; the workflow reads it as `NODE_AUTH_TOKEN`.
- The build does **not** require a Podyard API token — releases are
  pure build + publish and do not hit the Podyard API.

## Troubleshooting

| Symptom                                | Cause / fix                                                            |
| -------------------------------------- | ---------------------------------------------------------------------- |
| `version mismatch` on release start    | Tag `vX.Y.Z` does not equal `package.json` `version`. Fix the tag or bump `package.json` and retag. |
| `E404` or `E403` from `npm publish`    | Bad/expired `NODE_AUTH_TOKEN` secret, or the token can't publish `podyard-cli`. Rotate the secret. |
| `cannot publish over the previously published version` | The version is already on npm. Bump to a higher version and retag. |
| Release stuck on `Validate version`    | A commit in the tag's history has a non-conventional message. Fix with a conforming commit. |

## Publishing from a machine (not recommended)

You *can* publish locally for emergencies:

```bash
pnpm run build
npm version 1.4.0 --no-git-tag-version
npm publish          # requires an npm login / NPM_TOKEN
```

Prefer the automated tag-based flow; it is the only path that also creates
the GitHub Release and attaches assets.
