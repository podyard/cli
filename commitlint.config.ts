import { execSync } from "node:child_process";

/**
 * Conventional Commits enforcement (lightweight, no extra deps).
 * Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
 *
 * Run: pnpm lint:commit
 */

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

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", TYPES],
    "type-case": [2, "always", "lower-case"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
  },
};

export function checkCommitMessage(msg: string): {
  ok: boolean;
  error?: string;
} {
  const [first] = msg.split("\n");
  if (TYPE_RE.test(first)) {
    return { ok: true };
  }
  return {
    ok: false,
    error: `Invalid commit message: "${first}"\nExpected: <type>[scope]!?: <subject> (types: ${TYPES.join(", ")})`,
  };
}

export function checkLastCommit(repoDir = "."): void {
  const msg = execSync("git log -1 --pretty=%B", {
    cwd: repoDir,
    encoding: "utf-8",
  }).trim();
  const res = checkCommitMessage(msg);
  if (!res.ok) {
    console.error(res.error);
    process.exit(1);
  }
}
