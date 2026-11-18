/**
 * `podyard usage list`
 */

import type { Podyard } from "@podyard/sdk";
import type { Command } from "commander";

interface Ctx {
  client: () => Podyard;
  print: (value: unknown, json: boolean, human?: () => void) => void;
}

export function registerUsageCommands(program: Command, ctx: Ctx): void {
  const usage = program.command("usage").description("View usage events");

  usage
    .command("list")
    .description("List recent usage events")
    .option("--json", "output as JSON")
    .action(async (_args: Record<string, unknown>, cmd: Command) => {
      const json = !!cmd.optsWithGlobals().json;
      const res = await ctx.client().usage.list();
      ctx.print(res, json, () => {
        if (res.items.length === 0) {
          console.log("No usage events.");
        }
        for (const e of res.items) {
          console.log(
            `${e.id}  ${e.eventType.padEnd(12)}  ${e.amount} ${e.billingUnit}  ${e.createdAt}`
          );
        }
      });
    });
}
