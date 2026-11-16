/**
 * `podyard snapshots get|fork`
 *
 * Note: list and delete are not yet supported by the engine.
 */

import type { PodyardClient } from "@podyard/sdk";
import type { Command } from "commander";

interface Ctx {
  client: () => PodyardClient;
  print: (value: unknown, json: boolean, human?: () => void) => void;
}

export function registerSnapshotCommands(program: Command, ctx: Ctx): void {
  const snaps = program.command("snapshots").description("Manage snapshots");

  snaps
    .command("get <id>")
    .description("Get snapshot details")
    .option("--json", "output as JSON")
    .action(
      async (id: string, _args: Record<string, unknown>, cmd: Command) => {
        const json = !!cmd.optsWithGlobals().json;
        const snap = await ctx.client().snapshots.get(id);
        ctx.print(snap, json, () => {
          console.log(`id:       ${snap.id}`);
          console.log(`pod:      ${snap.podId}`);
          console.log(`size:     ${snap.sizeBytes ?? "?"} bytes`);
          console.log(`created:  ${snap.createdAt}`);
        });
      }
    );

  snaps
    .command("fork <id>")
    .description("Fork a snapshot into N pods")
    .option("--n <count>", "number of pods (1-64)", "1")
    .option("--json", "output as JSON")
    .action(async (id: string, opts: { n?: string }, cmd: Command) => {
      const json = !!cmd.optsWithGlobals().json;
      const count = Number.parseInt(opts.n ?? "1", 10);
      const res = await ctx.client().snapshots.fork(id, { count });
      ctx.print(res, json, () => {
        for (const p of res.children) {
          console.log(`${p.id}  ${p.status}`);
        }
      });
    });
}
