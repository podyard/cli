/**
 * `podyard login <key>` / `podyard logout`
 */

import type { Command } from "commander";
import { configPath, loadConfig, saveConfig } from "../config";

export function registerLoginCommands(program: Command): void {
  program
    .command("login")
    .description("Store an API key in ~/.podyard/config.json")
    .argument("<key>", "API key (pyd_live_... or pyd_test_...)")
    .option("--json", "output as JSON")
    .action((key: string, _opts: { json?: boolean }) => {
      const prefixLive = "pyd_live_";
      const prefixTest = "pyd_test_";
      if (!(key.startsWith(prefixLive) || key.startsWith(prefixTest))) {
        console.error(
          `Invalid key format. Expected a key starting with ${prefixLive} or ${prefixTest}.`
        );
        process.exit(1);
      }
      const cfg = loadConfig();
      cfg.apiKey = key;
      saveConfig(cfg);
      const json = !!program.optsWithGlobals().json;
      if (json) {
        console.log(JSON.stringify({ ok: true, path: configPath() }));
      } else {
        console.log(`API key stored in ${configPath()}`);
      }
    });

  program
    .command("logout")
    .description("Remove the stored API key")
    .option("--json", "output as JSON")
    .action((_args: Record<string, unknown>, cmd: Command) => {
      const json = !!cmd.optsWithGlobals().json;
      const cfg = loadConfig();
      cfg.apiKey = undefined;
      saveConfig(cfg);
      if (json) {
        console.log(JSON.stringify({ ok: true }));
      } else {
        console.log("API key removed.");
      }
    });
}
