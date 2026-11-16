/**
 * `podyard limits` — show plan limits and current usage.
 */

import type { PodyardClient } from "@podyard/sdk";
import type { Command } from "commander";

interface Ctx {
  client: () => PodyardClient;
  print: (value: unknown, json: boolean, human?: () => void) => void;
}

export function registerLimitCommands(program: Command, ctx: Ctx): void {
  program
    .command("limits")
    .description("Show plan limits and current usage")
    .option("--json", "output as JSON")
    .action(async (_args: Record<string, unknown>, cmd: Command) => {
      const json = !!cmd.optsWithGlobals().json;
      const res = await ctx.client().limits.get();
      ctx.print(res, json, () => {
        const p = res.plan;
        const u = res.currentUsage;
        console.log(
          `Plan:     ${p.name} ($${(p.priceMonthlyCents / 100).toFixed(2)}/mo)`
        );
        console.log("");
        console.log("Limit                          Current      Max");
        console.log("─────────────────────────────  ───────────  ───");
        console.log(
          `Concurrent pods                ${String(u.concurrentPods).padEnd(12)}  ${p.limits.maxConcurrentPods}`
        );
        console.log(
          `Snapshots                      ${String(u.snapshots).padEnd(12)}  ${p.limits.maxSnapshotCount}`
        );
        console.log(
          `Execs today                    ${String(u.execsToday).padEnd(12)}  (rate: ${p.limits.rateLimitRpm} rpm)`
        );
        console.log(
          `Webhooks                       ${String(u.webhooks).padEnd(12)}  ${p.limits.webhooksPerKey}`
        );
        console.log("");
        console.log(`Exec timeout:        ${p.limits.execTimeoutSeconds}s`);
        console.log(`Max pod size:        ${p.limits.maxPodSizeGb} GB`);
        console.log(`Max file size:       ${p.limits.fsMaxFileSizeMb} MB`);
        console.log(`Pod lifetime:        ${p.limits.maxLifetimeHours}h`);
        console.log(`Sleep after:         ${p.limits.sleepAfterMinutes} min`);
      });
    });
}
