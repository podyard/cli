#!/usr/bin/env node
/**
 * Validate the last (or a given) commit message against Conventional
 * Commits. No build step needed — the validator is re-implemented here
 * in plain JS so it runs without ts-node / tsx.
 *
 * Usage:
 *   pnpm run lint:commit
 *   pnpm run lint:commit -- "feat(pods): add --watch flag"
 */

import { execSync } from "node:child_process";

const TYPES = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "chore",
  "revert",
];

const TYPE_RE = new RegExp(`^(${TYPES.join("|")})(\\(.+\\))?!?: .+`, "u");

function checkCommitMessage(commitMsg) {
  const [first] = commitMsg.split("\n");
  if (TYPE_RE.test(first)) {
    return { ok: true };
  }
  return {
    ok: false,
    error: `Invalid commit message: "${first}"\nExpected: <type>[scope]!?: <subject> (types: ${TYPES.join(", ")})`,
  };
}

function readMessage() {
  const [argMsg] = process.argv.slice(2);
  if (argMsg && argMsg !== "--") {
    return argMsg;
  }
  try {
    return execSync("git log -1 --pretty=%B", { encoding: "utf-8" }).trim();
  } catch {
    console.error("No git history found; nothing to validate.");
    process.exit(1);
  }
}

const msg = readMessage();
const res = checkCommitMessage(msg);
if (!res.ok) {
  console.error(res.error);
  process.exit(1);
}
const [first] = msg.split("\n");
console.log("commit message OK:", first);
