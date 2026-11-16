#!/usr/bin/env bash
# Release helper: bumps version, updates CHANGELOG, tags, pushes.
# Usage: ./scripts/release.sh <patch|minor|major>
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

BUMP="${1:?usage: $0 <patch|minor|major>}"

command -v node >/dev/null || { echo "node is required" >&2; exit 1; }

# Bump version in package.json via node (no extra deps).
NEW_VERSION="$(node -e '
const fs = require("node:fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const [maj, min, pat] = pkg.version.split(".").map(Number);
switch (process.argv[1]) {
  case "major": pkg.version = `${maj + 1}.0.0`; break;
  case "minor": pkg.version = `${maj}.${min + 1}.0`; break;
  default:      pkg.version = `${maj}.${min}.${pat + 1}`;
}
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
console.log(pkg.version);
' "$BUMP")"

echo "Bumping to $NEW_VERSION"

# Add a CHANGELOG entry (unreleased section at top).
TODAY="$(date -u +%Y-%m-%d)"
node -e '
const fs = require("node:fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
let log = fs.readFileSync("CHANGELOG.md", "utf8");
const entry = `\n## ${pkg.version} — ${process.argv[1]}\n\n- (release notes)  \n`;
log = log.replace(/^# @podyard\/cli\n/, `# @podyard/cli\n${entry}`);
fs.writeFileSync("CHANGELOG.md", log);
' "$TODAY"

# Commit + tag + push.
git add package.json CHANGELOG.md
git commit -m "chore: release $NEW_VERSION"
git tag "v$NEW_VERSION"
git push origin main "v$NEW_VERSION"

echo
echo "Tagged v$NEW_VERSION. Push will trigger .github/workflows/release.yml."
