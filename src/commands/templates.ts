/**
 * `podyard templates list|get|create|delete`
 */

import type { CreateTemplateRequest, Podyard } from "@podyard/sdk";
import type { Command } from "commander";

interface Ctx {
  client: () => Podyard;
  print: (value: unknown, json: boolean, human?: () => void) => void;
}

export function registerTemplateCommands(program: Command, ctx: Ctx): void {
  const tpls = program.command("templates").description("Manage templates");

  tpls
    .command("list")
    .description("List templates")
    .option("--json", "output as JSON")
    .action(async (_args: Record<string, unknown>, cmd: Command) => {
      const json = !!cmd.optsWithGlobals().json;
      const res = await ctx.client().templates.list();
      ctx.print(res, json, () => {
        if (res.items.length === 0) {
          console.log("No templates.");
        }
        for (const t of res.items) {
          console.log(`${t.id}  ${t.name}  ${t.visibility}  ${t.snapshotId}`);
        }
      });
    });

  tpls
    .command("get <id>")
    .description("Get template details")
    .option("--json", "output as JSON")
    .action(
      async (id: string, _args: Record<string, unknown>, cmd: Command) => {
        const json = !!cmd.optsWithGlobals().json;
        const t = await ctx.client().templates.get(id);
        ctx.print(t, json, () => {
          console.log(`id:          ${t.id}`);
          console.log(`name:        ${t.name}`);
          console.log(`snapshot:    ${t.snapshotId}`);
          console.log(`visibility:  ${t.visibility}`);
          if (t.description) {
            console.log(`description: ${t.description}`);
          }
        });
      }
    );

  tpls
    .command("create <name> <snapshotId>")
    .description("Create a template from a snapshot")
    .option("--description <desc>", "template description")
    .option("--visibility <vis>", "private | public", "private")
    .option("--json", "output as JSON")
    .action(
      async (
        name: string,
        snapshotId: string,
        opts: { description?: string; visibility?: string },
        cmd: Command
      ) => {
        const json = !!cmd.optsWithGlobals().json;
        const body: CreateTemplateRequest = { name, snapshotId };
        if (opts.description) {
          body.description = opts.description;
        }
        if (opts.visibility) {
          body.visibility = opts.visibility as "private" | "public";
        }
        const t = await ctx.client().templates.create(body);
        ctx.print(t, json, () =>
          console.log(`Created template ${t.id} (${t.name})`)
        );
      }
    );

  tpls
    .command("delete <id>")
    .description("Delete a template")
    .option("--json", "output as JSON")
    .action(
      async (id: string, _args: Record<string, unknown>, cmd: Command) => {
        const json = !!cmd.optsWithGlobals().json;
        await ctx.client().templates.delete(id);
        ctx.print({ ok: true, id }, json, () => console.log(`Deleted ${id}`));
      }
    );
}
