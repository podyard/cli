/**
 * `podyard pods ...` — lifecycle, exec, fs, snapshot, fork, sleep/wake.
 */

import { readFileSync } from "node:fs";
import type {
  CreatePodRequest,
  CreateSnapshotRequest,
  ExecRequest,
  Podyard,
} from "@podyard/sdk";
import type { Command } from "commander";

interface Ctx {
  client: () => Podyard;
  print: (value: unknown, json: boolean, human?: () => void) => void;
}

export function registerPodCommands(program: Command, ctx: Ctx): void {
  const pods = program.command("pods").description("Manage pods");

  pods
    .command("list")
    .description("List pods")
    .option("--json", "output as JSON")
    .action(async (_args: Record<string, unknown>, cmd: Command) => {
      const json = !!cmd.optsWithGlobals().json;
      const res = await ctx.client().pods.list();
      ctx.print(res, json, () => {
        if (res.items.length === 0) {
          console.log("No pods.");
        }
        for (const p of res.items) {
          console.log(`${p.id}  ${p.status.padEnd(9)}  ${p.name}`);
        }
      });
    });

  pods
    .command("create")
    .description("Create a pod")
    .option("-n, --name <name>", "pod name")
    .option("--template <id>", "template ID")
    .option("--json", "output as JSON")
    .action(
      async (opts: { name?: string; template?: string }, cmd: Command) => {
        const json = !!cmd.optsWithGlobals().json;
        const body: CreatePodRequest = {};
        if (opts.name) {
          body.name = opts.name;
        }
        if (opts.template) {
          body.templateId = opts.template;
        }
        const pod = await ctx.client().pods.create(body);
        ctx.print(pod, json, () =>
          console.log(`${pod.id}  ${pod.status}  ${pod.name}`)
        );
      }
    );

  pods
    .command("get <id>")
    .description("Get pod details")
    .option("--json", "output as JSON")
    .action(
      async (id: string, _args: Record<string, unknown>, cmd: Command) => {
        const json = !!cmd.optsWithGlobals().json;
        const pod = await ctx.client().pods.get(id);
        ctx.print(pod, json, () => {
          console.log(`id:       ${pod.id}`);
          console.log(`name:     ${pod.name}`);
          console.log(`status:   ${pod.status}`);
          console.log(`created:  ${pod.createdAt}`);
        });
      }
    );

  pods
    .command("destroy <id>")
    .description("Destroy a pod")
    .option("--json", "output as JSON")
    .action(
      async (id: string, _args: Record<string, unknown>, cmd: Command) => {
        const json = !!cmd.optsWithGlobals().json;
        await ctx.client().pods.delete(id);
        ctx.print({ ok: true, id }, json, () => console.log(`Destroyed ${id}`));
      }
    );

  pods
    .command("exec <id> [argv...]")
    .description("Run a command in a pod")
    .option("--cwd <dir>", "working directory")
    .option("--env <K=V>", "environment variable (repeatable)", collectEnv, {})
    .option("--timeout <seconds>", "timeout in seconds")
    .option("--json", "output as JSON")
    .action(
      async (
        id: string,
        argv: string[],
        opts: {
          cwd?: string;
          env: Record<string, string>;
          timeout?: string;
        },
        cmd: Command
      ) => {
        const json = !!cmd.optsWithGlobals().json;
        const body: ExecRequest = { argv };
        if (opts.cwd) {
          body.cwd = opts.cwd;
        }
        if (Object.keys(opts.env).length > 0) {
          body.env = opts.env;
        }
        if (opts.timeout) {
          body.timeoutSeconds = Number.parseInt(opts.timeout, 10);
        }
        const result = await ctx.client().pods.exec(id, body);
        ctx.print(result, json, () => {
          process.stdout.write(result.stdout);
          if (result.stderr) {
            process.stderr.write(result.stderr);
          }
          console.log(`exit code: ${result.exitCode} (${result.durationMs}ms)`);
          process.exitCode = result.exitCode;
        });
      }
    );

  const fs = pods.command("fs").description("File operations on a pod");

  fs.command("read <id> <path>")
    .description("Read a file from a pod")
    .option("--json", "output as JSON")
    .action(
      async (
        id: string,
        path: string,
        _args: Record<string, unknown>,
        cmd: Command
      ) => {
        const json = !!cmd.optsWithGlobals().json;
        const res = await ctx.client().pods.fs.read(id, path);
        const text = Buffer.from(res).toString("utf-8");
        ctx.print(res, json, () => process.stdout.write(text));
      }
    );

  fs.command("write <id> <path>")
    .description("Write a file to a pod (content from stdin)")
    .option("--json", "output as JSON")
    .action(
      async (
        id: string,
        path: string,
        _opts: Record<string, unknown>,
        cmd: Command
      ) => {
        const json = !!cmd.optsWithGlobals().json;
        const content = readStdin();
        await ctx.client().pods.fs.write(id, path, content);
        ctx.print({ ok: true, path, bytes: content.length }, json, () =>
          console.log(`Wrote ${content.length} bytes to ${path}`)
        );
      }
    );

  fs.command("delete <id> <path>")
    .description("Delete a file from a pod")
    .option("--json", "output as JSON")
    .action(
      async (
        id: string,
        path: string,
        _args: Record<string, unknown>,
        cmd: Command
      ) => {
        const json = !!cmd.optsWithGlobals().json;
        await ctx.client().pods.fs.delete(id, path);
        ctx.print({ ok: true }, json, () => console.log(`Deleted ${path}`));
      }
    );

  pods
    .command("snapshot <id>")
    .description("Create a snapshot of a pod")
    .option("--name <name>", "snapshot name")
    .option("--json", "output as JSON")
    .action(async (id: string, opts: { name?: string }, cmd: Command) => {
      const json = !!cmd.optsWithGlobals().json;
      const body: CreateSnapshotRequest = {};
      if (opts.name) {
        body.name = opts.name;
      }
      const snap = await ctx.client().pods.snapshot(id, body);
      ctx.print(snap, json, () =>
        console.log(`${snap.id}  ${snap.sizeBytes ?? "?"} bytes`)
      );
    });

  pods
    .command("snapshots <id>")
    .description("List snapshots of a pod")
    .option("--limit <n>", "max items", (v: string) => Number.parseInt(v, 10))
    .option("--cursor <cursor>", "pagination cursor")
    .option("--json", "output as JSON")
    .action(
      async (
        id: string,
        opts: { limit?: number; cursor?: string },
        cmd: Command
      ) => {
        const json = !!cmd.optsWithGlobals().json;
        const res = await ctx.client().pods.listSnapshots(id, {
          ...(opts.limit ? { limit: opts.limit } : {}),
          ...(opts.cursor ? { cursor: opts.cursor } : {}),
        });
        ctx.print(res, json, () => {
          if (res.items.length === 0) {
            console.log(`No snapshots for ${id}.`);
            return;
          }
          for (const s of res.items) {
            console.log(`${s.id}  ${s.sizeBytes ?? "?"} bytes  ${s.createdAt}`);
          }
        });
      }
    );

  pods
    .command("fork <id>")
    .description("Fork a pod into N clones")
    .option("--n <count>", "number of clones (1-64)", "1")
    .option("--json", "output as JSON")
    .action(async (id: string, opts: { n?: string }, cmd: Command) => {
      const json = !!cmd.optsWithGlobals().json;
      const count = Number.parseInt(opts.n ?? "1", 10);
      const res = await ctx.client().pods.fork(id, { count });
      ctx.print(res, json, () => {
        for (const p of res.children) {
          console.log(`${p.id}  ${p.status}`);
        }
      });
    });

  pods
    .command("sleep <id>")
    .description("Put a pod to sleep (experimental)")
    .option("--json", "output as JSON")
    .action(
      async (id: string, _args: Record<string, unknown>, cmd: Command) => {
        const json = !!cmd.optsWithGlobals().json;
        const pod = await ctx.client().pods.sleep(id);
        ctx.print(pod, json, () => console.log(`${id} is now ${pod.status}`));
      }
    );

  pods
    .command("wake <id>")
    .description("Wake a sleeping pod (experimental)")
    .option("--json", "output as JSON")
    .action(
      async (id: string, _args: Record<string, unknown>, cmd: Command) => {
        const json = !!cmd.optsWithGlobals().json;
        const pod = await ctx.client().pods.wake(id);
        ctx.print(pod, json, () => console.log(`${id} is now ${pod.status}`));
      }
    );
}

function collectEnv(
  value: string,
  acc: Record<string, string>
): Record<string, string> {
  const idx = value.indexOf("=");
  if (idx === -1) {
    console.error(`Invalid env format: ${value} (expected K=V)`);
    process.exit(1);
  }
  acc[value.slice(0, idx)] = value.slice(idx + 1);
  return acc;
}

function readStdin(): string {
  return readFileSync(0, "utf-8");
}
