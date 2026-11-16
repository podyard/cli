# Commit message conventions

This repository uses [Conventional Commits](https://www.conventionalcommits.org/).
CI validates the last commit message on `main` and rejects non-conforming
messages. This keeps the changelog clean and makes releases predictable.

## Format

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

- **type** (required): one of the types below.
- **scope** (optional): a short noun, e.g. `auth`, `deploy`, `config`.
- **summary** (required): imperative mood, no trailing period, ≤ ~72 chars.
- **body** (optional): explain *what* and *why*, wrapped at ~72 chars.
- **footer** (optional): `BREAKING CHANGE: ...` or `Refs #123`.

## Types

| Type           | Use for                                                        |
| -------------- | -------------------------------------------------------------- |
| `feat`         | A new user-facing feature.                                     |
| `fix`          | A bug fix.                                                     |
| `docs`         | Documentation only (README, `docs/`, comments).                |
| `style`        | Formatting, whitespace — no logic change.                      |
| `refactor`     | Code change that neither fixes a bug nor adds a feature.       |
| `perf`         | A performance improvement.                                     |
| `test`         | Adding or correcting tests.                                    |
| `build`        | Build system, dependencies, packaging (`package.json`, CI).    |
| `ci`           | CI configuration (GitHub Actions, scripts).                    |
| `chore`        | Anything that doesn't fit above (housekeeping, tooling).       |
| `revert`       | Reverting a previous commit.                                   |

## Examples

```
feat(deploy): add --dry-run flag to deploy

Preview the bundle that would be uploaded without publishing.
```

```
fix(auth): persist token expiry so login survives restarts

Refs #42
```

```
build: bump @podyard/sdk to ^0.2.0

BREAKING CHANGE: the auth provider callback is now async.
```

## Validation

- **CI**: the `validate-commit` job runs on every push and PR to `main`.
- **Local**: `pnpm run lint:commit` validates the most recent commit message.
  Pass a message directly with:
  `pnpm run lint:commit "feat: my change"`.

The validator is `commitlint` with the `@commitlint/config-conventional`
preset (see `commitlint.config.ts`).

## When to use `BREAKING CHANGE`

Any change that would force existing scripts or integrations to be modified
gets a `BREAKING CHANGE:` footer. Under `0.x` versions this is allowed on a
minor bump; document it in the `CHANGELOG.md` under `[Unreleased]` as well.
