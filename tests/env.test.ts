/**
 * Unit tests for the validated environment module (src/env.ts).
 */

import { afterEach, describe, expect, it, vi } from "vitest";

const { __resetEnv, env } = await import("../src/env");

function setEnv(name: string, value: string): void {
  process.env[name] = value;
  __resetEnv();
}

function clearEnv(name: string): void {
  Reflect.deleteProperty(process.env, name);
  __resetEnv();
}

afterEach(() => {
  clearEnv("PODYARD_API_KEY");
  clearEnv("PODYARD_BASE_URL");
  clearEnv("PODYARD_CONFIG_DIR");
});

describe("env", () => {
  it("returns undefined for unset optional vars", () => {
    const e = env();
    expect(e.PODYARD_API_KEY).toBeUndefined();
    expect(e.PODYARD_BASE_URL).toBeUndefined();
    expect(e.PODYARD_CONFIG_DIR).toBeUndefined();
  });

  it("exposes valid values", () => {
    setEnv("PODYARD_API_KEY", "pyd_live_123");
    setEnv("PODYARD_BASE_URL", "https://api.example.com");
    setEnv("PODYARD_CONFIG_DIR", "/tmp/podyard-config");
    const e = env();
    expect(e.PODYARD_API_KEY).toBe("pyd_live_123");
    expect(e.PODYARD_BASE_URL).toBe("https://api.example.com");
    expect(e.PODYARD_CONFIG_DIR).toBe("/tmp/podyard-config");
  });

  it("caches after the first read (same object identity)", () => {
    setEnv("PODYARD_API_KEY", "pyd_live_cache");
    expect(env()).toBe(env());
  });

  it("re-reads process.env after __resetEnv()", () => {
    setEnv("PODYARD_API_KEY", "pyd_live_a");
    expect(env().PODYARD_API_KEY).toBe("pyd_live_a");
    setEnv("PODYARD_API_KEY", "pyd_live_b");
    expect(env().PODYARD_API_KEY).toBe("pyd_live_b");
  });

  it("rejects an empty PODYARD_BASE_URL (invalid URL)", () => {
    const spy = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("exited");
    }) as never);
    process.env.PODYARD_BASE_URL = "not a url";
    __resetEnv();
    expect(() => env()).toThrow("exited");
    expect(spy).toHaveBeenCalledWith(1);
    spy.mockRestore();
  });

  it("rejects a malformed PODYARD_BASE_URL", () => {
    const spy = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("exited");
    }) as never);
    process.env.PODYARD_BASE_URL = "://nope";
    __resetEnv();
    expect(() => env()).toThrow("exited");
    expect(spy).toHaveBeenCalledWith(1);
    spy.mockRestore();
  });
});
