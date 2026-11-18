/**
 * `podyard init [name]` — scaffold a new Podyard project in the
 * current directory: podyard.json, .gitignore, .env.example, and
 * a minimal Node.js (or Python) example script.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import type { Command } from "commander";

const TEMPLATE_SNIPPETS: Record<
  string,
  { lang: string; file: string; code: string }
> = {
  node: {
    lang: "node",
    file: "example.mjs",
    code: `import { Podyard } from "@podyard/sdk";

const client = new Podyard({ apiKey: process.env.PODYARD_API_KEY });

// List pods
const pods = await client.pods.list();
for (const pod of pods.items) {
  console.log(pod.id, pod.status, pod.name);
}
`,
  },
  python: {
    lang: "python",
    file: "example.py",
    code: `import os
import requests

base_url = os.environ.get("PODYARD_BASE_URL", "https://api.podyard.dev")
api_key = os.environ["PODYARD_API_KEY"]

resp = requests.get(
    f"{base_url}/v1/pods",
    headers={"Authorization": f"Bearer {api_key}"},
    timeout=30,
)
resp.raise_for_status()
for pod in resp.json()["items"]:
    print(pod["id"], pod["status"], pod["name"])
`,
  },
};

function buildReadMe(
  projectName: string,
  lang: string,
  snippetFile: string
): string {
  const installCmd =
    lang === "node" ? "npm install @podyard/sdk" : "pip install requests";
  const readMeLines = [
    `# ${projectName}`,
    "",
    "A Podyard project scaffolded with `podyard init`.",
    "",
    "## Setup",
    "",
    "```bash",
    "cp .env.example .env   # then fill in PODYARD_API_KEY",
    installCmd,
    `npm start # runs ${snippetFile}`,
    "```",
    "",
    "## CLI quickstart",
    "",
    "```bash",
    "podyard pods list",
    "podyard pods create --name demo",
    "podyard limits",
    "```",
    "",
  ];
  return readMeLines.join("\n");
}

function buildFiles(
  projectName: string,
  lang: string,
  dir: string,
  snippet: { lang: string; file: string; code: string }
): Array<{ path: string; content: string }> {
  return [
    {
      path: join(dir, "podyard.json"),
      content: `${JSON.stringify(
        {
          name: projectName,
          version: "0.1.0",
          sdk: "^0.2.1",
          defaults: {
            templateId: null,
            cwd: "/workspace",
            env: {},
          },
        },
        null,
        2
      )}\n`,
    },
    {
      path: join(dir, ".env.example"),
      content: [
        "# Podyard API key (required) — create one at https://podyard.dev/settings/keys",
        "PODYARD_API_KEY=pyd_live_xxx",
        "# Optional: point at a custom API base URL",
        "# PODYARD_BASE_URL=https://api.podyard.dev",
        "",
      ].join("\n"),
    },
    {
      path: join(dir, ".gitignore"),
      content: "node_modules/\n.env\n*.log\n.DS_Store\n",
    },
    { path: join(dir, snippet.file), content: snippet.code },
    {
      path: join(dir, "README.md"),
      content: buildReadMe(projectName, lang, snippet.file),
    },
  ];
}

interface InitOptions {
  dir?: string;
  json?: boolean;
  lang?: string;
  name?: string;
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function resolveTemplate(lang: string): {
  lang: string;
  file: string;
  code: string;
} {
  const snippet = TEMPLATE_SNIPPETS[lang];
  if (!snippet) {
    fail(
      `Unknown --lang: ${lang} (supported: ${Object.keys(TEMPLATE_SNIPPETS).join(", ")})`
    );
  }
  return snippet;
}

function resolveTargetDir(
  optsDir: string | undefined,
  projectName: string
): string {
  const base = optsDir ?? ".";
  const target = isAbsolute(base) ? base : join(process.cwd(), base);
  return join(target, projectName);
}

function writeScaffold(
  dir: string,
  files: Array<{ path: string; content: string }>
): string[] {
  // Create target dir if missing.
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Refuse to clobber existing files.
  for (const f of files) {
    if (existsSync(f.path)) {
      fail(`Refusing to overwrite existing file: ${f.path}`);
    }
  }

  for (const f of files) {
    writeFileSync(f.path, f.content);
  }
  return files.map((f) => f.path);
}

function runInit(opts: InitOptions): void {
  const projectName = opts.name ?? "podyard-app";
  const lang = (opts.lang ?? "node").toLowerCase();
  const snippet = resolveTemplate(lang);
  const dir = resolveTargetDir(opts.dir, projectName);
  const files = buildFiles(projectName, lang, dir, snippet);
  const created = writeScaffold(dir, files);

  if (opts.json) {
    console.log(
      JSON.stringify(
        { ok: true, project: projectName, dir, files: created },
        null,
        2
      )
    );
    return;
  }
  console.log(`Scaffolded ${projectName} in ${dir}:`);
  for (const f of created) {
    console.log(`  - ${f}`);
  }
  console.log("\nNext steps:");
  console.log(`  cd ${projectName}`);
  console.log("  cp .env.example .env   # set PODYARD_API_KEY");
}

export function registerInitCommand(program: Command): void {
  program
    .command("init [name]")
    .description("Scaffold a new Podyard project in the current directory")
    .option("--lang <lang>", "example language: node | python", "node")
    .option("--dir <dir>", "target directory (default: current directory)")
    .option("--json", "output as JSON")
    .action(
      (
        name: string | undefined,
        opts: { lang?: string; dir?: string },
        cmd: Command
      ) => {
        runInit({
          name,
          lang: opts.lang,
          dir: opts.dir,
          json: !!cmd.optsWithGlobals().json,
        });
      }
    );
}
