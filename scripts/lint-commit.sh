#!/usr/bin/env bash
# Validate a commit message against Conventional Commits.
# Usage: ./scripts/lint-commit.sh [message]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

MSG="${1:-$(cd "$SCRIPT_DIR/.." && git log -1 --pretty=%B)}"

node --input-type=module -e '
import { checkCommitMessage } from "file://'$SCRIPT_DIR'/../commitlint.config.ts";
' 2>/dev/null || true

# Fallback: validate with a tiny inline node script (no dep on ts-node).
TYPES="feat fix docs style refactor perf test build ci chore revert"
TYPE_RE="^($(IFS='|'; echo "$TYPES"))(\(.+\))?!?: .+"
FIRST="$(printf '%s\n' "$MSG" | head -1)"
if [[ "$FIRST" =~ $TYPE_RE ]]; then
  echo "commit message OK: $FIRST"
else
  echo "invalid commit message: $FIRST" >&2
  echo "expected: <type>[scope]!?: <subject>  (types: $TYPES)" >&2
  exit 1
fi
