/**
 * CLI configuration: reads/writes ~/.podyard/config.json and
 * resolves the API key from config or the PODYARD_API_KEY env var.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface CliConfig {
  apiKey?: string;
  baseUrl?: string;
}

const CONFIG_DIR = join(homedir(), ".podyard");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

export function configDir(): string {
  return CONFIG_DIR;
}

export function configPath(): string {
  return CONFIG_PATH;
}

export function loadConfig(): CliConfig {
  if (!existsSync(CONFIG_PATH)) {
    return {};
  }
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) as CliConfig;
  } catch {
    return {};
  }
}

export function saveConfig(config: CliConfig): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`);
}

/**
 * Resolve the API key: env var PODYARD_API_KEY takes precedence over config.
 */
export function resolveApiKey(): string | null {
  const env = process.env.PODYARD_API_KEY;
  if (env) {
    return env;
  }
  const config = loadConfig();
  return config.apiKey ?? null;
}

/**
 * Resolve the base URL: env var PODYARD_BASE_URL > config > SDK default.
 */
export function resolveBaseUrl(): string | undefined {
  const env = process.env.PODYARD_BASE_URL;
  if (env) {
    return env;
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
