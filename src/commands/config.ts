/**
 * `podyard config [get|set|path]`
 */

import type { Command } from "commander";
import { configDir, configPath, loadConfig, saveConfig } from "../config";

export function registerConfigCommands(program: Command): void {
  const config = program.command("config").description("Manage CLI config");

  config
    .command("get [key]")
    .description("Print a config value (or the whole config)")
    .option("--json", "output as JSON")
    .action((key: string | undefined, _opts: { json?: boolean }) => {
      const cfg = loadConfig();
      if (key === undefined) {
        console.log(
          JSON.stringify(
            {
              apiKey: cfg.apiKey ?? "(not set)",
              baseUrl: cfg.baseUrl ?? "(default)",
            },
            null,
            2
          )
        );
        return;
      }
      let value: string | undefined;
      if (key === "apiKey") {
        value = cfg.apiKey;
      } else if (key === "baseUrl") {
        value = cfg.baseUrl;
      }
      if (value === undefined) {
        console.error(`No such config key: ${key}`);
        process.exit(1);
      }
      console.log(value);
    });

  config
    .command("set <key> <value>")
    .description("Set a config value (apiKey | baseUrl)")
    .option("--json", "output as JSON")
    .action((key: string, value: string, _opts: { json?: boolean }) => {
      const cfg = loadConfig();
      if (key === "apiKey") {
        cfg.apiKey = value;
      } else if (key === "baseUrl") {
        cfg.baseUrl = value;
      } else {
        console.error(`No such config key: ${key}`);
        process.exit(1);
      }
      saveConfig(cfg);
      console.log(`Set ${key}.`);
    });

  config
    .command("path")
    .description("Print the config directory and file path")
    .option("--json", "output as JSON")
    .action((_args: Record<string, unknown>, cmd: Command) => {
      const json = !!cmd.optsWithGlobals().json;
      if (json) {
        console.log(
          JSON.stringify({ dir: configDir, path: configPath }, null, 2)
        );
      } else {
        console.log(`dir:  ${configDir}`);
        console.log(`path: ${configPath}`);
      }
    });
}
