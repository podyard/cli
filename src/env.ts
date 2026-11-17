/**
 * Validated process environment.
 *
 * Uses @t3-oss/env-core + zod so every env var the CLI reads is
 * type-checked and validated exactly once. The rest of the codebase
 * reads from `env()` only — never from `process.env` directly.
 */

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const envSchema = z.object({
  /** API key. Falls back to ~/.podyard/config.json when unset. */
  PODYARD_API_KEY: z.string().optional(),
  /** Override the Podyard API base URL. Defaults to the SDK default. */
  PODYARD_BASE_URL: z.string().url().optional(),
  /** Override the config directory (~/.podyard by default). */
  PODYARD_CONFIG_DIR: z.string().optional(),
});

let cached: z.infer<typeof envSchema> | undefined;

/**
 * Returns the validated environment. Cached after first access so
 * validation runs exactly once per process.
 *
 * Tests that mutate `process.env` mid-run must call `__resetEnv()`
 * (exposed for tests) to force re-validation.
 */
export function env(): z.infer<typeof envSchema> {
  if (!cached) {
    cached = validate(process.env);
  }
  return cached;
}

/** Convert a zod object schema into a plain record of its field schemas. */
function toDictionary(
  schema: typeof envSchema
): Record<string, z.ZodType<string | undefined>> {
  const { PODYARD_API_KEY, PODYARD_BASE_URL, PODYARD_CONFIG_DIR } =
    schema.shape;
  return {
    PODYARD_API_KEY: PODYARD_API_KEY as z.ZodType<string | undefined>,
    PODYARD_BASE_URL: PODYARD_BASE_URL as z.ZodType<string | undefined>,
    PODYARD_CONFIG_DIR: PODYARD_CONFIG_DIR as z.ZodType<string | undefined>,
  };
}

function validate(raw: NodeJS.ProcessEnv): z.infer<typeof envSchema> {
  return createEnv({
    server: toDictionary(envSchema),
    /** Validate against the provided object, not the live process.env. */
    runtimeEnv: raw,
    /**
     * A CLI must die immediately on an invalid value (e.g. a malformed
     * URL) instead of silently falling back.
     */
    onValidationError: (issues) => {
      const lines = issues.map(
        (issue) => `  ${issue.path?.join(".") ?? "(root)"}: ${issue.message}`
      );
      console.error(`❌ Invalid environment variables:\n${lines.join("\n")}`);
      process.exit(1);
    },
  }) as unknown as z.infer<typeof envSchema>;
}

/** Re-validate against the current process.env. Exported for tests only. */
export function __resetEnv(): void {
  cached = undefined;
}
