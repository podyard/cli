/**
 * Unit tests for CLI config helpers (~/.podyard/config.json).
 * Uses a temp directory to avoid touching the real config.
 */

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

// Create a temp HOME before importing the config module so it picks up our temp dir.
const tempHome = mkdtempSync(join(tmpdir(), "podyard-test-"));
process.env.HOME = tempHome;
process.env.USERPROFILE = tempHome;

// Clear module cache so the config module re-evaluates with our temp HOME.
vi.resetModules();

const {
  loadConfig,
  saveConfig,
  resolveApiKey,
  resolveBaseUrl,
  configDir,
  configPath,
} = await import("../src/config");
const { __resetEnv } = await import("../src/env");

afterAll(() => {
  rmSync(tempHome, { recursive: true, force: true });
});

function clearEnv(name: string): void {
  // In Node.js, setting process.env.X = undefined sets the string "undefined".
  // Use Reflect.deleteProperty to truly unset the variable.
  Reflect.deleteProperty(process.env, name);
  // The env module caches its first validation; reset it so the next
  // access re-reads the (mutated) process.env.
  __resetEnv();
}

afterEach(() => {
  // Clean up env vars between tests.
  clearEnv("PODYARD_API_KEY");
  clearEnv("PODYARD_BASE_URL");
  clearEnv("PODYARD_CONFIG_DIR");
  // The env module caches the validated schema; reset it so the next
  // test re-validates against the freshly cleared process.env.
  __resetEnv();
});

describe("config module", () => {
  describe("configPath / configDir", () => {
    it("returns a path under the test HOME", () => {
      expect(configDir()).toBe(join(tempHome, ".podyard"));
      expect(configPath()).toBe(join(tempHome, ".podyard", "config.json"));
    });

    it("respects PODYARD_CONFIG_DIR when set", () => {
      const customDir = join(tempHome, "custom-config-dir");
      process.env.PODYARD_CONFIG_DIR = customDir;
      __resetEnv();
      try {
        expect(configDir()).toBe(customDir);
        expect(configPath()).toBe(join(customDir, "config.json"));
        // load/save must follow the override too.
        saveConfig({ apiKey: "pyd_test_override" });
        expect(loadConfig().apiKey).toBe("pyd_test_override");
        expect(existsSync(join(customDir, "config.json"))).toBe(true);
      } finally {
        clearEnv("PODYARD_CONFIG_DIR");
        rmSync(customDir, { recursive: true, force: true });
      }
    });
  });

  describe("loadConfig", () => {
    it("returns an empty object when config file does not exist", () => {
      const cfg = loadConfig();
      expect(cfg).toEqual({});
    });

    it("returns parsed config when file exists", () => {
      saveConfig({ apiKey: "pyd_test_abc123" });
      const cfg = loadConfig();
      expect(cfg.apiKey).toBe("pyd_test_abc123");
    });

    it("returns an empty object when config file is corrupt JSON", () => {
      mkdirSync(configDir(), { recursive: true });
      writeFileSync(configPath(), "{invalid json");
      const cfg = loadConfig();
      expect(cfg).toEqual({});
    });
  });

  describe("saveConfig", () => {
    it("creates the config directory and file", () => {
      rmSync(configDir(), { recursive: true, force: true });
      saveConfig({ apiKey: "pyd_live_xyz" });
      expect(existsSync(configDir())).toBe(true);
      expect(existsSync(configPath())).toBe(true);
    });
  });

  describe("resolveApiKey", () => {
    it("returns null when no key is configured", () => {
      clearEnv("PODYARD_API_KEY");
      rmSync(configPath(), { force: true });
      expect(resolveApiKey()).toBeNull();
    });

    it("returns the key from config when set", () => {
      clearEnv("PODYARD_API_KEY");
      saveConfig({ apiKey: "pyd_test_configkey" });
      expect(resolveApiKey()).toBe("pyd_test_configkey");
    });

    it("prefers the PODYARD_API_KEY env var over config", () => {
      process.env.PODYARD_API_KEY = "pyd_live_envkey";
      __resetEnv();
      saveConfig({ apiKey: "pyd_test_configkey" });
      expect(resolveApiKey()).toBe("pyd_live_envkey");
    });
  });

  describe("resolveBaseUrl", () => {
    it("returns undefined when nothing is set", () => {
      clearEnv("PODYARD_BASE_URL");
      rmSync(configPath(), { force: true });
      expect(resolveBaseUrl()).toBeUndefined();
    });

    it("returns the URL from config when set", () => {
      clearEnv("PODYARD_BASE_URL");
      saveConfig({ baseUrl: "http://localhost:3000" });
      expect(resolveBaseUrl()).toBe("http://localhost:3000");
    });

    it("prefers PODYARD_BASE_URL env var over config", () => {
      process.env.PODYARD_BASE_URL = "http://env-url:3001";
      __resetEnv();
      saveConfig({ baseUrl: "http://config-url:3000" });
      expect(resolveBaseUrl()).toBe("http://env-url:3001");
    });
  });
});
