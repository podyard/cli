/**
 * Podyard CLI — thin wrapper over the Podyard v1 API.
 *
 * Every command supports --json for stable machine-readable output.
 * Auth: PODYARD_API_KEY env var or `podyard login` (writes ~/.podyard/config.json).
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Podyard } from "@podyard/sdk";
import { Command } from "commander";
import { registerConfigCommands } from "./commands/config";
import { registerInitCommand } from "./commands/init";
import { registerKeyCommands } from "./commands/keys";
import { registerLimitCommands } from "./commands/limits";
import { registerLoginCommands } from "./commands/login";
import { registerPodCommands } from "./commands/pods";
import { registerSnapshotCommands } from "./commands/snapshots";
import { registerTemplateCommands } from "./commands/templates";
import { registerUsageCommands } from "./commands/usage";
import { registerWebhookCommands } from "./commands/webhooks";
import { requireApiKey, resolveBaseUrl } from "./config";

const pkg = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../package.json", import.meta.url)),
    "utf8"
  )
);

interface Ctx {
  client: () => Podyard;
  print: (value: unknown, json: boolean, human?: () => void) => void;
}

function getClient(): Podyard {
  const apiKey = requireApiKey();
  return new Podyard({
    apiKey,
    ...(resolveBaseUrl() ? { baseUrl: resolveBaseUrl() } : {}),
  });
}

/** Print a value as JSON (--json) or as a human-friendly line. */
function print(value: unknown, json: boolean, human?: () => void): void {
  if (json) {
    console.log(JSON.stringify(value, null, 2));
  } else if (human) {
    human();
  }
}

const program = new Command();

program
  .name("podyard")
  .description(
    "Podyard CLI — manage pods, snapshots, templates, keys, and more"
  )
  .version(pkg.version as string);

const ctx: Ctx = { client: getClient, print };

registerLoginCommands(program);
registerConfigCommands(program);
registerInitCommand(program);
registerPodCommands(program, ctx);
registerSnapshotCommands(program, ctx);
registerTemplateCommands(program, ctx);
registerUsageCommands(program, ctx);
registerLimitCommands(program, ctx);
registerKeyCommands(program, ctx);
registerWebhookCommands(program, ctx);

program.parseAsync(process.argv).catch((err: unknown) => {
  const msg = err instanceof Error ? (err.message ?? String(err)) : String(err);
  console.error(`Error: ${msg}`);
  process.exit(1);
});
