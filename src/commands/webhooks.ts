/**
 * `podyard webhooks ...` — manage API webhooks.
 */

import type {
  CreateWebhookRequest,
  PodyardClient,
  Webhook,
} from "@podyard/sdk";
import type { Command } from "commander";

interface Ctx {
  client: () => PodyardClient;
  print: (value: unknown, json: boolean, human?: () => void) => void;
}

function printWebhooks(res: { items: Webhook[] }, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(res, null, 2));
    return;
  }
  if (res.items.length === 0) {
    console.log("No webhooks.");
    return;
  }
  for (const w of res.items) {
    console.log(
      `${w.id}  ${w.active ? "active" : "disabled"}  ${w.url}  [${w.events.join(", ")}]`
    );
  }
}

function printWebhook(w: Webhook, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(w, null, 2));
    return;
  }
  console.log(`id:        ${w.id}`);
  console.log(`url:       ${w.url}`);
  console.log(`events:    ${w.events.join(", ")}`);
  console.log(`active:    ${w.active}`);
  console.log(`created:   ${w.createdAt}`);
}

export function registerWebhookCommands(program: Command, ctx: Ctx): void {
  const wh = program.command("webhooks").description("Manage API webhooks");

  wh.command("list")
    .description("List webhooks")
    .option("--limit <n>", "max items", (v: string) => Number.parseInt(v, 10))
    .option("--cursor <cursor>", "pagination cursor")
    .option("--json", "output as JSON")
    .action(async (opts: { limit?: number; cursor?: string }, cmd: Command) => {
      const json = !!cmd.optsWithGlobals().json;
      const res = await ctx.client().webhooks.list({
        ...(opts.limit ? { limit: opts.limit } : {}),
        ...(opts.cursor ? { cursor: opts.cursor } : {}),
      });
      printWebhooks(res, json);
    });

  wh.command("create <url>")
    .description("Create a webhook")
    .requiredOption(
      "--events <list>",
      "comma-separated event names, e.g. pod.created,pod.destroyed"
    )
    .option("--inactive", "create the webhook in a disabled state")
    .option("--json", "output as JSON")
    .action(
      async (
        url: string,
        opts: { events: string; inactive?: boolean },
        cmd: Command
      ) => {
        const json = !!cmd.optsWithGlobals().json;
        const body: CreateWebhookRequest = {
          url,
          events: opts.events
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };
        if (opts.inactive) {
          body.active = false;
        }
        if (body.events.length === 0) {
          console.error("--events must list at least one event name");
          process.exit(1);
        }
        const webhook = await ctx.client().webhooks.create(body);
        printWebhook(webhook, json);
      }
    );

  wh.command("get <id>")
    .description("Get webhook details")
    .option("--json", "output as JSON")
    .action(
      async (id: string, _args: Record<string, unknown>, cmd: Command) => {
        const json = !!cmd.optsWithGlobals().json;
        const webhook = await ctx.client().webhooks.get(id);
        printWebhook(webhook, json);
      }
    );

  wh.command("delete <id>")
    .description("Delete a webhook")
    .option("--json", "output as JSON")
    .action(
      async (id: string, _args: Record<string, unknown>, cmd: Command) => {
        const json = !!cmd.optsWithGlobals().json;
        await ctx.client().webhooks.delete(id);
        ctx.print({ ok: true, id }, json, () => console.log(`Deleted ${id}`));
      }
    );
}
