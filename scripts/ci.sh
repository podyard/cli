#!/usr/bin/env bash
# podyard-cli CI helper. Run all checks a developer should run locally.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

step() { printf '\n\033[1;34m== %s ==\033[0m\n' "$*"; }

step "Typecheck"
pnpm run typecheck

step "Lint (biome)"
pnpm run lint

step "Test (vitest)"
pnpm run test

step "Build (tsup)"
pnpm run build

step "Smoke test (built binary)"
node dist/index.js --version
node dist/index.js --help >/dev/null

step "All checks passed"
