/**
 * `podyard keys list|create|revoke`
 */

import type { CreateApiKeyRequest, PodyardClient } from "@podyard/sdk";
import type { Command } from "commander";

interface Ctx {
  client: () => PodyardClient;
  print: (value: unknown, json: boolean, human?: () => void) => void;
}

export function registerKeyCommands(program: Command, ctx: Ctx): void {
  const keys = program.command("keys").description("Manage API keys");

  keys
    .command("list")
    .description("List API keys")
    .option("--json", "output as JSON")
    .action(async (_args: Record<string, unknown>, cmd: Command) => {
      const json = !!cmd.optsWithGlobals().json;
      const res = await ctx.client().keys.list();
      ctx.print(res, json, () => {
        if (res.items.length === 0) {
          console.log("No API keys.");
        }
        for (const k of res.items) {
          console.log(
            `${k.id}  ${k.kind}  ${k.plan.padEnd(8)}  ${k.label}  ${k.revokedAt ? "revoked" : "active"}`
          );
        }
      });
    });

  keys
    .command("create")
    .description("Create a new API key (full key shown once)")
    .option("--label <label>", "key label")
    .option("--kind <kind>", "live | test", "live")
    .option("--json", "output as JSON")
    .action(async (opts: { label?: string; kind?: string }, cmd: Command) => {
      const json = !!cmd.optsWithGlobals().json;
      const body: CreateApiKeyRequest = {};
      if (opts.label) {
        body.label = opts.label;
      }
      if (opts.kind) {
        body.kind = opts.kind as "live" | "test";
      }
      const res = await ctx.client().keys.create(body);
      ctx.print(res, json, () => {
        console.log(`${res.id}  ${res.kind}  ${res.label}`);
        console.log(`key: ${res.key}`);
        console.log("\nThe full key is shown only once. Store it now.");
      });
    });

  keys
    .command("revoke <id>")
    .description("Revoke (delete) an API key")
    .option("--json", "output as JSON")
    .action(
      async (id: string, _args: Record<string, unknown>, cmd: Command) => {
        const json = !!cmd.optsWithGlobals().json;
        await ctx.client().keys.revoke(id);
        ctx.print({ ok: true, id }, json, () => console.log(`Revoked ${id}`));
      }
    );
}
