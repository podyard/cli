/**
 * CLI configuration: reads/writes ~/.podyard/config.json and
 * resolves the API key from config or the PODYARD_API_KEY env var.
 *
 * The config directory can be overridden with PODYARD_CONFIG_DIR
 * (useful for tests and CI sandboxes).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { env } from "./env";

export interface CliConfig {
  apiKey?: string;
  baseUrl?: string;
}

/**
 * Config directory: $PODYARD_CONFIG_DIR when set, otherwise ~/.podyard.
 * Read through env() so every process.env access flows through the
 * validated schema.
 */
export function configDir(): string {
  const override = env().PODYARD_CONFIG_DIR;
  if (override) {
    return override;
  }
  return join(homedir(), ".podyard");
}

export function configPath(): string {
  return join(configDir(), "config.json");
}

export function loadConfig(): CliConfig {
  const path = configPath();
  if (!existsSync(path)) {
    return {};
  }
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as CliConfig;
  } catch {
    return {};
  }
}

export function saveConfig(config: CliConfig): void {
  const dir = configDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(configPath(), `${JSON.stringify(config, null, 2)}\n`);
}

/**
 * Resolve the API key: env var PODYARD_API_KEY takes precedence over config.
 */
export function resolveApiKey(): string | null {
  const envKey = env().PODYARD_API_KEY;
  if (envKey) {
    return envKey;
  }
  const config = loadConfig();
  return config.apiKey ?? null;
}

/**
 * Resolve the base URL: env var PODYARD_BASE_URL > config > SDK default.
 */
export function resolveBaseUrl(): string | undefined {
  const envUrl = env().PODYARD_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  const config = loadConfig();
  return config.baseUrl;
}

/**
 * Get a configured API key or exit with a helpful message.
 */
export function requireApiKey(): string {
  const key = resolveApiKey();
  if (!key) {
    console.error(
      "No API key found. Set PODYARD_API_KEY or run: podyard login"
    );
    process.exit(1);
  }
  return key;
}
